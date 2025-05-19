export interface Purchase {
  id: string; // uuid
  purchase_order_number: string | null;
  supplier_id: string | null; // uuid
  purchase_date: string; // timestamptz
  expected_delivery_date: string | null; // timestamptz
  status: string; // text (e.g., 'Pending', 'Received', 'Cancelled')
  notes: string | null;
  total_amount: number; // numeric
  user_id: string; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  stock_update_processed: boolean;
}
