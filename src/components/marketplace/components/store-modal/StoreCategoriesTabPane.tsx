import React from 'react';
import { type StoreCategoryItem } from './types';
import { StoreClosedNotice } from './StoreClosedNotice';

interface StoreCategoriesTabPaneProps {
  isOpen?: boolean;
  categories: StoreCategoryItem[];
  onSelectCategory: (categoryName: string) => void;
}

export const StoreCategoriesTabPane: React.FC<StoreCategoriesTabPaneProps> = ({
  isOpen,
  categories,
  onSelectCategory,
}) => {
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <StoreClosedNotice isOpen={isOpen} style={{ marginBottom: '12px' }} />
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '10px' }}>
        Pilih Kategori Produk Toko
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categories.map((c) => (
          <div
            key={c.name}
            onClick={() => onSelectCategory(c.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.15rem' }}>🏷️</span>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {c.count} Produk
                </div>
              </div>
            </div>
            <span style={{ color: 'var(--color-brand)', fontWeight: 700, fontSize: '0.85rem' }}>
              Lihat ›
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

