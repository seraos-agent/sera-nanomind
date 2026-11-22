import React from 'react';

interface ItemDetailLightboxProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const ItemDetailLightbox: React.FC<ItemDetailLightboxProps> = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.92)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close Photo"
          style={{
            position: 'absolute',
            top: '-46px',
            right: '0',
            background: 'rgba(255, 255, 255, 0.25)',
            border: 'none',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          ✕
        </button>
        <img
          src={photoUrl}
          alt="Buyer Review Photo Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '82vh',
            borderRadius: '12px',
            objectFit: 'contain',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>
    </div>
  );
};

