import React from "react";
import { ChevronLeft } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface MerchantTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRead: () => void;
  theme: ThemeType;
  isMobileView?: boolean;
}

export const MerchantTermsModal: React.FC<MerchantTermsModalProps> = ({
  isOpen,
  onClose,
  onConfirmRead,
  theme,
  isMobileView
}) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "1. Keaslian Identitas & Data Toko",
      body: "Mitra wajib mengisi informasi toko secara jujur dan akurat, termasuk nama toko, nomor WhatsApp aktif, titik koordinat lokasi GPS di peta, alamat lengkap, serta metode pembayaran yang sah. Penggunaan data fiktif dapat mengakibatkan penolakan atau penonaktifan toko."
    },
    {
      title: "2. Standar Produk, Harga & Ketersediaan Stok",
      body: "Setiap produk, makanan, atau jasa yang diunggah wajib menggunakan foto yang sesuai, deskripsi yang jelas, serta harga yang wajar dan transparan. Mitra bertanggung jawab menjaga akurasi stok agar tidak mengecewakan pelanggan."
    },
    {
      title: "3. Barang & Layanan yang Dilarang",
      body: "Mitra dilarang keras memperjualbelikan barang ilegal, narkotika, senjata tajam/api, obat-obatan tanpa izin edar, produk bajakan, konten pornografi, maupun barang berbahaya lainnya yang melanggar hukum di Indonesia."
    },
    {
      title: "4. Kewajiban Pelayanan & Pengiriman",
      body: "Mitra wajib merespons pesanan masuk sesuai jam operasional yang telah ditetapkan. Pesanan harus dikemas dengan aman dan diserahkan tepat waktu kepada kurir maupun pelanggan yang melakukan pengambilan mandiri."
    },
    {
      title: "5. Pembayaran, QRIS & Transparansi Transaksi",
      body: "Rekening bank, akun DANA, atau gambar QRIS yang didaftarkan harus milik sah pemilik/pengelola toko. Segala bentuk penipuan pembayaran atau manipulasi transaksi di luar ketentuan platform akan ditindak tegas."
    },
    {
      title: "6. Peninjauan Admin & Sanksi Pelanggaran",
      body: "Tim SERA berhak meninjau, menangguhkan sementara, atau menonaktifkan akun mitra apabila ditemukan pelanggaran terhadap peraturan ini, laporan penipuan dari pembeli, atau penyalahgunaan sistem."
    }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Top Sticky Header */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "14px 16px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onClose}
          title="Kembali"
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.ink,
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: isMobileView ? 16 : 17,
              fontWeight: 700,
              color: theme.ink,
              lineHeight: 1.25
            }}
          >
            Syarat & Ketentuan
          </h2>
          <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 2 }}>
            SERA Marketplace Partner Agreement
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobileView ? "18px 16px 32px" : "28px 24px 40px",
          WebkitOverflowScrolling: "touch"
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          {/* Intro Banner */}
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: "16px 18px"
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
              Komitmen Kemitraan SERA
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Harap baca seluruh poin peraturan di bawah ini dengan saksama sebelum mengajukan pendaftaran Mitra Toko SERA.
            </p>
          </div>

          {/* Terms List */}
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: isMobileView ? "16px" : "22px",
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >
            {sections.map((sec) => (
              <div key={sec.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>
                  {sec.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.6 }}>
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Footer */}
      <div
        style={{
          background: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          padding: isMobileView ? "14px 16px" : "16px 24px",
          flexShrink: 0
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button
            type="button"
            onClick={onConfirmRead}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: 14,
              background: theme.ink,
              color: theme.bg,
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.14)"
            }}
          >
            <span>Saya Sudah Membaca & Memahami Peraturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

