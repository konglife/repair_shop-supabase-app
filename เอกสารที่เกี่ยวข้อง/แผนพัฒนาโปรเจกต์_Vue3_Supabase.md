# 🧭 แผนพัฒนาโปรเจกต์ระบบร้านซ่อมสินค้า (Vue 3 + Supabase)

### ✅ สำหรับมือใหม่ เน้น Free Tier และการพัฒนาที่ยั่งยืน

---

## 🔹 เฟส 0: เตรียมพื้นฐานและตั้งค่าโปรเจกต์ Supabase

### 🎯 เป้าหมาย:
*   ตั้งค่าโปรเจกต์บน Supabase (Free Tier) ให้พร้อมใช้งาน
*   ออกแบบและสร้างโครงสร้างฐานข้อมูล (Schema) ใน PostgreSQL ให้รองรับระบบร้านซ่อม
*   กำหนดนโยบายความปลอดภัยเบื้องต้น (Row Level Security - RLS)
*   ตั้งค่าระบบ Authentication ของ Supabase

### ✅ สิ่งที่ต้องทำ:

1.  **สร้างโปรเจกต์ Supabase**:
    *   ไปที่ [supabase.com](https://supabase.com) และสร้างบัญชี (ถ้ายังไม่มี). (คุณแจ้งว่าสร้างโปรเจกต์แล้ว 👍)
    *   ตรวจสอบว่าได้จดบันทึก **Project URL** และ **`anon` (public) key** จาก Project API settings (Settings -> API).

2.  **สำรวจ Supabase Studio**:
    *   ทำความคุ้นเคยกับ Dashboard: Table Editor (Database -> Tables), SQL Editor (SQL Editor), Authentication (Authentication -> Providers, Users), Storage, Edge Functions.

3.  **ออกแบบและสร้าง Schema ฐานข้อมูล (PostgreSQL)**:
    *   ใช้ Table Editor หรือ SQL Editor ใน Supabase Studio เพื่อสร้าง Tables.
    *   **หลักการออกแบบ**:
        *   ใช้ `UUID` เป็น Primary Key สำหรับทุกตาราง (Supabase แนะนำ `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`).
        *   กำหนด Foreign Key constraints เพื่อรักษาความสัมพันธ์ของข้อมูล.
        *   ใช้ `timestamptz` (timestamp with time zone) สำหรับเก็บข้อมูลวันเวลา, และตั้งค่า `DEFAULT now()` สำหรับ `created_at` และ `updated_at` (หรือใช้ trigger).
        *   พิจารณาการใช้ `text` สำหรับ string ทั่วไป, `numeric` หรือ `decimal` สำหรับค่าเงิน, `integer` สำหรับจำนวน.
        *   สร้าง Indexes ที่จำเป็นสำหรับคอลัมน์ที่ใช้ในการ query บ่อยๆ (Supabase อาจจะสร้าง index สำหรับ PK และ FK โดยอัตโนมัติ).
    *   **ตารางหลัก (ตัวอย่างเริ่มต้น)**:
        *   **`profiles`** (สำหรับข้อมูลเพิ่มเติมของผู้ใช้ที่ link กับ `auth.users` ของ Supabase):
            *   `id (uuid, pk, references auth.users ON DELETE CASCADE)`
            *   `display_name (text, nullable)`
            *   `role (text, default 'user', check (role IN ('user', 'admin')))`
            *   `created_at (timestamptz, default now())`
            *   `updated_at (timestamptz, default now())`
            *   (เปิด RLS และสร้าง policy ให้ user แก้ไขได้เฉพาะ profile ของตัวเอง)
        *   **`customers`**:
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `name (text, not null)`
            *   `phone (text, nullable)`
            *   `address (text, nullable)`
            *   `profile_img_url (text, nullable)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)` (ผู้สร้าง/เจ้าของข้อมูล)
            *   `created_at (timestamptz, default now())`
            *   `updated_at (timestamptz, default now())`
        *   **`suppliers`**: (โครงสร้างคล้าย `customers`)
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `name (text, not null)`
            *   `phone (text, nullable)`
            *   `url (text, nullable)`
            *   `note (text, nullable)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)`
            *   `created_at (timestamptz, default now())`
            *   `updated_at (timestamptz, default now())`
        *   **`categories`** (หมวดหมู่สินค้า):
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `name (text, not null, unique)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)`
            *   `created_at (timestamptz, default now())`
        *   **`units`** (หน่วยนับสินค้า):
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `name (text, not null, unique)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)`
            *   `created_at (timestamptz, default now())`
        *   **`products`**:
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `product_code (text, unique, nullable)`
            *   `name (text, not null)`
            *   `category_id (uuid, references categories ON DELETE SET NULL, nullable)`
            *   `unit_id (uuid, references units ON DELETE SET NULL, nullable)`
            *   `selling_price (numeric, default 0)`
            *   `average_cost (numeric, default 0)` (จะถูกอัปเดตโดย Edge Function)
            *   `note (text, nullable)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)`
            *   `created_at (timestamptz, default now())`
            *   `updated_at (timestamptz, default now())`
        *   **`stocks`**:
            *   `id (uuid, pk, default gen_random_uuid())` (หรือใช้ `product_id` เป็น PK ถ้า 1 product มี 1 stock record เสมอ)
            *   `product_id (uuid, references products ON DELETE CASCADE, not null, unique)`
            *   `min_stock (integer, default 0, check (min_stock >= 0))`
            *   `current_stock (integer, default 0, check (current_stock >= 0))`
            *   `status (text, default 'out_of_stock')` (อาจจะเป็น enum: `('out_of_stock', 'low', 'available')`)
            *   `last_updated_at (timestamptz, default now())`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)` (ผู้ที่ตั้งค่า min_stock ล่าสุด)
        *   **`purchases`**:
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `purchase_order_number (text, nullable)`
            *   `supplier_id (uuid, references suppliers ON DELETE SET NULL, nullable)`
            *   `purchase_date (timestamptz, default now())`
            *   `expected_delivery_date (timestamptz, nullable)`
            *   `status (text, default 'Pending')` (enum: `('Pending', 'Received', 'Cancelled')`)
            *   `notes (text, nullable)`
            *   `total_amount (numeric, default 0)`
            *   `user_id (uuid, references auth.users ON DELETE SET NULL, not null)`
            *   `created_at (timestamptz, default now())`
            *   `updated_at (timestamptz, default now())`
            *   `stock_update_processed (boolean, default false)`
        *   **`purchase_items`**:
            *   `id (uuid, pk, default gen_random_uuid())`
            *   `purchase_id (uuid, references purchases ON DELETE CASCADE, not null)`
            *   `product_id (uuid, references products ON DELETE RESTRICT, not null)`
            *   `quantity (integer, not null, check (quantity > 0))`
            *   `price (numeric, not null, check (price >= 0))` (ราคาต่อหน่วยตอนซื้อ)
            *   `total_price (numeric, default 0)` (คำนวณจาก quantity * price)
        *   (ตาราง `sales`, `sale_items`, `repairs`, `used_parts` จะมีโครงสร้างคล้ายกัน)

4.  **ตั้งค่า Authentication**:
    *   ใน Supabase Studio -> Authentication -> Providers: เปิดใช้งาน Email/Password.
    *   (Optional) ตั้งค่า Social Providers (Google, Facebook, etc.) ถ้าต้องการ.
    *   (Optional) ปรับแต่ง Email Templates.

5.  **กำหนด Row Level Security (RLS) เบื้องต้น**:
    *   สำหรับแต่ละตาราง, เข้าไปที่ Table Editor -> เลือกตาราง -> แถบ "Row Level Security".
    *   **เปิดใช้งาน RLS สำหรับทุกตารางที่ต้องการการป้องกันข้อมูล** (โดยเฉพาะข้อมูลที่มี `user_id`).
    *   **สร้าง Policies พื้นฐาน**:
        *   **Allow `SELECT` for authenticated users (เจ้าของข้อมูล)**:
            ```sql
            CREATE POLICY "Allow individual select access"
            ON public.your_table_name
            FOR SELECT
            USING (auth.uid() = user_id);
            ```
        *   **Allow `INSERT` for authenticated users (ให้ user_id เป็นของผู้ใช้ปัจจุบัน)**:
            ```sql
            CREATE POLICY "Allow individual insert access"
            ON public.your_table_name
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
            ```
        *   **Allow `UPDATE` for authenticated users (เจ้าของข้อมูล)**:
            ```sql
            CREATE POLICY "Allow individual update access"
            ON public.your_table_name
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
            ```
        *   **Allow `DELETE` for authenticated users (เจ้าของข้อมูล)**:
            ```sql
            CREATE POLICY "Allow individual delete access"
            ON public.your_table_name
            FOR DELETE
            USING (auth.uid() = user_id);
            ```
        *   (ปรับ `your_table_name` และเงื่อนไข `user_id` ให้ตรงกับตารางของคุณ)
    *   **สำหรับตารางที่ทุกคนควรอ่านได้ (ถ้ามี)** เช่น `categories` หรือ `units` ที่เป็น public อาจจะสร้าง policy `FOR SELECT USING (true)`.

6.  **(Optional) ตั้งค่า Database Backups**:
    *   Supabase Free Tier อาจจะมีข้อจำกัดเรื่อง automatic backups. ตรวจสอบใน Supabase Dashboard (Project Settings -> Backups).
    *   พิจารณาการทำ manual backup (เช่น `pg_dump`) เป็นระยะถ้าจำเป็น.

---

## 🔸 เฟส 1: ตั้งค่า Frontend (Vue 3) และการเชื่อมต่อพื้นฐาน (Supabase)

### 🎯 เป้าหมาย:
*   สร้างโปรเจกต์ Vue 3 (Vite + TypeScript) ใหม่ หรือปรับจากโปรเจกต์เดิม.
*   ติดตั้งและตั้งค่า Supabase JS Client Library.
*   สร้างการเชื่อมต่อพื้นฐานไปยัง Supabase Project.
*   Implement ระบบ Authentication (Login/Logout) โดยใช้ Supabase Auth.
*   สร้าง Pinia stores และ composables พื้นฐานสำหรับติดต่อกับ Supabase.

### ✅ สิ่งที่ต้องทำ:

1.  **ตั้งค่าโปรเจกต์ Vue 3**:
    *   สร้างโปรเจกต์ใหม่ด้วย Vite: `npm create vite@latest repair_shop-supabase-app -- --template vue-ts` .
    *   ติดตั้ง dependencies พื้นฐาน: `vue-router`, `pinia`, `element-plus`.
    *   ตั้งค่า ESLint, Prettier (ตาม "แนวทางการพัฒนาที่เป็นมาตรฐาน").

2.  **ติดตั้ง Supabase JS Client Library**:
    *   รัน: `npm install @supabase/supabase-js`

3.  **สร้างไฟล์ Config สำหรับ Supabase**:
    *   สร้างไฟล์ `src/supabaseClient.ts` (หรือชื่อที่เหมาะสม).
    *   ใส่ Project URL และ `anon` key ที่ได้จาก Supabase Project settings:
        ```typescript
        // src/supabaseClient.ts
        import { createClient } from '@supabase/supabase-js'

        const supabaseUrl = 'YOUR_SUPABASE_URL' // แทนที่ด้วย Project URL ของคุณ
        const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // แทนที่ด้วย anon key ของคุณ

        export const supabase = createClient(supabaseUrl, supabaseAnonKey)
        ```
    *   **สำคัญ**: เก็บ Keys เหล่านี้ใน environment variables (.env) เพื่อความปลอดภัย ไม่ควร hardcode ใน source control โดยตรงสำหรับ production.
        *   สร้าง `.env` ไฟล์: `VITE_SUPABASE_URL=YOUR_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`.
        *   แก้ไข `src/supabaseClient.ts`:
            ```typescript
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
            ```
        *   เพิ่ม `.env` เข้า `.gitignore`.

4.  **ตั้งค่าระบบ Authentication (Supabase Auth)**:
    *   สร้าง `AuthStore` (Pinia store) หรือ `useAuth` composable.
    *   **Login**: Implement ฟังก์ชัน login (เช่น email/password) โดยใช้ `supabase.auth.signInWithPassword()`.
        ```typescript
        // ตัวอย่างใน AuthStore
        async function login(email, password) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          // จัดการ user session, อัปเดต state
        }
        ```
    *   **Logout**: Implement ฟังก์ชัน logout โดยใช้ `supabase.auth.signOut()`.
    *   **User State**: จัดการสถานะของผู้ใช้ (logged in/out, user object) โดยใช้ `supabase.auth.onAuthStateChange()` เพื่อ listen การเปลี่ยนแปลงสถานะ และอัปเดต Pinia store.
    *   **Route Guards**: สร้าง route guards ใน `vue-router` เพื่อป้องกันการเข้าถึงหน้าที่ต้อง login.
    *   สร้างหน้า Login UI.

5.  **สร้าง Composable สำหรับ Supabase Data Access**:
    *   สร้าง composable ใหม่ เช่น `src/composables/useSupabaseTable.ts` (คล้าย `useFirestore` เดิม).
    *   ฟังก์ชันภายใน composable นี้จะรับชื่อตารางเป็น argument และ return methods สำหรับ CRUD:
        *   `getAll(columns = '*')`: `supabase.from(tableName).select(columns)`
        *   `getById(id, columns = '*')`: `supabase.from(tableName).select(columns).eq('id', id).single()`
        *   `create(data)`: `supabase.from(tableName).insert(data).select().single()` (Supabase v2 แนะนำให้ .select().single() เพื่อรับ record ที่สร้างกลับมา)
        *   `update(id, data)`: `supabase.from(tableName).update(data).eq('id', id).select().single()`
        *   `remove(id)`: `supabase.from(tableName).delete().eq('id', id)`
    *   จัดการ error handling และ loading state ภายใน composable หรือใน store ที่เรียกใช้.

6.  **สร้าง Pinia Stores สำหรับแต่ละ Feature**:
    *   เช่น `ProductStore`, `CustomerStore`, `PurchaseStore`, `StockStore`.
    *   แต่ละ store จะ import และใช้ `useSupabaseTable` (หรือเรียก `supabase` client โดยตรง) เพื่อดึงและจัดการข้อมูล.
    *   ปรับปรุง Type Definitions (`src/types/[featureName].ts`) ให้สอดคล้องกับ schema ใน PostgreSQL (เช่น `id` เป็น `string` (uuid), `created_at`/`updated_at` เป็น `string` หรือ `Date` หลังจากแปลงจาก `timestamptz`).

7.  **ทดลองเชื่อมต่อและดึงข้อมูลพื้นฐาน**:
    *   สร้างหน้าทดสอบง่ายๆ เพื่อดึงข้อมูลจากตารางที่สร้างไว้ในเฟส 0 (เช่น Customers, Products) โดยใช้ store และ composable ใหม่.

---

## 🔸 เฟส 2: พัฒนาฟังก์ชันหลัก (Frontend CRUD และ Business Logic เบื้องต้นด้วย Supabase Edge Functions)

### 🎯 เป้าหมาย:
*   Implement CRUD operations สำหรับ Features หลัก (Customers, Suppliers, Products, Purchases, Stock, Sales, Repairs) ใน Vue Frontend โดยเชื่อมต่อกับ Supabase Database.
*   พัฒนา Supabase Edge Function แรกสำหรับอัปเดตสต็อกเมื่อรับสินค้า (Purchase Received).
*   สร้างหน้า UI ที่จำเป็นสำหรับแต่ละ Feature โดยอิงตาม "แนวทางการพัฒนาที่เป็นมาตรฐาน".

### ✅ สิ่งที่ต้องทำ:

1.  **พัฒนาหน้า CRUD สำหรับ Customers, Suppliers, Products**:
    *   สร้าง/ปรับปรุง `View`, `Form`, `Table` components และ `Store` (Pinia) สำหรับแต่ละ feature.
    *   Store จะใช้ `useSupabaseTable` composable (หรือเรียก Supabase client โดยตรง) เพื่อทำ CRUD.
    *   จัดการเรื่องการแสดงผล, validation, loading/error states.
    *   สำหรับ Products, `average_cost` จะยังไม่ถูกคำนวณอัตโนมัติในเฟสนี้ (รอ Edge Function ในเฟส 4).

2.  **พัฒนาหน้า Purchases และ Stock UI**:
    *   **Purchases**:
        *   สร้าง UI สำหรับสร้างใบสั่งซื้อ, เลือก Supplier, เพิ่ม/ลบ `purchase_items` (เลือก Product, ใส่จำนวน, ราคาซื้อ).
        *   คำนวณ `total_amount` ในฝั่ง Client หรือเมื่อบันทึก.
        *   อัปเดตสถานะใบสั่งซื้อ (Pending, Received, Cancelled).
    *   **Stock UI**:
        *   สร้าง `StockTable` เพื่อแสดงข้อมูลจากตาราง `stocks` (รวม `productName`, `productCode`, `unitName` ที่ denormalize หรือ join มา).
        *   แสดง `min_stock`, `current_stock`, `status`.
        *   Implement UI สำหรับให้ผู้ใช้แก้ไข `min_stock` ของแต่ละสินค้า (เรียก `update` ใน `stockStore`).

3.  **พัฒนา Supabase Edge Function: อัปเดตสต็อกจากการสั่งซื้อ (Purchase Received)**:
    *   **ตั้งค่า Supabase CLI และ Project สำหรับ Edge Functions**:
        *   ติดตั้ง Supabase CLI: `npm install supabase --save-dev` (หรือ global).
        *   Login: `supabase login`.
        *   Link project: `supabase link --project-ref YOUR_PROJECT_REF`.
        *   สร้าง Edge Function ใหม่: `supabase functions new purchase-received-stock-update`.
    *   **เขียนโค้ด Function (TypeScript/Deno)** ใน `supabase/functions/purchase-received-stock-update/index.ts`:
        *   **Trigger**: Function นี้อาจจะต้องถูกเรียกผ่าน HTTP request จาก Frontend เมื่อสถานะ Purchase เปลี่ยนเป็น "Received" (เพราะ Supabase Database Webhooks อาจจะยังไม่รองรับ event ที่ซับซ้อนเท่า Firestore Triggers โดยตรงสำหรับ Free Tier หรืออาจจะต้องใช้ PostgreSQL Triggers + Supabase Realtime ซึ่งซับซ้อนกว่า). หรืออีกทางเลือกคือใช้ Scheduled Function ที่ตรวจสอบ Purchases ที่มีสถานะ Received และ `stock_update_processed = false` เป็นระยะ.
            *   *ทางเลือกที่ง่ายที่สุดเบื้องต้น*: Frontend เรียก Edge Function โดยตรงหลังเปลี่ยนสถานะ Purchase.
        *   **Logic**:
            *   รับ `purchase_id` เป็น input.
            *   ตรวจสอบว่า `purchase_id` นี้ `status` เป็น "Received" และ `stock_update_processed` เป็น `false`.
            *   อ่าน `purchase_items` จากตาราง `purchase_items` ที่เกี่ยวข้องกับ `purchase_id`.
            *   สำหรับแต่ละ item:
                *   ใช้ Supabase client (ภายใน Edge Function) เพื่ออัปเดต `current_stock` ในตาราง `stocks` (ใช้ `increment` หรือ transaction).
                *   (Optional) คำนวณและอัปเดต `status` ของสต็อก.
                *   อัปเดต `last_updated_at` ใน `stocks`.
            *   อัปเดต `stock_update_processed = true` และ `updated_at` ในตาราง `purchases`.
        *   จัดการ Error handling และ Logging.
    *   **Deploy Function**: `supabase functions deploy purchase-received-stock-update`.
    *   **ทดสอบ**: เปลี่ยนสถานะ Purchase ใน UI ให้เป็น "Received" และตรวจสอบว่า Edge Function ทำงานและอัปเดตสต็อกถูกต้อง.

4.  **พัฒนาหน้า Sales (UI และ Logic เบื้องต้น)**:
    *   สร้าง UI สำหรับสร้างรายการขาย, เลือก Customer, เพิ่ม/ลบ `sale_items`.
    *   **การตัดสต็อก**:
        *   **ทางเลือก A (Edge Function)**: สร้าง Edge Function ใหม่สำหรับตัดสต็อกเมื่อมีการขาย (คล้ายกับ Purchase Received แต่เป็นการลดสต็อก). Frontend เรียก Function นี้หลังยืนยันการขาย.
        *   **ทางเลือก B (Client-side ชั่วคราว - ไม่แนะนำสำหรับ Production)**: ให้ Client อัปเดต `current_stock` โดยตรง (ต้องระวังเรื่อง RLS).
        *   (เลือกทาง A เป็นหลัก)

5.  **พัฒนาหน้า Repairs (UI และ Logic เบื้องต้น)**:
    *   สร้าง UI สำหรับสร้างงานซ่อม, เลือก Customer, เพิ่ม/ลบ `used_parts`.
    *   **การตัดสต็อกอะไหล่**: คล้ายกับ Sales.
    *   `parts_cost`, `total_cost` จะยังไม่คำนวณอัตโนมัติในเฟสนี้.

6.  **ปรับปรุง Type Definitions และ Stores**:
    *   สร้าง/ปรับปรุง `src/types/[featureName].ts` ให้ตรงกับ Schema ของ Supabase.
    *   ปรับปรุง Pinia Stores ให้ใช้ Supabase client และจัดการ state สำหรับแต่ละ feature.

7.  **ปรับปรุง Row Level Security (RLS) Policies**:
    *   ตรวจสอบและปรับปรุง RLS policies สำหรับตารางใหม่ๆ และ CRUD operations ที่เพิ่มเข้ามา.
    *   เช่น Policy สำหรับ `stocks` อาจจะอนุญาตให้ Edge Functions (ที่ใช้ service_role key) อัปเดต `current_stock` ได้ แต่ไม่อนุญาตให้ client ทำโดยตรง.

---

## 🟢 เฟส 3: Deploy และการจัดการ Environment

### 🎯 เป้าหมาย:
*   Deploy Vue 3 Frontend ขึ้น Static Hosting (เช่น Vercel, Netlify, GitHub Pages, Firebase Hosting).
*   Deploy Supabase Edge Functions.
*   จัดการ Environment Variables สำหรับ Frontend และ Edge Functions อย่างปลอดภัย.
*   ทดสอบการทำงานของระบบทั้งหมดใน Environment ที่ใกล้เคียง Production.

### ✅ สิ่งที่ต้องทำ:

1.  **จัดการ Environment Variables สำหรับ Frontend (Vue App)**:
    *   ในไฟล์ `.env.development`:
        *   `VITE_SUPABASE_URL=YOUR_DEV_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY=YOUR_DEV_SUPABASE_ANON_KEY`
    *   ในไฟล์ `.env.production`:
        *   `VITE_SUPABASE_URL=YOUR_PROD_SUPABASE_URL` (ควรจะเป็น URL เดียวกันถ้าใช้โปรเจกต์ Supabase เดียว)
        *   `VITE_SUPABASE_ANON_KEY=YOUR_PROD_SUPABASE_ANON_KEY` (ควรจะเป็น Anon Key เดียวกัน)
    *   **สำคัญ**: เพิ่ม `.env*` (ยกเว้น `.env.example`) เข้า `.gitignore`.
    *   ในการตั้งค่าของ Hosting Provider (เช่น Vercel, Netlify): กำหนด Environment Variables เหล่านี้สำหรับ Production Build.

2.  **เตรียม Frontend สำหรับ Build**:
    *   ตรวจสอบ TypeScript Errors และ ESLint warnings ทั้งหมดและแก้ไข.
    *   ลบ `console.log` ที่ไม่จำเป็นออก.
    *   ทดสอบการทำงานของระบบทั้งหมดใน Local Development อีกครั้ง.

3.  **Build Frontend สำหรับ Production**:
    *   รันคำสั่ง Build: `npm run build` (หรือ `yarn build`).
    *   ตรวจสอบผลลัพธ์ในโฟลเดอร์ `dist/`.

4.  **Deploy Frontend ขึ้น Static Hosting**:
    *   เลือกผู้ให้บริการ Static Hosting เช่น:
        *   **Vercel**: เชื่อมต่อกับ Git repository (GitHub, GitLab, Bitbucket) และตั้งค่า Build command (`npm run build`) และ Output directory (`dist`). Vercel มี Free Tier ที่ดี.
        *   **Netlify**: คล้าย Vercel.
        *   **GitHub Pages**: ถ้าโปรเจกต์เป็น Open Source หรือ Public repository.
        *   **Firebase Hosting**: ก็ยังสามารถใช้ Firebase Hosting สำหรับ deploy Vue app ได้ แม้ว่า Backend จะเป็น Supabase.
    *   ตั้งค่า Custom Domain (ถ้ามี).

5.  **Deploy Supabase Edge Functions**:
    *   ใช้ Supabase CLI เพื่อ deploy functions ที่พัฒนาในเฟส 2:
        ```bash
        supabase functions deploy <function_name> --project-ref YOUR_PROJECT_REF
        # หรือ deploy ทุก functions
        # supabase functions deploy --project-ref YOUR_PROJECT_REF
        ```
    *   (Optional) ตั้งค่า Environment Variables สำหรับ Edge Functions ใน Supabase Dashboard (Project Settings -> Functions -> เลือก Function -> Environment Variables) หรือผ่าน `supabase/config.toml` ถ้าจำเป็น.

6.  **ทดสอบระบบทั้งหมดบน Production/Staging Environment**:
    *   ทดสอบการทำงานของ Frontend ที่ deploy แล้ว ว่าสามารถเชื่อมต่อกับ Supabase Backend และ Edge Functions ได้ถูกต้อง.
    *   ทดสอบ CRUD operations, Authentication, และ Business Logic (เช่น Stock Update).
    *   ตรวจสอบ Console Logs ของ Browser และ Logs ของ Edge Functions ใน Supabase Dashboard.

---

## 🔴 เฟส 4: สร้าง Supabase Edge Functions เพิ่มเติมสำหรับ Business Logic อัตโนมัติ

### 🎯 เป้าหมาย:
*   Implement Business Logic ที่ซับซ้อนขึ้นโดยใช้ Supabase Edge Functions.
*   ทำให้การจัดการสต็อก (จาก Sales/Repairs) และการคำนวณต้นทุน (Average Cost, Repair Costs) เกิดขึ้นอัตโนมัติ.
*   ลดภาระการคำนวณฝั่ง Client และเพิ่มความถูกต้องของข้อมูล.
*   สร้างระบบที่มีความทนทานต่อความผิดพลาด (Fault Tolerance) สำหรับ Edge Functions.

### ✅ สิ่งที่ต้องทำ:

1.  **ตั้งค่าโปรเจกต์ Supabase CLI สำหรับ Edge Functions (ถ้ายังไม่สมบูรณ์)**:
    *   ตรวจสอบว่า Supabase CLI ทำงานได้ถูกต้อง และสามารถ deploy/manage Edge Functions ได้.
    *   จัดโครงสร้างโฟลเดอร์ `supabase/functions/` ให้เป็นระเบียบ (เช่น แยกแต่ละ function เป็น sub-directory).

2.  **พัฒนา Edge Function: อัปเดตสต็อกจากการขาย (Sales Stock Deduction)**:
    *   **Trigger**: HTTP Request จาก Frontend หลังยืนยันการขาย หรือ Database Webhook/PostgreSQL Trigger (ถ้าตั้งค่าได้) เมื่อมีการสร้าง `sales` record ใหม่ (และ `payment_status` เหมาะสม).
    *   **Logic**:
        *   รับ `sale_id` เป็น input.
        *   อ่าน `sale_items` ที่เกี่ยวข้อง.
        *   สำหรับแต่ละ item, ลด `current_stock` ในตาราง `stocks`.
        *   (Optional) คำนวณและอัปเดต `status` ของสต็อก.
        *   อัปเดต `last_updated_at` ใน `stocks`.
        *   ตั้งค่า `stock_update_processed = true` (หรือ field ที่คล้ายกัน) ใน `sales` record.
    *   จัดการ Idempotency, Error Handling, Logging.
    *   **Deploy และทดสอบ**.

3.  **พัฒนา Edge Function: อัปเดตสต็อกจากการซ่อม (Repairs Used Parts Deduction)**:
    *   คล้ายกับ Sales Stock Deduction แต่ trigger จาก `repairs` และ `used_parts`.

4.  **พัฒนา Edge Function: คำนวณต้นทุนเฉลี่ยสินค้า (Average Cost Calculation)**:
    *   **Trigger**: HTTP Request จาก Frontend หลังมีการเพิ่ม `purchase_items` ใหม่, หรือ Database Webhook/PostgreSQL Trigger เมื่อมีการ insert ใน `purchase_items`.
    *   **Logic**:
        *   รับ `product_id` และข้อมูลการซื้อใหม่ (quantity, price).
        *   อ่านข้อมูลการซื้อเก่าๆ หรือ `current_stock` และ `average_cost` เดิมของ product นั้น.
        *   คำนวณ `average_cost` ใหม่ (เช่น Weighted Average).
        *   อัปเดต `average_cost` ในตาราง `products`.
    *   จัดการ Error Handling, Logging.
    *   **Deploy และทดสอบ**.

5.  **พัฒนา Edge Function: คำนวณต้นทุนในงานซ่อม (Repair Costs Calculation)**:
    *   **Trigger**: HTTP Request จาก Frontend เมื่อมีการเปลี่ยนแปลง `used_parts` หรือ `labor_cost` ในงานซ่อม, หรือ Database Webhook/PostgreSQL Trigger.
    *   **Logic**:
        *   รับ `repair_id`.
        *   คำนวณ `parts_cost` จากผลรวมของ `total_cost` ของ `used_parts` ที่เกี่ยวข้อง.
        *   คำนวณ `total_cost` ของงานซ่อม (`parts_cost + labor_cost`).
        *   อัปเดต `parts_cost` และ `total_cost` ในตาราง `repairs`.
    *   จัดการ Error Handling, Logging.
    *   **Deploy และทดสอบ**.

6.  **การจัดการข้อผิดพลาดและ Retry สำหรับ Edge Functions**:
    *   ใช้ `try...catch` ในทุก function.
    *   พิจารณาการใช้ Dead Letter Queues (ถ้า Supabase รองรับ หรือ implement เอง) สำหรับ event ที่ประมวลผลไม่สำเร็จ.
    *   Logging ที่ละเอียดเพียงพอสำหรับการ Debug.

7.  **การจัดการ Environment Variables สำหรับ Edge Functions**:
    *   ใช้ Supabase Dashboard (Project Settings -> Functions) หรือ `supabase/config.toml` เพื่อจัดการ secrets และ environment variables ที่ Edge Functions ต้องใช้ (เช่น API keys ภายนอก ถ้ามี).

---

## ⚙️ เฟส 5: การปรับปรุงความปลอดภัยและบำรุงรักษา

### 🎯 เป้าหมาย:
*   เสริมความแข็งแกร่งของนโยบาย Row Level Security (RLS).
*   ปรับปรุงประสิทธิภาพของ Database Queries และ Edge Functions.
*   ตั้งค่าระบบ Monitoring และ Alerting (ถ้า Supabase Free Tier รองรับ หรือใช้เครื่องมือภายนอก).
*   วางแผนการสำรองข้อมูล (Backup) และการกู้คืน (Recovery) อย่างสม่ำเสมอ.
*   ปรับปรุงคุณภาพโค้ด (Code Quality) และเอกสาร (Documentation).

### ✅ สิ่งที่ต้องทำ:

1.  **ทบทวนและปรับปรุง Row Level Security (RLS) Policies**:
    *   ทำให้ละเอียดขึ้น: กำหนดสิทธิ์การเข้าถึง (SELECT, INSERT, UPDATE, DELETE) ให้แคบที่สุดเท่าที่จำเป็นสำหรับแต่ละตารางและบทบาทผู้ใช้ (role).
    *   ตรวจสอบความเป็นเจ้าของข้อมูล (`auth.uid() = user_id`) อย่างเข้มงวด.
    *   เพิ่มการตรวจสอบข้อมูล (Data Validation) ใน RLS policies หรือใช้ Database Constraints/Triggers เพื่อให้แน่ใจว่าข้อมูลที่เขียนเข้ามาถูกต้องตามรูปแบบ.
    *   ป้องกันการเขียนข้อมูลที่ควรจัดการโดย Edge Functions เท่านั้น (เช่น `current_stock` อาจจะให้อัปเดตได้เฉพาะ Edge Function ที่มี `service_role_key`).
    *   ทดสอบ RLS policies อย่างละเอียด.

2.  **การปรับปรุงประสิทธิภาพ (Performance Tuning)**:
    *   **Database Indexing**: หากมี Query ที่ทำงานช้า ให้ตรวจสอบและสร้าง Composite Index ที่จำเป็นใน PostgreSQL (ใช้ `EXPLAIN ANALYZE` ใน SQL Editor).
    *   **Query Optimization**: ปรับปรุง Supabase queries ใน Frontend และ Edge Functions ให้มีประสิทธิภาพ (เช่น select เฉพาะ columns ที่ต้องการ, ใช้ filter ที่เหมาะสม, ลดจำนวน query).
    *   **Edge Function Optimization**: ตรวจสอบระยะเวลาการทำงานของ Edge Functions และพิจารณาการ optimize ถ้าทำงานช้าหรือใช้ resource มากเกินไป.
    *   **Frontend Performance**: ตรวจสอบและปรับปรุงประสิทธิภาพของ Vue App (เช่น Code Splitting, Lazy Loading, ลดขนาด Bundle).

3.  **การตรวจสอบและ Monitoring**:
    *   ตรวจสอบ Logs ของ Supabase (Database, Auth, Edge Functions) ใน Dashboard เพื่อหาข้อผิดพลาดหรือปัญหา.
    *   (ถ้า Free Tier รองรับ หรือใช้เครื่องมือภายนอก) ตั้งค่าการแจ้งเตือน (Alerting) สำหรับข้อผิดพลาดร้ายแรงหรือการใช้งานที่ผิดปกติ.
    *   พิจารณาใช้เครื่องมือ Monitoring ภายนอก (เช่น UptimeRobot สำหรับตรวจสอบ liveness ของ Frontend/API) ถ้าจำเป็น.

4.  **การสำรองข้อมูล (Backup) และการกู้คืน (Recovery)**:
    *   **Supabase Backups**: ตรวจสอบนโยบายการ backup อัตโนมัติของ Supabase Free Tier (อาจจะมีการ backup รายวัน แต่มีระยะเวลาเก็บรักษาจำกัด).
    *   **Manual Backups**: พิจารณาการทำ manual backup ของ PostgreSQL database (เช่น ใช้ `pg_dump` ผ่าน Supabase SQL Editor หรือ CLI) เป็นระยะ และเก็บไว้ในที่ปลอดภัย.
    *   **ทดสอบการกู้คืน**: (ถ้าเป็นไปได้) ทดลองกู้คืนข้อมูลจาก backup ไปยัง environment ทดสอบ.

5.  **การปรับปรุงโค้ดและเอกสาร**:
    *   Refactor โค้ดที่ซับซ้อนหรือยากต่อการบำรุงรักษา ทั้งใน Frontend และ Edge Functions.
    *   เพิ่ม Comments และ Documentation ที่จำเป็น.
    *   อัปเดต Type Definitions ให้ตรงกับ Schema ล่าสุดเสมอ.
    *   ปรับปรุงการจัดการ Error Handling ให้ครอบคลุมมากขึ้น.

---

## 🟣 เฟสเสริม (พิจารณาหลังระบบหลักใช้งานได้)

| คุณสมบัติ/ระบบ                               | รายละเอียดเบื้องต้น                                                                                                | ความสำคัญ (สูง/กลาง/ต่ำ) |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **ระบบ Role (Admin/User) ที่ละเอียดขึ้น**   | กำหนดสิทธิ์การเข้าถึงข้อมูล/ฟังก์ชันที่แตกต่างกันมากขึ้นตามบทบาทผู้ใช้ (เช่น Admin เห็นข้อมูลทั้งหมด, User เห็นเฉพาะของตัวเอง) | สูง                     |
| **การค้นหา/กรองข้อมูลขั้นสูง**              | ทำให้การค้นหาข้อมูลลูกค้า, สินค้า, งานซ่อม, ฯลฯ มีประสิทธิภาพและยืดหยุ่นมากขึ้น (เช่น กรองตามช่วงวันที่, หลายเงื่อนไข) | กลาง                    |
| **การรายงานพื้นฐาน (Dashboard)**             | แสดงข้อมูลสรุปที่สำคัญ เช่น ยอดขายรายวัน/รายเดือน, สต็อกคงเหลือ, สินค้าขายดี, อะไหล่ใช้บ่อย, งานซ่อมที่ค้างอยู่        | กลาง                    |
| **การแจ้งเตือน (Notifications)**             | เช่น แจ้งเตือนเมื่อสต็อกใกล้หมด, แจ้งเตือนลูกค้าเมื่อสถานะงานซ่อมเปลี่ยนแปลง (อาจจะผ่าน Email หรือ In-app)             | กลาง                    |
| **การอัปโหลดรูปภาพ/ไฟล์**                    | สำหรับรูปสินค้า, รูปโปรไฟล์ลูกค้า, รูปงานซ่อม (ใช้ Supabase Storage)                                                | กลาง                    |
| **การปรับปรุง UI/UX เพิ่มเติม**               | ทำให้หน้าตาสวยงามและใช้งานง่ายยิ่งขึ้นตาม Feedback จากผู้ใช้                                                          | ต่ำ                     |
| **Responsive Design ที่ดีขึ้น**              | ปรับปรุงให้รองรับการใช้งานบนมือถือและแท็บเล็ตได้ดีขึ้นในทุกหน้า                                                       | ต่ำ                     |
| **การจัดการผู้ใช้งาน (Admin Panel)**          | หน้าสำหรับ Admin จัดการบัญชีผู้ใช้, บทบาท, หรือข้อมูลอื่นๆ ของผู้ใช้ (ถ้ามีผู้ใช้หลายคนในระบบ)                       | ต่ำ (ถ้าใช้คนเดียว)     |
| **การ Export ข้อมูล**                       | ฟังก์ชันสำหรับ Export ข้อมูลสำคัญ (เช่น รายการสินค้า, ลูกค้า, ยอดขาย) ออกเป็น CSV/Excel                               | ต่ำ                     |
| **การทำ Localization (i18n)**              | ถ้าต้องการรองรับหลายภาษา                                                                                             | ต่ำ                     |

---
(สิ้นสุดแผนพัฒนา)
