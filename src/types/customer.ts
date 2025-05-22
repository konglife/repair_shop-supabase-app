export interface Customer {
  id: string; // uuid
  name: string;
  phone: string | null;
  address: string | null;
  profile_img_url: string | null;
  user_id: string; // uuid 
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}
