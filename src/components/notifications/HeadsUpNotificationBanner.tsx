import React, { useState, useEffect, useRef } from 'react';
import { Store, Truck, Package, ChevronRight, X } from 'lucide-react';
import type { ThemeType } from '../../theme';
import {
  type DirectNotificationPayload,
  executeDeepLink,
} from '../../utils/notificationService';

interface HeadsUpNotificationBannerProps {
  theme: ThemeType;
  isMobileView?: boolean;
}

export const HeadsUpNotificationBanner: React.FC<HeadsUpNotificationBannerProps> = ({
  theme,
  isMobileView = false,
}) => {
  const [activeNotification, setActiveNotification] = useState<DirectNotificationPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<DirectNotificationPayload>;
      const payload = customEvent.detail;
      if (!payload) return;

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      setActiveNotification(payload);
      setIsVisible(true);

      dismissTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setActiveNotification(null), 300);
      }, 5500);
    };

    window.addEventListener('sera:heads-up-notification', handleNotification);
    return () => {
      window.removeEventListener('sera:heads-up-notification', handleNotification);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  if (!activeNotification) return null;

  const handleBannerClick = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setIsVisible(false);
    executeDeepLink(activeNotification.deepLink);
    setTimeout(() => setActiveNotification(null), 300);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setIsVisible(false);
    setTimeout(() => setActiveNotification(null), 300);
  };

  // Determine accent color and icon based on notification type
  let badgeBg = 'rgba(59, 130, 246, 0.16)';
  let badgeColor = '#3B82F6';
  let IconComponent = Package;

  if (activeNotification.type === 'merchant_order') {
    badgeBg = 'rgba(245, 158, 11, 0.16)';
    badgeColor = '#F59E0B';
    IconComponent = Store;
  } else if (activeNotification.type === 'courier_delivery') {
    badgeBg = 'rgba(16, 185, 129, 0.16)';
    badgeColor = '#10B981';
    IconComponent = Truck;
  } else if (activeNotification.type === 'buyer_order') {
    badgeBg = 'rgba(59, 130, 246, 0.16)';
    badgeColor = '#3B82F6';
    IconComponent = Package;
  }

  return (
    <div
      onClick={handleBannerClick}
      style={{
        position: 'fixed',
        top: isVisible ? (isMobileView ? 12 : 20) : -120,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: isMobileView ? 'calc(100% - 24px)' : 'auto',
        minWidth: isMobileView ? undefined : 380,
        maxWidth: 520,
        background: theme.isDark ? '#0F172A' : '#1E293B',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: 18,
        padding: '10px 14px 10px 12px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.38), 0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: badgeBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <IconComponent size={20} color={badgeColor} />
      </div>

      {/* Text Info */}
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeNotification.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#94A3B8',
            marginTop: 2,
            lineHeight: 1.35,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeNotification.body}
        </div>
      </div>

      {/* Action Button & Dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: badgeColor,
            background: badgeBg,
            padding: '4px 8px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          View
          <ChevronRight size={13} />
        </span>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
          }}
          aria-label="Close Notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

