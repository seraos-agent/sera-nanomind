export type StoreTab = 'TOKO' | 'PRODUK' | 'KATEGORI';

export const STORE_TABS: StoreTab[] = ['TOKO', 'PRODUK', 'KATEGORI'];

export type StoreSortBy = 'populer' | 'terbaru' | 'terlaris' | 'harga_asc' | 'harga_desc';

export interface StoreCategoryItem {
  name: string;
  count: number;
}

