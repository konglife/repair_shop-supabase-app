<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupplierStore } from '../stores/supplier';
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/common/useForm';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const BaseForm = defineAsyncComponent(() => import('../components/common/BaseForm.vue'));

const route = useRoute();
const router = useRouter();
const supplierStore = useSupplierStore();
const authStore = useAuthStore();
const { success, error: showError } = useNotification();

// ตรวจสอบว่าเป็นการแก้ไขหรือเพิ่มใหม่
const isEditMode = computed(() => route.params.id !== undefined);
const supplierId = computed(() => route.params.id as string);

// สถานะของฟอร์ม
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// ข้อมูลซัพพลายเออร์เริ่มต้น
interface SupplierFormData {
  id: string;
  name: string;
  phone: string | null;
  url: string | null;
  note: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const initialSupplier: SupplierFormData = {
  id: '',
  name: '',
  phone: null,
  url: null,
  note: null,
  user_id: authStore.user?.id || ''
  // ไม่ต้องกำหนดค่า created_at และ updated_at เพราะจะถูกสร้างโดยอัตโนมัติที่ฝั่ง database
};

// กฎการตรวจสอบข้อมูล
const validationRules = {
  name: [
    (v: string) => !!v || 'กรุณากรอกชื่อซัพพลายเออร์',
    (v: string) => v.length >= 2 || 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  ],
  phone: [
    (v: string | null) => !v || /^\d{9,10}$/.test(v) || 'เบอร์โทรศัพท์ไม่ถูกต้อง',
  ],
  url: [
    (v: string | null) => !v || /^(https?:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?)?$/.test(v) || 'URL ไม่ถูกต้อง',
  ],
};

// ใช้ useForm composable
const form = useForm<SupplierFormData>({
  initialValues: { ...initialSupplier },
  validationRules
});

// สร้าง computed properties สำหรับการ bind ค่าในฟอร์ม
const name = computed({
  get: () => form.values.value.name,
  set: (value) => form.setFieldValue('name', value)
});

const phone = computed({
  get: () => form.values.value.phone,
  set: (value) => form.setFieldValue('phone', value)
});

const url = computed({
  get: () => form.values.value.url,
  set: (value) => form.setFieldValue('url', value)
});

const note = computed({
  get: () => form.values.value.note,
  set: (value) => form.setFieldValue('note', value)
});

// สร้าง refs สำหรับข้อผิดพลาดของฟอร์ม
const nameError = computed(() => form.errors.value['name'] || '');
const phoneError = computed(() => form.errors.value['phone'] || '');
const urlError = computed(() => form.errors.value['url'] || '');

// โหลดข้อมูลซัพพลายเออร์ในกรณีแก้ไข
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true;
    try {
      await supplierStore.fetchSupplierById(supplierId.value);
      if (supplierStore.selectedSupplier) {
        // นำข้อมูลที่ได้มาใส่ในฟอร์ม
        const supplier = supplierStore.selectedSupplier;
        // อัปเดตค่าแต่ละฟิลด์โดยตรง
        form.setFieldValue('id', supplier.id);
        form.setFieldValue('name', supplier.name);
        form.setFieldValue('phone', supplier.phone);
        form.setFieldValue('url', supplier.url);
        form.setFieldValue('note', supplier.note);
        form.setFieldValue('user_id', supplier.user_id);
        // เก็บค่า timestamps ไว้ใช้ในกรณีแก้ไข
        if ('created_at' in form.values.value) {
          form.values.value.created_at = supplier.created_at;
        }
        if ('updated_at' in form.values.value) {
          form.values.value.updated_at = supplier.updated_at;
        }
      } else {
        errorMessage.value = 'ไม่พบข้อมูลซัพพลายเออร์';
        showError('ไม่พบข้อมูลซัพพลายเออร์');
      }
    } catch (err) {
      errorMessage.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Error loading supplier:', err);
    } finally {
      loading.value = false;
    }
  }
});

// กำหนด interface สำหรับ VForm เพื่อแก้ไข TypeScript errors
interface VForm {
  validate: () => Promise<{ valid: boolean; errors: any[] }>;
  reset: () => void;
}

// อ้างอิงถึง v-form โดยตรง
const vForm = ref<VForm | null>(null);

/**
 * บันทึกข้อมูลซัพพลายเออร์
 * @param event อีเวนต์ที่ส่งมาจากฟอร์ม
 */
