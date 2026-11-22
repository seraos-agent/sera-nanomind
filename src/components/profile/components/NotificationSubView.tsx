import { useState, useEffect } from 'react';
import type { ThemeType } from '../../../theme';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  checkNotificationPermissionStatus,
  requestNotificationPermission,
  type NotificationPreferences,
} from '../../../utils/notificationService';

interface NotificationSubViewProps {
  theme: ThemeType;
  serverPrefs?: NotificationPreferences;
  onSavePreferences?: (prefs: NotificationPreferences) => void | Promise<void>;
}

export function NotificationSubView({
  theme,
  serverPrefs,
  onSavePreferences,
}: NotificationSubViewProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => serverPrefs || getNotificationPreferences());
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (serverPrefs) {
      setPrefs(serverPrefs);
    }
  }, [serverPrefs]);

  useEffect(() => {
    checkNotificationPermissionStatus().then((status) => {
      setPermissionStatus(status);
    });
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    void onSavePreferences?.(updated);
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const res = await requestNotificationPermission();
      setPermissionStatus(res);
    } finally {
      setIsRequesting(false);
    }
  };

  const renderToggle = (checked: boolean, onToggle: () => void, label: string) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      style={{
        width: 50,
        height: 28,
        borderRadius: 15,
        background: checked ? theme.ink : theme.surface2,
        border: `1px solid ${checked ? theme.ink : theme.border}`,
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        flexShrink: 0,
        marginTop: 2,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 24 : 2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: checked ? theme.bg : theme.inkSoft,
          transition: 'left 0.2s ease, background 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
        }}
      />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
      {/* Card 1: System Permission Status */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.ink, margin: 0 }}>
            System Notification Permission
          </h2>

          <div style={{ flexShrink: 0 }}>
            {permissionStatus === 'granted' ? (
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: theme.status,
                  background: theme.statusSoft,
                  padding: '5px 12px',
                  borderRadius: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Permission Active
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequesting}
                style={{
                  background: theme.ink,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: 20,
                  padding: '7px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: isRequesting ? 0.6 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {isRequesting ? 'Requesting...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: theme.inkSoft, margin: 0, width: '100%' }}>
          Allow status bar and lock screen notifications so you keep receiving order alerts while the app is in the background.
        </p>
      </div>

      {/* Card 2: Sensory Alerts (Sound & Vibration) */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.ink, margin: 0 }}>
            Sound & Vibration
          </h2>
          <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 4 }}>
            Configure synthetic chime audio and device vibration for new activity alerts.
          </div>
        </div>

        {/* Row 1: Sound Chime */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Notification Chime
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Play a synthetic chime tone when a new order or delivery task arrives.
            </div>
          </div>
          {renderToggle(prefs.sound, () => handleToggle('sound'), 'Enable Notification Chime')}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 2: Vibration */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Haptic Vibration
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Vibrate the device when incoming order notifications arrive.
            </div>
          </div>
          {renderToggle(prefs.vibration, () => handleToggle('vibration'), 'Enable Vibration')}
        </div>
      </div>

      {/* Card 3: Notification Categories by Operational Role */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.ink, margin: 0 }}>
            Notification Categories
          </h2>
          <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 4 }}>
            Choose which alerts you want to receive based on your operational role.
          </div>
        </div>

        {/* Row 1: Merchant Orders */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Store Orders (Merchant)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Instant alerts whenever a customer places a new order for your store.
            </div>
          </div>
          {renderToggle(
            prefs.merchantOrders,
            () => handleToggle('merchantOrders'),
            'Enable Store Order Notifications'
          )}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 2: Courier Deliveries */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Delivery Tasks (Courier)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Alerts when a package or ready-to-deliver order is assigned to a courier.
            </div>
          </div>
          {renderToggle(
            prefs.courierDeliveries,
            () => handleToggle('courierDeliveries'),
            'Enable Courier Task Notifications'
          )}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 3: Buyer Order Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Order Status (Buyer)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Live updates when your shopping order is prepared, out for delivery, or has arrived.
            </div>
          </div>
          {renderToggle(
            prefs.buyerOrders,
            () => handleToggle('buyerOrders'),
            'Enable Buyer Status Notifications'
          )}
        </div>
      </div>
    </div>
  );
}
