import React from 'react';
import type { MarketplaceItem } from '../types';
import { MapPinIcon } from './Icons';
import { formatShortCity, formatSoldCount } from '../utils/formatters';

interface ItemCardProps {
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
  onAddToCart?: (item: MarketplaceItem) => void;
  onSelectStore?: (storeId: string) => void;
}

const DEFAULT_ITEM_CARD_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=75';

/**
 * Rewrites Unsplash URLs to lightweight 400px thumbnails so mobile grid scrolling stays memory-efficient.
 */
function getOptimizedCardImage(url?: string): string {
  const candidate = url || DEFAULT_ITEM_CARD_IMAGE;
  if (!candidate.includes('images.unsplash.com')) {
    return candidate;
  }
  let optimized = candidate.includes('w=')
    ? candidate.replace(/w=\d+/, 'w=400')
    : `${candidate}${candidate.includes('?') ? '&' : '?'}w=400&auto=format&fit=crop`;
  optimized = optimized.includes('q=')
    ? optimized.replace(/q=\d+/, 'q=75')
    : `${optimized}${optimized.includes('?') ? '&' : '?'}q=75`;
  return optimized;
}

export const ItemCard: React.FC<ItemCardProps> = React.memo(({
  item,
  onSelect,
}) => {
  const isService = item.type === 'SERVICE';
  const variants = Array.isArray(item.variants) ? item.variants : [];
  const hasVariants = variants.length > 0;
  const variantPrices = hasVariants ? variants.map((v) => Number(v.price) || 0) : [];
  const minVariantPrice = hasVariants ? Math.min(...variantPrices) : item.price;
  const hasDiscount = !hasVariants && Boolean(item.originalPrice && item.originalPrice > item.price);
  const discountPercent = hasDiscount
    ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
    : 0;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        contain: 'layout paint',
      }}
      onClick={() => onSelect(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Product Image Container (1:1 on mobile, 4:3 on desktop) */}
      <div className="item-card-image-box">
        <img
          src={getOptimizedCardImage(item.images?.[0])}
          alt={item.name}
          decoding="async"
          className="item-card-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_ITEM_CARD_IMAGE;
          }}
        />

        {/* Promo / Discount Badge (Top-Right) */}
        {hasDiscount && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 2 }}>
            <span style={{
              background: '#EF4444',
              color: 'white',
              fontSize: '0.70rem',
              fontWeight: 400,
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              lineHeight: 1.15,
              display: 'inline-block'
            }}>
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Stock Indicator on bottom-left of photo */}
        {!isService && item.stock !== undefined && (
          <div style={{ position: 'absolute', bottom: '6px', left: '6px', zIndex: 2 }}>
            <span style={{
              background: 'rgba(15, 23, 42, 0.84)',
              color: item.stock <= 0 ? '#F87171' : '#FFFFFF',
              fontSize: '0.62rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '5px',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {item.stock <= 0 ? 'Habis' : `Stok: ${item.stock}`}
            </span>
          </div>
        )}

        {/* Variant count badge on bottom-right of photo (opposite stock badge) */}
        {hasVariants && (
          <div style={{ position: 'absolute', bottom: '6px', right: '6px', zIndex: 2 }}>
            <span style={{
              background: 'rgba(37, 99, 235, 0.92)',
              color: '#FFFFFF',
              fontSize: '0.62rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '5px',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {variants.length} Varian
            </span>
          </div>
        )}
      </div>

      {/* Card Info Body */}
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span style={{
            fontWeight: 600,
            color: 'var(--text-sub)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <MapPinIcon size={10} color="#EF4444" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatShortCity(item.location)}
            </span>
          </span>
        </div>

        {/* Item Title */}
        <h3 style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          color: 'var(--text-main)',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.1rem'
        }}>
          {item.name}
        </h3>

        {/* Pricing: Nominal Harga (Biru) & Harga Coret (Tidak tembus ke samping) */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '2px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          columnGap: '6px',
          rowGap: '2px',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '0.96rem',
            fontWeight: 700,
            color: 'var(--color-brand, #2563EB)',
            lineHeight: 1.2,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '1.5px',
            whiteSpace: 'nowrap'
          }}>
            <span>Rp</span>
            <span>{(hasVariants ? minVariantPrice : item.price).toLocaleString('id-ID')}</span>
            {isService && (
              <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '2px' }}>
                /sesi
              </span>
            )}
          </div>

          {hasDiscount && (
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted, #94A3B8)',
              textDecoration: 'line-through',
              lineHeight: 1.2,
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '1.5px',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: 0.85
            }}>
              <span>Rp</span>
              <span>{item.originalPrice?.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Ratings & Sold (1 clean compact line, no vertical stacking) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingTop: '2px'
        }}>
          <span style={{ color: '#F59E0B', fontSize: '0.74rem' }}>★</span>
          <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{item.rating ?? 5.0}</strong>
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>•</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatSoldCount(item.soldCount, isService)}
          </span>
        </div>

      </div>
    </div>
  );
});
