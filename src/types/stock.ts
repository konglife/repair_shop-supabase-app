export interface Stock {
  id: string; // uuid
  product_id: string; // uuid
  min_stock: number; // integer
  current_stock: number; // integer
  status: string; // text (e.g., 'out_of_stock', 'low', 'available')
  last_updated_at: string; // timestamptz
  user_id: string; // uuid
}
