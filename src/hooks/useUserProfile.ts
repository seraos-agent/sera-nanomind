import { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from '../services/localSocket';
import { getApiBaseUrl } from '../utils/platform';
import {
  clearProfileLocalCache,
  deleteUserProfileApi,
  extractLegacyLocalProfile,
  fetchUserProfileApi,
  syncProfileToLocalCache,
  updateUserProfileApi,
  type UserProfileDTO,
  type UserProfileUpdatePayload,
} from '../utils/profileSync';

interface UseUserProfileParams {
  socket: Socket | null;
  sessionToken: string | null;
  userEmail: string | null;
  isBypassed: boolean;
}

export function useUserProfile({
  socket,
  sessionToken,
  userEmail,
  isBypassed,
}: UseUserProfileParams) {
  const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfilePersisted, setIsProfilePersisted] = useState(false);

  const migratedScopeRef = useRef<string | null>(null);

  const applyServerProfile = useCallback((profile: UserProfileDTO, persisted: boolean) => {
    setUserProfile(profile);
    setIsProfilePersisted(persisted);
    if (persisted) {
      syncProfileToLocalCache(profile);
    } else if (profile.email) {
      // Ensure login email is cached without overwriting empty fields unnecessarily
      localStorage.setItem('sera_user_email', profile.email);
      localStorage.setItem('sera_saved_email', profile.email);
    }
  }, []);

  // Hydrate via REST when authenticated or bypassed, and run one-time legacy migration
  useEffect(() => {
    const scopeKey = isBypassed ? 'dev' : (sessionToken && userEmail ? `email:${userEmail}` : null);
    if (!scopeKey) {
      setUserProfile(null);
      setIsProfilePersisted(false);
      return;
    }

    let cancelled = false;
    setIsProfileLoading(true);

    const auth = { sessionToken, isBypassed };

    fetchUserProfileApi(auth)
      .then(async ({ persisted, profile }) => {
        if (cancelled) return;

        if (!persisted && migratedScopeRef.current !== scopeKey) {
          migratedScopeRef.current = scopeKey;
          const legacy = extractLegacyLocalProfile();
          if (legacy.hasAnyData) {
            try {
              const patch = { ...legacy.patch };
              if (legacy.legacyAvatarDataUrl) {
                const uploadRes = await fetch(`${getApiBaseUrl()}/api/upload/media`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    dataUrl: legacy.legacyAvatarDataUrl,
                    filename: `avatar_${Date.now()}.jpg`,
                    sessionId: profile.userId || scopeKey,
                    subFolder: 'avatars',
                  }),
                });
                const uploadData = await uploadRes.json().catch(() => null);
                if (uploadData?.success && uploadData?.url && !String(uploadData.url).startsWith('blob:')) {
                  patch.avatarUrl = uploadData.url;
                  if (uploadData.fileKey) {
                    patch.avatarFileKey = uploadData.fileKey;
                  }
                }
              }

              if (Object.keys(patch).length > 0) {
                const migratedProfile = await updateUserProfileApi(auth, patch);
                if (!cancelled) {
                  applyServerProfile(migratedProfile, true);
                  return;
                }
              }
            } catch (migErr) {
              console.warn('[useUserProfile] Legacy profile migration skipped:', migErr);
            }
          }
        }

        if (!cancelled) {
          applyServerProfile(profile, persisted);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[useUserProfile] Failed to load user profile:', err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionToken, userEmail, isBypassed, applyServerProfile]);

  // Listen for live cross-device/socket profile updates
  useEffect(() => {
    if (!socket) return;

    const handleProfileUpdate = (payload: { persisted?: boolean; profile?: UserProfileDTO }) => {
      if (!payload?.profile) return;
      applyServerProfile(payload.profile, Boolean(payload.persisted));
    };

    const handleProfileDeleted = () => {
      clearProfileLocalCache({ clearSavedEmail: true });
      setUserProfile(null);
      setIsProfilePersisted(false);
    };

    socket.on('profile:update', handleProfileUpdate);
    socket.on('profile:deleted', handleProfileDeleted);

    return () => {
      socket.off('profile:update', handleProfileUpdate);
      socket.off('profile:deleted', handleProfileDeleted);
    };
  }, [socket, applyServerProfile]);

  const updateProfile = useCallback(
    async (patch: UserProfileUpdatePayload): Promise<UserProfileDTO> => {
      const saved = await updateUserProfileApi({ sessionToken, isBypassed }, patch);
      applyServerProfile(saved, true);
      return saved;
    },
    [sessionToken, isBypassed, applyServerProfile]
  );

  const deleteAccount = useCallback(async (): Promise<void> => {
    await deleteUserProfileApi({ sessionToken, isBypassed });
    clearProfileLocalCache({ clearSavedEmail: true });
    migratedScopeRef.current = null;
    setUserProfile(null);
    setIsProfilePersisted(false);
  }, [sessionToken, isBypassed]);

  const resetProfile = useCallback(() => {
    migratedScopeRef.current = null;
    setUserProfile(null);
    setIsProfilePersisted(false);
  }, []);

  return {
    userProfile,
    isProfileLoading,
    isProfilePersisted,
    updateProfile,
    deleteAccount,
    resetProfile,
  };
}
