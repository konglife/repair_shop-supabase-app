export interface Purchase {
  id: string | null; // uuid
  purchase_order_number: string | null; // Allow null
  supplier_id: string | null; // uuid, Allow null
  purchase_date: string; // timestamptz
  expected_delivery_date: string | null; // timestamptz
  status: 'Pending' | 'Received' | 'Cancelled'; // text (e.g., 'Pending', 'Received', 'Cancelled')
  notes: string | null;
  total_amount: number; // numeric
  user_id: string | null; // uuid, Allow null
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  stock_update_processed: boolean;
}
