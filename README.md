# ระบบร้านซ่อมสินค้า (Repair Shop) ด้วย Vue 3 + Supabase

โปรเจ็กต์นี้เป็นระบบร้านซ่อมสินค้า พัฒนาโดยใช้ Vue 3 (Vite + TypeScript), Vuetify 3 สำหรับ UI, Supabase เป็น Backend (Database, Auth, Storage) และ SCSS สำหรับจัดการสไตล์ รองรับ Responsive Design และแยกโครงสร้างโค้ดอย่างเป็นระบบ

## คุณสมบัติหลัก
- ระบบจัดการลูกค้า ซัพพลายเออร์ สินค้า สต็อก การซื้อ-ขาย การซ่อม ฯลฯ
- ระบบ Authentication (Email/Password) เชื่อมกับ Supabase
- ใช้ Base Components (BaseTable, BaseForm, BaseCard) และ Composables (useTable, useForm, useFilter) เพื่อความเป็นระเบียบและนำกลับมาใช้ซ้ำ
- แยกไฟล์ SCSS: variables, utilities, และสไตล์เฉพาะคอมโพเนนต์
- รองรับ Responsive Design (Mobile/Tablet/Desktop)

## โครงสร้างโปรเจ็กต์ (ย่อ)
```
src/
├── components/
│   ├── common/        # Base Components
│   ├── customer/      # Customer Feature
│   └── repair/        # Repair Feature
├── composables/       # useTable, useForm, useFilter ฯลฯ
├── stores/            # Pinia Stores
├── styles/
│   ├── variables.scss
│   ├── utilities.scss
│   └── customer-list.scss ฯลฯ
├── views/             # Main Pages
└── supabaseClient.ts  # Supabase Config
```

## วิธีติดตั้งและใช้งาน
1. **Clone โปรเจ็กต์**
   ```bash
   git clone https://github.com/konglife/repair_shop-supabase-app.git
   cd repair_shop-supabase-app
   ```
2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   # หรือ
   yarn install
   ```
3. **ตั้งค่า Environment Variables**
   - สร้างไฟล์ `.env` และกำหนดค่า SUPABASE_URL, SUPABASE_ANON_KEY ตามโปรเจ็กต์ของคุณ
   ```env
   VITE_SUPABASE_URL=xxx
   VITE_SUPABASE_ANON_KEY=xxx
   ```
4. **เริ่มต้นเซิร์ฟเวอร์สำหรับพัฒนา**
   ```bash
   npm run dev
   ```
5. **Build สำหรับ Production**
   ```bash
   npm run build
   ```

## เอกสารที่เกี่ยวข้อง
- `เอกสารที่เกี่ยวข้อง/แผนพัฒนาโปรเจกต์_Vue3_Supabase.md` — สรุปแผนและแนวคิดการพัฒนา
- `เอกสารที่เกี่ยวข้อง/แนวทางการปรับปรุงโครงสร้างโค้ด.md` — โครงสร้างโค้ดและแนวปฏิบัติ
- `เอกสารที่เกี่ยวข้อง/การออกแบบ_UI_UX_Vuetify3.md` — การออกแบบ UI/UX

## หมายเหตุ
- มีการแยก SCSS ตามคอมโพเนนต์และส่วนกลาง เพิ่มความเฉพาะเจาะจง selector เพื่อป้องกัน style ทับกับ Vuetify
- โปรเจ็กต์นี้ใช้ `<script setup>` syntax ใน Vue SFC
- ไม่ควร commit โฟลเดอร์ `เอกสารที่เกี่ยวข้อง/` ขึ้น git

## License
[MIT](LICENSE)
