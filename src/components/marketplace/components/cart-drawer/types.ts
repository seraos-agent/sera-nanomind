export type CartTab = 'CART' | 'PROCESSING' | 'COMPLETED';

export const CART_TABS: CartTab[] = ['CART', 'PROCESSING', 'COMPLETED'];

export interface ReviewedItemRecord {
  rating: number;
  comment: string;
  photos?: string[];
  date: number;
}

