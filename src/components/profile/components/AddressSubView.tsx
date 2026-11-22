import React from 'react';
import type { ThemeType } from '../../../theme';

export interface AddressData {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode?: string;
  notes: string;
  lat?: number;
  lng?: number;
}

interface AddressSubViewProps {
  theme: ThemeType;
  addressForm: AddressData;
  setAddressForm: React.Dispatch<React.SetStateAction<AddressData>>;
  onSaveAddress: (e?: React.FormEvent) => void;
  onOpenLocationPicker: () => void;
  isSaving?: boolean;
}

export function AddressSubView({
  theme,
  addressForm,
  setAddressForm,
  onSaveAddress,
  onOpenLocationPicker,
  isSaving,
}: AddressSubViewProps) {
  return (
    <form onSubmit={onSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 4 }}>
      {/* Header Info Banner */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
          Primary Delivery Address
        </div>
        <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          Auto-filled when ordering goods & courier delivery in SERA Marketplace
        </div>
      </div>

      {/* Address Label (Pill Options) */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Address label
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Home', 'Office', 'Apartment', 'Store'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setAddressForm((prev) => ({ ...prev, label: tag }))}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                border: `1px solid ${addressForm.label === tag ? theme.ink : theme.border}`,
                background: addressForm.label === tag ? theme.ink : theme.surface,
                color: addressForm.label === tag ? theme.bg : theme.ink,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Name */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Recipient name
        </label>
        <input
          type="text"
          value={addressForm.recipientName}
          onChange={(e) => setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))}
          placeholder="Example: John Doe"
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 14.5,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Recipient WhatsApp Number */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Recipient WhatsApp number
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={addressForm.phone}
          onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
          placeholder="Example: 081234567890"
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 14.5,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Titik Lokasi di Peta Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
          Map Pin Location
        </div>

        {addressForm.lat !== undefined && addressForm.lng !== undefined ? (
          <div
            style={{
              fontSize: 13,
              fontFamily: 'monospace',
              fontWeight: 600,
              color: theme.ink,
              background: theme.surface2,
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
            }}
          >
            {addressForm.lat.toFixed(6)}, {addressForm.lng.toFixed(6)}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
            Set a map pin for accurate courier delivery and automatic address lookup.
          </div>
        )}

        <button
          type="button"
          onClick={onOpenLocationPicker}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: 20,
            border: `1px solid ${addressForm.lat !== undefined && addressForm.lng !== undefined ? theme.border : 'transparent'}`,
            background: addressForm.lat !== undefined && addressForm.lng !== undefined ? theme.surface2 : theme.ink,
            color: addressForm.lat !== undefined && addressForm.lng !== undefined ? theme.ink : theme.bg,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'opacity 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (addressForm.lat !== undefined && addressForm.lng !== undefined) {
              (e.currentTarget as HTMLElement).style.background = theme.border;
            }
          }}
          onMouseLeave={(e) => {
            if (addressForm.lat !== undefined && addressForm.lng !== undefined) {
              (e.currentTarget as HTMLElement).style.background = theme.surface2;
            }
          }}
        >
          {addressForm.lat !== undefined && addressForm.lng !== undefined ? 'Change pin on map' : 'Pick pin on map'}
        </button>
      </div>

      {/* Full Address */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Full address
        </label>
        <textarea
          rows={3}
          value={addressForm.streetAddress}
          onChange={(e) => setAddressForm((prev) => ({ ...prev, streetAddress: e.target.value }))}
          placeholder="Street name, house/building number, neighborhood, district"
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 14.5,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* City / Regency */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          City / Regency
        </label>
        <input
          type="text"
          value={addressForm.city}
          onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="Example: South Jakarta"
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 14.5,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Landmark Notes for Courier */}
      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Landmark notes for courier (optional)
        </label>
        <input
          type="text"
          value={addressForm.notes}
          onChange={(e) => setAddressForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Example: Black gate across from security post"
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 14.5,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Submit Pill Button */}
      <div style={{ marginTop: 12 }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 24,
            border: 'none',
            background: theme.ink,
            color: theme.bg,
            fontSize: 15,
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.65 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isSaving ? 'Saving...' : 'Save address'}
        </button>
      </div>
    </form>
  );
}

