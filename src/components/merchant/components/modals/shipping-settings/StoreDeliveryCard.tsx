import type { ThemeType } from '../../../../../theme';
import { getStoreEntityLabel, type StoreType } from '../../../types';
import { ShippingToggleSwitch } from './ShippingToggleSwitch';

interface StoreDeliveryCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  storeDelivery: boolean;
  onToggleStoreDelivery: () => void;
  storeDeliveryMaxRadius: string;
  onChangeMaxRadius: (val: string) => void;
  storeDeliveryPricingType: 'FLAT' | 'PER_KM';
  onChangePricingType: (val: 'FLAT' | 'PER_KM') => void;
  storeDeliveryFee: string;
  onChangeFee: (val: string) => void;
  storeDeliveryFeePerKm: string;
  onChangeFeePerKm: (val: string) => void;
}

export function StoreDeliveryCard({
  theme,
  isMobileView,
  storeType,
  storeDelivery,
  onToggleStoreDelivery,
  storeDeliveryMaxRadius,
  onChangeMaxRadius,
  storeDeliveryPricingType,
  onChangePricingType,
  storeDeliveryFee,
  onChangeFee,
  storeDeliveryFeePerKm,
  onChangeFeePerKm,
}: StoreDeliveryCardProps) {
  const entity = getStoreEntityLabel(storeType);
  const entityLower = getStoreEntityLabel(storeType, true);
  const parsedRadius = parseInt(storeDeliveryMaxRadius, 10) || 0;
  const parsedFee = parseInt(storeDeliveryFee, 10) || 0;
  const parsedFeePerKm = parseInt(storeDeliveryFeePerKm, 10) || 0;

  return (
    <div
      style={{
        padding: isMobileView ? '18px 16px' : '20px 20px',
        borderRadius: 20,
        border: `1px solid ${theme.border}`,
        background: theme.surface,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.15s ease',
      }}
    >
      <div
        onClick={onToggleStoreDelivery}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Delivered by {entity}
          </div>

          <ShippingToggleSwitch checked={storeDelivery} theme={theme} />
        </div>

        <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          Orders are delivered directly to the buyer's address by a {entityLower} courier.
        </p>
      </div>

      {/* Expandable Shipping Parameters */}
      {storeDelivery && (
        <div
          style={{
            paddingTop: 16,
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Max Delivery Radius */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.ink,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Max Delivery Radius
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 48,
                borderRadius: 14,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                overflow: 'hidden',
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                value={storeDeliveryMaxRadius}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  onChangeMaxRadius(raw);
                }}
                placeholder="5"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  padding: '0 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  color: theme.ink,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  padding: '0 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.inkSoft,
                  background: theme.surface,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `1px solid ${theme.border}`,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                KM from store
              </div>
            </div>
            <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
              {parsedRadius === 0
                ? 'Unlimited radius (serves all delivery areas)'
                : `Serves buyers within a maximum ${parsedRadius} km radius from the store`}
            </div>
          </div>

          {/* Pricing Model */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.ink,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Shipping Fee Calculation Model
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: theme.surface2,
                borderRadius: 14,
                padding: 4,
                border: `1px solid ${theme.border}`,
                gap: 4,
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                onClick={() => onChangePricingType('FLAT')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: storeDeliveryPricingType === 'FLAT' ? 700 : 500,
                  background: storeDeliveryPricingType === 'FLAT' ? theme.surface : 'transparent',
                  border: 'none',
                  color: storeDeliveryPricingType === 'FLAT' ? theme.ink : theme.inkSoft,
                  boxShadow:
                    storeDeliveryPricingType === 'FLAT' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                Flat Rate
              </button>
              <button
                type="button"
                onClick={() => onChangePricingType('PER_KM')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: storeDeliveryPricingType === 'PER_KM' ? 700 : 500,
                  background: storeDeliveryPricingType === 'PER_KM' ? theme.surface : 'transparent',
                  border: 'none',
                  color: storeDeliveryPricingType === 'PER_KM' ? theme.ink : theme.inkSoft,
                  boxShadow:
                    storeDeliveryPricingType === 'PER_KM' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                Distance-Based
              </button>
            </div>

            {storeDeliveryPricingType === 'FLAT' ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 48,
                    borderRadius: 14,
                    background: theme.surface2,
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.inkSoft,
                      borderRight: `1px solid ${theme.border}`,
                      background: theme.surface,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Rp
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={storeDeliveryFee}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      onChangeFee(raw);
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: '100%',
                      padding: '0 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'transparent',
                      border: 'none',
                      color: theme.ink,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
                  {parsedFee === 0
                    ? 'Free shipping for buyers'
                    : `Flat shipping fee Rp ${parsedFee.toLocaleString('id-ID')} per order`}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Base Fee */}
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.ink,
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Base Rate (First KM)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 48,
                      borderRadius: 14,
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: theme.inkSoft,
                        borderRight: `1px solid ${theme.border}`,
                        background: theme.surface,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Rp
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={storeDeliveryFee}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        onChangeFee(raw);
                      }}
                      placeholder="0"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: '100%',
                        padding: '0 16px',
                        fontSize: 14,
                        fontWeight: 600,
                        background: 'transparent',
                        border: 'none',
                        color: theme.ink,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Additional Fee per KM */}
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.ink,
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Additional Rate per +1 KM
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 48,
                      borderRadius: 14,
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: theme.inkSoft,
                        borderRight: `1px solid ${theme.border}`,
                        background: theme.surface,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Rp
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={storeDeliveryFeePerKm}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        onChangeFeePerKm(raw);
                      }}
                      placeholder="0"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: '100%',
                        padding: '0 16px',
                        fontSize: 14,
                        fontWeight: 600,
                        background: 'transparent',
                        border: 'none',
                        color: theme.ink,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 12, color: theme.inkSoft, lineHeight: 1.4 }}>
                  {`Example: 3 km distance = Rp ${parsedFee.toLocaleString('id-ID')} + 2x Rp ${parsedFeePerKm.toLocaleString('id-ID')} = Rp ${(parsedFee + 2 * parsedFeePerKm).toLocaleString('id-ID')}`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

