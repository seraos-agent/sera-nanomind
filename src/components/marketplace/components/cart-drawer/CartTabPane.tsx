import React, { useState, useEffect, useMemo } from 'react';
import type { CartItem } from '../../types';
import { CartIcon } from '../Icons';

interface CartTabPaneProps {
  items: CartItem[];
  subtotal?: number;
  deliveryOrServiceFee?: number;
  totalAmount?: number;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onRemoveSelectedItems?: (selectedItems: CartItem[]) => void;
  onProceedToCheckout: (selectedItems: CartItem[]) => void;
  onToast?: (msg: string) => void;
}

interface CartStoreGroup {
  storeId: string;
  storeName: string;
  items: Array<{ item: CartItem; originalIndex: number }>;
}

const CheckboxButton: React.FC<{
  checked: boolean;
  onChange: () => void;
  size?: number;
  label?: string;
}> = ({ checked, onChange, size = 20, label }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      borderRadius: '6px',
      border: checked ? 'none' : '1.5px solid var(--border-color, #CBD5E1)',
      background: checked ? 'var(--color-brand, #3B82F6)' : 'var(--bg-surface, #FFFFFF)',
      color: '#FFFFFF',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0,
      flexShrink: 0,
      transition: 'all 0.15s ease',
      boxShadow: checked ? '0 1px 4px rgba(59, 130, 246, 0.35)' : 'none',
    }}
    aria-label={label || (checked ? 'Uncheck' : 'Check')}
  >
    {checked && (
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </button>
);

const getItemKey = (c: CartItem, idx: number): string =>
  `${c.item.id}::${c.selectedVariant?.name || ''}::${c.selectedImage || c.item.images[0] || ''}::${c.bookingDate || ''}::${idx}`;

export const CartTabPane: React.FC<CartTabPaneProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveSelectedItems,
  onProceedToCheckout,
  onToast,
}) => {
  // Set of selected item keys
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    return new Set(items.map((c, i) => getItemKey(c, i)));
  });

  // Keep selection synchronized when items list changes
  useEffect(() => {
    setSelectedKeys((prev) => {
      const next = new Set<string>();
      items.forEach((c, i) => {
        const key = getItemKey(c, i);
        if (prev.has(key)) {
          next.add(key);
        }
      });
      // If newly populated or all previously selected, default select all
      if (next.size === 0 && items.length > 0) {
        items.forEach((c, i) => next.add(getItemKey(c, i)));
      }
      return next;
    });
  }, [items]);

  // Group items by store
  const storeGroups = useMemo<CartStoreGroup[]>(() => {
    const groups: CartStoreGroup[] = [];
    const map = new Map<string, CartStoreGroup>();

    items.forEach((cartItem, originalIndex) => {
      const sId = cartItem.item.storeId || 'default-store';
      const sName = cartItem.item.storeName || 'Marketplace Store';

      if (!map.has(sId)) {
        const g: CartStoreGroup = {
          storeId: sId,
          storeName: sName,
          items: [],
        };
        map.set(sId, g);
        groups.push(g);
      }
      map.get(sId)!.items.push({ item: cartItem, originalIndex });
    });

    return groups;
  }, [items]);

  // Filter selected items
  const selectedItems = useMemo(() => {
    return items.filter((c, idx) => selectedKeys.has(getItemKey(c, idx)));
  }, [items, selectedKeys]);

  const selectedCount = selectedItems.length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  // Dynamic calculations for selected items
  const dynamicSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, c) => {
      const price = c.selectedVariant ? c.selectedVariant.price : c.item.price;
      return acc + price * c.quantity;
    }, 0);
  }, [selectedItems]);

  const hasGoodsInSelected = selectedItems.some((i) => i.item.type === 'GOODS');
  const dynamicDeliveryFee = selectedCount > 0 && hasGoodsInSelected ? 15000 : 0;
  const dynamicTotalAmount = dynamicSubtotal + dynamicDeliveryFee;

  // Toggle selection for an individual item
  const toggleSelectItem = (cartItem: CartItem, originalIndex: number) => {
    const key = getItemKey(cartItem, originalIndex);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // Enforce 1-store checkout rule: deselect items from other stores if any
        const otherStoreSelected = items.some(
          (i, idx) => next.has(getItemKey(i, idx)) && i.item.storeId !== cartItem.item.storeId
        );
        if (otherStoreSelected) {
          if (onToast) {
            onToast(`Switched to store: ${cartItem.item.storeName}`);
          }
          return new Set([key]);
        }
        next.add(key);
      }
      return next;
    });
  };

  // Toggle selection for all items in a specific store
  const toggleSelectStore = (group: CartStoreGroup) => {
    const groupKeys = group.items.map(({ item, originalIndex }) => getItemKey(item, originalIndex));
    const isStoreAllSelected = groupKeys.every((k) => selectedKeys.has(k));

    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isStoreAllSelected) {
        // Deselect all items in this store
        groupKeys.forEach((k) => next.delete(k));
      } else {
        // Deselect items from other stores first, then select all items in this store
        return new Set(groupKeys);
      }
      return next;
    });
  };

  // Master "Select All" toggle
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys(new Set());
    } else {
      // If single store, select all
      if (storeGroups.length <= 1) {
        setSelectedKeys(new Set(items.map((c, i) => getItemKey(c, i))));
      } else {
        // If multiple stores, select all items from the primary/first store
        const targetStore = storeGroups[0];
        const targetKeys = targetStore.items.map(({ item, originalIndex }) =>
          getItemKey(item, originalIndex)
        );
        setSelectedKeys(new Set(targetKeys));
        if (onToast) {
          onToast(`Selected all products from store: ${targetStore.storeName}`);
        }
      }
    }
  };

  // Handle remove selected items
  const handleRemoveSelected = () => {
    if (selectedCount === 0) return;
    if (onRemoveSelectedItems) {
      onRemoveSelectedItems(selectedItems);
    } else {
      // Fallback: remove from end to beginning to preserve indices
      const indicesToRemove = items
        .map((c, idx) => (selectedKeys.has(getItemKey(c, idx)) ? idx : -1))
        .filter((idx) => idx !== -1)
        .reverse();
      indicesToRemove.forEach((idx) => onRemoveItem(idx));
    }
    setSelectedKeys(new Set());
  };

  return (
    <div
      className="viewpager-pane"
      style={{
        flex: '0 0 100%',
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {items.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div
              style={{
                margin: '0 auto 12px',
                display: 'flex',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                opacity: 0.65,
              }}
            >
              <CartIcon size={46} color="currentColor" />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.95rem' }}>
              Your Cart is Empty
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
              Choose groceries, food, or services from the marketplace catalog.
            </p>
          </div>
        ) : (
          <>
            {/* Top Bar: Select All + Bulk Delete */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-subtle, #F8FAFC)',
                borderRadius: 'var(--radius-md, 10px)',
                border: '1px solid var(--border-color, #E2E8F0)',
                flexShrink: 0,
              }}
            >
              <div
                onClick={toggleSelectAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <CheckboxButton
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  size={19}
                  label="Select all products"
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Select All ({selectedCount}/{items.length})
                </span>
              </div>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveSelected}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger, #EF4444)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '3px 6px',
                  }}
                >
                  Remove ({selectedCount})
                </button>
              )}
            </div>

            {/* Store Groups & Items */}
            {storeGroups.map((group) => {
              const groupKeys = group.items.map(({ item, originalIndex }) =>
                getItemKey(item, originalIndex)
              );
              const groupSelectedCount = groupKeys.filter((k) => selectedKeys.has(k)).length;
              const isStoreAllSelected = groupKeys.length > 0 && groupSelectedCount === groupKeys.length;

              return (
                <div
                  key={group.storeId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'var(--bg-surface, #FFFFFF)',
                    borderRadius: 'var(--radius-lg, 12px)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    padding: '10px',
                  }}
                >
                  {/* Store Header */}
                  <div
                    onClick={() => toggleSelectStore(group)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 2px 8px',
                      borderBottom: '1px solid var(--border-color, #F1F5F9)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <CheckboxButton
                      checked={isStoreAllSelected}
                      onChange={() => toggleSelectStore(group)}
                      size={18}
                      label={`Select all products from ${group.storeName}`}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.9rem' }}>🏪</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {group.storeName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {groupSelectedCount}/{group.items.length}
                    </span>
                  </div>

                  {/* Store Products */}
                  {group.items.map(({ item: cartItem, originalIndex }) => {
                    const isService = cartItem.item.type === 'SERVICE';
                    const price = cartItem.selectedVariant
                      ? cartItem.selectedVariant.price
                      : cartItem.item.price;
                    const key = getItemKey(cartItem, originalIndex);
                    const isSelected = selectedKeys.has(key);

                    return (
                      <div
                        key={originalIndex}
                        style={{
                          background: isSelected ? 'var(--bg-subtle, #F8FAFC)' : 'transparent',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: isSelected
                            ? '1.5px solid var(--color-brand, #3B82F6)'
                            : '1px solid var(--border-color, #E2E8F0)',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Item Checkbox */}
                        <CheckboxButton
                          checked={isSelected}
                          onChange={() => toggleSelectItem(cartItem, originalIndex)}
                          size={19}
                          label={`Select ${cartItem.item.name}`}
                        />

                        {/* Thumbnail */}
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#E2E8F0',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              cartItem.selectedImage ||
                              cartItem.item.images[0] ||
                              'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'
                            }
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                            <span
                              className={`badge ${isService ? 'badge-service' : 'badge-goods'}`}
                              style={{ padding: '1px 5px', fontSize: '0.62rem' }}
                            >
                              {isService ? 'SERVICE' : 'PRODUCT'}
                            </span>
                          </div>

                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cartItem.item.name}
                          </div>

                          {cartItem.selectedVariant && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-brand)' }}>
                              Variant: {cartItem.selectedVariant.name}
                            </div>
                          )}

                          {isService && cartItem.bookingDate && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-service)' }}>
                              📅 Schedule: {cartItem.bookingDate}
                            </div>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: '6px',
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                              Rp {(price * cartItem.quantity).toLocaleString('id-ID')}
                            </div>

                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {!isService ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(originalIndex, cartItem.quantity - 1)}
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '4px',
                                      background: 'var(--bg-surface, #FFFFFF)',
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-main)',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    -
                                  </button>
                                  <span
                                    style={{
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      minWidth: '16px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(originalIndex, cartItem.quantity + 1)}
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '4px',
                                      background: 'var(--bg-surface, #FFFFFF)',
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-main)',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onRemoveItem(originalIndex)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-danger, #EF4444)',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer Summary */}
      {items.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-sub)',
            }}
          >
            <span>Subtotal ({selectedCount} items selected)</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              Rp {dynamicSubtotal.toLocaleString('id-ID')}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-sub)',
            }}
          >
            <span>Shipping / Service Fee</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {selectedCount === 0
                ? 'Rp 0'
                : dynamicDeliveryFee > 0
                ? `Rp ${dynamicDeliveryFee.toLocaleString('id-ID')}`
                : 'Free'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '6px',
              borderTop: '1px dashed var(--border-color)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total Due</span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-goods)',
              }}
            >
              Rp {dynamicTotalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => onProceedToCheckout(selectedItems)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md, 8px)',
              background: selectedCount > 0 ? 'var(--color-brand, #3B82F6)' : 'var(--border-color, #E2E8F0)',
              color: selectedCount > 0 ? '#FFFFFF' : 'var(--text-muted, #94A3B8)',
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {selectedCount > 0 ? `Checkout (${selectedCount})` : 'Select Products First'}
          </button>
        </div>
      )}
    </div>
  );
};
