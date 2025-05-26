export interface PurchaseItem {
  id?: string | null; // Changed to optional property and allow undefined
  purchase_id: string | null; // uuid, Allow purchase_id to be null
  product_id: string; // uuid
  quantity: number; // integer
  price: number; // numeric
  total_price: number; // numeric
}
