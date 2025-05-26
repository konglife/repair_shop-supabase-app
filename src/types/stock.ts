export interface Stock {
  id: string;
  product_id: string;
  min_stock: number;
  current_stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at: string;
  updated_at: string;
  products?: {
    id?: string;
    product_code?: string;
    name?: string;
    unit_id?: string;
    price?: number;
    cost?: number;
    note?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    units?: {
      id?: string;
      name?: string;
      user_id?: string;
      created_at?: string;
    };
  };
}
