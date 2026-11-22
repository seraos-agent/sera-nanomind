import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseVoiceRealtimeOptions {
  apiUrl: string;
  onActiveChange?: (active: boolean) => void;
  onError?: (err: Error) => void;
}

/**
 * useVoiceRealtime - Manages direct browser-to-OpenAI WebRTC Realtime audio session.
 * 
 * Fetches an ephemeral client secret from SERA Core backend (/api/voice/session),
 * then connects full-duplex microphone and audio output via RTCPeerConnection.
 * 
 * Enforces Rule 7 (Universal Codebase Language: English Standard).
 */
export function useVoiceRealtime({ apiUrl, onActiveChange, onError }: UseVoiceRealtimeOptions) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const stop = useCallback(() => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        pcRef.current.close();
        pcRef.current = null;
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.srcObject = null;
      }
    } catch (cleanupErr) {
      console.warn('[useVoiceRealtime] Error during cleanup:', cleanupErr);
    } finally {
      setIsActive(false);
      setIsConnecting(false);
      onActiveChange?.(false);
    }
  }, [onActiveChange]);

  const start = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // 1. Obtain ephemeral token from SERA-CORE backend
      const tokenRes = await fetch(`${apiUrl}/api/voice/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create voice session (${tokenRes.status})`);
      }

      const sessionData = await tokenRes.json();
      const ephemeralKey = sessionData.client_secret;
      const model = sessionData.model || 'gpt-realtime-2.1';

      if (!ephemeralKey) {
        throw new Error('Server did not return a valid ephemeral client secret');
      }

      // 2. Request user microphone with full hardware AEC and noise suppression
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Vendor-specific AEC hints for mobile and desktop browsers
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true
        } as MediaTrackConstraints
      });
      mediaStreamRef.current = mediaStream;

      // 3. Prepare audio output element
      let audioEl = document.getElementById('sera-realtime-audio') as HTMLAudioElement;
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = 'sera-realtime-audio';
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
      }
      audioElRef.current = audioEl;

      // 4. Create WebRTC Peer Connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Attach incoming remote stream to audio element
      pc.ontrack = (event) => {
        if (audioElRef.current && event.streams[0]) {
          audioElRef.current.srcObject = event.streams[0];
          audioElRef.current.play().catch((err) => {
            console.warn('[useVoiceRealtime] Autoplay check:', err);
          });
        }
      };

      // Add local microphone audio track to WebRTC
      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream);
      });

      // 5. Open Data Channel for Realtime events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log('[useVoiceRealtime] Data channel established with OpenAI Realtime');
        // Trigger Sera to greet the user warmly in English immediately upon connect
        setTimeout(() => {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'response.create',
              response: {
                instructions: 'Greet the user warmly and cheerfully in English in one brief sentence: "Hi! I am SERA. How can I help you with your store today?"'
              }
            }));
          }
        }, 150);
      };

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // User started speaking -> instantly halt previous response and clear buffers
          if (msg.type === 'input_audio_buffer.speech_started') {
            console.log('[useVoiceRealtime] Interruption detected: canceling response and clearing buffers');
            if (dc.readyState === 'open') {
              dc.send(JSON.stringify({ type: 'response.cancel' }));
              dc.send(JSON.stringify({ type: 'output_audio_buffer.clear' }));
            }
            if (audioElRef.current) {
              audioElRef.current.pause();
              audioElRef.current.currentTime = 0;
            }
          }
        } catch (_) {}
      };

      // Handle connection failures
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          stop();
        }
      };

      // 6. Generate SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 7. Post Offer to OpenAI Realtime Calls endpoint
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime/calls?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`OpenAI Realtime WebRTC rejected offer (${sdpResponse.status}): ${errorText}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });

      setIsActive(true);
      setIsConnecting(false);
      onActiveChange?.(true);
    } catch (err: any) {
      console.error('[useVoiceRealtime] Connection failed:', err);
      setError(err.message || 'Failed to establish voice connection');
      stop();
      onError?.(err);
    }
  }, [apiUrl, onActiveChange, onError, stop]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isActive,
    isConnecting,
    error,
    start,
    stop,
    toggle: () => (isActive ? stop() : start())
  };
}
