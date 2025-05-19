export interface Supplier {
  id: string; // uuid
  name: string;
  phone: string | null;
  url: string | null;
  note: string | null;
  user_id: string; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}
