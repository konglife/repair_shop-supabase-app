export interface PurchaseItem {
  id: string; // uuid
  purchase_id: string; // uuid
  product_id: string; // uuid
  quantity: number; // integer
  price: number; // numeric
  total_price: number; // numeric
}