const saveSupplier = async (event?: Event | any) => {
  console.log('saveSupplier called', event);
  
  // ป้องกัน event ถ้ามี
  if (event && event.preventDefault) {
    event.preventDefault();
  }
  
  // ตรวจสอบความถูกต้องของข้อมูลโดยใช้ v-form โดยตรง
  console.log('Validating form...', vForm.value);
  const { valid } = await vForm.value?.validate() || { valid: false };
  console.log('Form validation result:', valid);
  
  if (!valid) {
    console.error('Form validation failed');
    showError('กรุณากรอกข้อมูลให้ถูกต้องครบถ้วน');
    return;
  }

  console.log('Form is valid, proceeding with save');
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // ใช้ค่าจาก form.values 
    console.log('Getting form data from form.values');
    const formData = form.values.value;
    console.log('Form data:', formData);
    
    // ตรวจสอบว่ามี user_id หรือไม่
    if (!formData.user_id && authStore.user) {
      console.log('Setting user_id from authStore:', authStore.user.id);
      formData.user_id = authStore.user.id;
    }

    if (isEditMode.value) {
      console.log('Edit mode - updating supplier with ID:', supplierId.value);
      // แก้ไขข้อมูล
      try {
        await supplierStore.updateSupplier(supplierId.value, {
          name: formData.name,
          phone: formData.phone,
          url: formData.url,
          note: formData.note,
        });
        console.log('Supplier updated successfully');
        successMessage.value = 'แก้ไขข้อมูลซัพพลายเออร์เรียบร้อยแล้ว';
        success('แก้ไขข้อมูลซัพพลายเออร์เรียบร้อยแล้ว');
      } catch (updateError) {
        console.error('Error updating supplier:', updateError);
        throw updateError;
      }
    } else {
      console.log('Create mode - adding new supplier');
      // เพิ่มข้อมูลใหม่
      try {
        const newSupplierData = {
          name: formData.name,
          phone: formData.phone,
          url: formData.url,
          note: formData.note,
          user_id: formData.user_id,
        };
        console.log('Creating supplier with data:', newSupplierData);
        await supplierStore.createSupplier(newSupplierData);
        console.log('Supplier created successfully');
        successMessage.value = 'เพิ่มข้อมูลซัพพลายเออร์เรียบร้อยแล้ว';
        success('เพิ่มข้อมูลซัพพลายเออร์เรียบร้อยแล้ว');
        
        // รีไดเร็กไปยังหน้ารายการซัพพลายเออร์ก่อนที่จะรีเซ็ตฟอร์ม
        console.log('Operation completed successfully, redirecting in 1.5 seconds');
        setTimeout(() => {
          router.push('/suppliers');
        }, 1500);
        
        // รีเซ็ตฟอร์มหลังจากเพิ่มข้อมูลสำเร็จ
        console.log('Resetting form');
        form.resetForm();
        if (vForm.value) {
          console.log('Resetting v-form');
          vForm.value.reset();
        }
      } catch (createError) {
        console.error('Error creating supplier:', createError);
        throw createError;
      }
    }

    // ไม่ต้องรีไดเร็กที่นี่อีก เพราะได้ทำการรีไดเร็กแล้วในกรณีของการสร้างซัพพลายเออร์ใหม่
    console.log('saveSupplier completed, loading set to false');
    loading.value = false;
  } catch (err) {
    console.error('Error in saveSupplier:', err);
    errorMessage.value = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    showError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err instanceof Error ? err.message : String(err)));
  } finally {
    console.log('saveSupplier completed, loading set to false');
    loading.value = false;
  }
};

/**
 * กลับไปหน้ารายการซัพพลายเออร์
 */
const goBack = () => {
  router.push('/suppliers');
};
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto rounded-lg" elevation="3">
          <!-- Page Header -->
          <v-card-title class="text-h5 font-weight-bold pa-4">
            {{ isEditMode ? 'แก้ไขข้อมูลซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์ใหม่' }}
          </v-card-title>

          <!-- Form Content -->
          <v-card-text class="pa-4 pt-0">
              <BaseForm ref="vForm" @submit="saveSupplier">
              <!-- ข้อความแสดงข้อผิดพลาด -->
              <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <!-- ข้อความแสดงความสำเร็จ -->
              <v-alert
                v-if="successMessage"
                type="success"
                class="mb-4"
                closable
                @click:close="successMessage = ''"
              >
                {{ successMessage }}
              </v-alert>

              <!-- ฟอร์มกรอกข้อมูล -->
              <v-text-field
                v-model="name"
                label="ชื่อซัพพลายเออร์"
                :error-messages="nameError"
                variant="outlined"
                required
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="phone"
                label="เบอร์โทรศัพท์"
                :error-messages="phoneError"
                variant="outlined"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="url"
                label="เว็บไซต์"
                :error-messages="urlError"
                variant="outlined"
                class="mb-3"
              ></v-text-field>

              <v-textarea
                v-model="note"
                label="หมายเหตุ"
                variant="outlined"
                auto-grow
                rows="3"
                class="mb-3"
              ></v-textarea>

              <!-- ปุ่มดำเนินการ -->
              <div class="d-flex justify-end mt-4">
                <v-btn
                  variant="outlined"
                  class="mr-3"
                  @click="goBack"
                  :disabled="loading"
                >
                  ยกเลิก
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  {{ isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มซัพพลายเออร์' }}
                </v-btn>
              </div>
            </BaseForm>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* สไตล์เฉพาะสำหรับฟอร์มซัพพลายเออร์ */
</style>
