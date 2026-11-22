import React, { useState } from 'react';
import type { MarketplaceStore, MarketplaceItem } from '../types';
import { getMarketApiUrl } from '../utils/api';

interface SellerOnboardingModalProps {
  onClose: () => void;
  onStoreCreated: (store: MarketplaceStore, firstItem?: MarketplaceItem) => void;
}

export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  onClose,
  onStoreCreated,
}) => {
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [type, setType] = useState<'GOODS' | 'SERVICE'>('GOODS');
  const [category, setCategory] = useState('Fashion & Apparel');
  const [city, setCity] = useState('Jakarta Selatan');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');

  // First product/service
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDurationOrStock, setProductDurationOrStock] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !whatsapp.trim()) {
      setError('Store name and WhatsApp number are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const slug = storeName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || `store-${Date.now()}`;
    const newStore: MarketplaceStore = {
      id: slug,
      name: storeName,
      tagline: tagline || `Trusted ${storeName} Store`,
      description: description || `Offering top quality ${type === 'GOODS' ? 'products' : 'services'}.`,
      logoUrl: type === 'GOODS'
        ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160'
        : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=160',
      bannerUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
      type,
      category,
      rating: 5.0,
      totalProducts: productName ? 1 : 0,
      address: `Jl. Niaga Utama No. 1, ${city}`,
      city,
      isOpen: true,
      operatingHours: '08:00 - 21:00',
      whatsapp: whatsapp.replace(/[^0-9]/g, ''),
      verified: true
    };

    let firstItem: MarketplaceItem | undefined;
    if (productName && productPrice) {
      const priceNum = parseInt(productPrice.replace(/[^0-9]/g, ''), 10) || 50000;
      firstItem = {
        id: `item-${Date.now()}`,
        storeId: slug,
        storeName: storeName,
        name: productName,
        description: `Featured ${type === 'GOODS' ? 'product' : 'service'} from ${storeName}.`,
        type,
        category,
        price: priceNum,
        currency: 'IDR',
        stock: type === 'GOODS' ? (parseInt(productDurationOrStock, 10) || 20) : undefined,
        duration: type === 'SERVICE' ? (productDurationOrStock || '60 Minutes') : undefined,
        rating: 5.0,
        reviewsCount: 1,
        soldCount: 0,
        images: [
          type === 'GOODS'
            ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
            : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800'
        ],
        badge: 'New',
        location: city,
        tags: [type.toLowerCase(), category.toLowerCase()]
      };
    }

    try {
      await fetch(getMarketApiUrl('/api/market/stores'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });
      if (firstItem) {
        await fetch(getMarketApiUrl('/api/market/products'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firstItem)
        });
      }
    } catch {
      // Local state fallback
    }

    onStoreCreated(newStore, firstItem);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              🏪 Open a Store on SERA Market
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Start selling physical products or offering your services today
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Business Type Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '6px' }}>
              Primary Business Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setType('GOODS')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'GOODS' ? '2px solid var(--color-goods)' : '1px solid var(--border-color)',
                  background: type === 'GOODS' ? 'var(--color-goods-bg)' : 'var(--bg-surface, #FFFFFF)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📦 Physical Goods
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>Fashion, Culinary</div>
              </button>

              <button
                type="button"
                onClick={() => setType('SERVICE')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: type === 'SERVICE' ? '2px solid var(--color-service)' : '1px solid var(--border-color)',
                  background: type === 'SERVICE' ? 'var(--color-service-bg)' : 'var(--bg-surface, #FFFFFF)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🛠️ Services
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>Shoe Care, AC, Barber</div>
              </button>
            </div>
          </div>

          {/* Store Name & Tagline */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
              Store / Business Name *
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Example: Kitchen Delight"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
              Business Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            >
              {type === 'GOODS' ? (
                <>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Food & Culinary">Food & Culinary</option>
                  <option value="Coffee & Beverages">Coffee & Beverages</option>
                  <option value="Crafts & Artisan">Crafts & Artisan</option>
                  <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Shoe & Bag Care">Shoe & Bag Care</option>
                  <option value="AC & Electronics Repair">AC & Electronics Repair</option>
                  <option value="Barber & Grooming">Barber & Grooming</option>
                  <option value="Home & Cleaning Service">Home & Cleaning Service</option>
                  <option value="Design & Digital Services">Design & Digital Services</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Example: Authentic Bold Spices"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
              Brief Store Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your store profile or service highlights..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'none'
              }}
            />
          </div>

          {/* WhatsApp & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
                Business WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="081234******"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: '4px' }}>
                Store City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta / Solo / Bandung"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* First Product Setup */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginTop: '4px'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '6px' }}>
              ✨ Add First Item (Optional)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={type === 'GOODS' ? "Product Name (e.g. Spicy Chili Jar)" : "Service Name (e.g. Shoe Deep Clean)"}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Price (e.g. 35000)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem'
                  }}
                />

                <input
                  type="text"
                  value={productDurationOrStock}
                  onChange={(e) => setProductDurationOrStock(e.target.value)}
                  placeholder={type === 'GOODS' ? "Stock (e.g. 50)" : "Duration (e.g. 60 Minutes)"}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '6px' }}
          >
            {isSubmitting ? 'Registering Store...' : '🚀 Open Store Now'}
          </button>

        </form>

      </div>
    </div>
  );
};
