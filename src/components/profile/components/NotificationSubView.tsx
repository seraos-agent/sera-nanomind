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
            Izin Notifikasi Sistem
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
                Izin Aktif
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
                {isRequesting ? 'Meminta...' : 'Aktifkan'}
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: theme.inkSoft, margin: 0, width: '100%' }}>
          Izinkan notifikasi status bar dan layar kunci agar Anda tetap menerima info pesanan saat aplikasi berada di latar belakang.
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
            Suara & Getar
          </h2>
          <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 4 }}>
            Atur bunyi nada dering sintetis dan getaran perangkat saat ada aktivitas baru.
          </div>
        </div>

        {/* Row 1: Sound Chime */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Nada Dering (Chime)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Bunyikan nada melodis sintetis saat ada pesanan atau tugas pengantaran masuk.
            </div>
          </div>
          {renderToggle(prefs.sound, () => handleToggle('sound'), 'Aktifkan Nada Dering')}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 2: Vibration */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Getaran Haptik
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Getarkan perangkat saat notifikasi pesanan masuk.
            </div>
          </div>
          {renderToggle(prefs.vibration, () => handleToggle('vibration'), 'Aktifkan Getaran')}
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
            Kategori Notifikasi
          </h2>
          <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 4 }}>
            Pilih pemberitahuan yang ingin Anda terima sesuai peran operasional.
          </div>
        </div>

        {/* Row 1: Merchant Orders */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Pesanan Toko (Merchant)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Pemberitahuan seketika ketika ada pesanan baru yang dibuat pelanggan untuk toko Anda.
            </div>
          </div>
          {renderToggle(
            prefs.merchantOrders,
            () => handleToggle('merchantOrders'),
            'Aktifkan Notifikasi Pesanan Toko'
          )}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 2: Courier Deliveries */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Tugas Pengantaran (Kurir)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Pemberitahuan saat ada paket atau pesanan siap antar yang ditugaskan ke kurir.
            </div>
          </div>
          {renderToggle(
            prefs.courierDeliveries,
            () => handleToggle('courierDeliveries'),
            'Aktifkan Notifikasi Tugas Kurir'
          )}
        </div>

        <div style={{ height: 1, background: theme.border }} />

        {/* Row 3: Buyer Order Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
              Status Pesanan (Pembeli)
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Pembaruan langsung ketika pesanan belanja Anda diproses, diantar, atau telah tiba di lokasi.
            </div>
          </div>
          {renderToggle(
            prefs.buyerOrders,
            () => handleToggle('buyerOrders'),
            'Aktifkan Notifikasi Status Pembeli'
          )}
        </div>
      </div>
    </div>
  );
}
