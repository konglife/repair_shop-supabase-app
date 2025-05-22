export interface Product {
  id: string; // uuid
  product_code: string | null;
  name: string;
  category_id: string | null; // uuid
  unit_id: string | null; // uuid
  selling_price: number; // numeric
  average_cost: number; // numeric
  note: string | null;
  user_id: string; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  categories?: { name: string } | null; // เพิ่ม field สำหรับ join category name
}
