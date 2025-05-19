<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerStore } from '../stores/customer';
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/common/useForm';

// Lazy load components
const BaseForm = defineAsyncComponent(() => import('../components/common/BaseForm.vue'));

const route = useRoute();
const router = useRouter();
const customerStore = useCustomerStore();
const authStore = useAuthStore();

// ตรวจสอบว่าเป็นการแก้ไขหรือเพิ่มใหม่
const isEditMode = computed(() => route.params.id !== undefined);
const customerId = computed(() => route.params.id as string);

// สถานะของฟอร์ม
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// ข้อมูลลูกค้าเริ่มต้น
interface CustomerFormData {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  profile_img_url: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const initialCustomer: CustomerFormData = {
  id: '',
  name: '',
  phone: null,
  address: null,
  profile_img_url: null,
  user_id: authStore.user?.id || ''
  // ไม่ต้องกำหนดค่า created_at และ updated_at เพราะจะถูกสร้างโดยอัตโนมัติที่ฝั่ง database
};

// กฎการตรวจสอบข้อมูล
const validationRules = {
  name: [
    (v: string) => !!v || 'กรุณากรอกชื่อลูกค้า',
    (v: string) => v.length >= 2 || 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  ],
  phone: [
    (v: string) => !v || /^\d{9,10}$/.test(v) || 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง',
  ]
};

// ใช้ useForm composable
const form = useForm<CustomerFormData>({
  initialValues: { ...initialCustomer },
  validationRules,
  onSubmit: saveCustomer
});

// สร้าง refs สำหรับแต่ละฟิลด์เพื่อแก้ปัญหา TypeScript
const name = computed({
  get: () => form.values.value.name,
  set: (value) => form.setFieldValue('name', value)
});

const phone = computed({
  get: () => form.values.value.phone,
  set: (value) => form.setFieldValue('phone', value)
});

const address = computed({
  get: () => form.values.value.address,
  set: (value) => form.setFieldValue('address', value)
});

// เพิ่มตัวแปร profileImgUrl สำหรับรูปภาพโปรไฟล์
const profileImgUrl = computed({
  get: () => form.values.value.profile_img_url,
  set: (value) => form.setFieldValue('profile_img_url', value)
});

// สร้าง refs สำหรับข้อผิดพลาดของฟอร์ม
const nameError = computed(() => form.errors.value['name'] || '');
const phoneError = computed(() => form.errors.value['phone'] || '');

// โหลดข้อมูลลูกค้าในกรณีแก้ไข
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true;
    try {
      await customerStore.fetchCustomerById(customerId.value);
      if (customerStore.selectedCustomer) {
        // อัปเดตค่าในฟอร์ม
        if (customerStore.selectedCustomer) {
          const customer = customerStore.selectedCustomer;
          // อัปเดตค่าแต่ละฟิลด์โดยตรง
          form.setFieldValue('id', customer.id);
          form.setFieldValue('name', customer.name);
          form.setFieldValue('phone', customer.phone);
          form.setFieldValue('address', customer.address);
          form.setFieldValue('profile_img_url', customer.profile_img_url);
          form.setFieldValue('user_id', customer.user_id);
          // เก็บค่า timestamps ไว้ใช้ในกรณีแก้ไข
          if ('created_at' in form.values.value) {
            form.values.value.created_at = customer.created_at;
          }
          if ('updated_at' in form.values.value) {
            form.values.value.updated_at = customer.updated_at;
          }
        }
      } else {
        errorMessage.value = 'ไม่พบข้อมูลลูกค้า';
        router.push('/customers');
      }
    } catch (error: any) {
      errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
      loading.value = false;
    }
  }
});

// บันทึกข้อมูลลูกค้า
async function saveCustomer(formData: CustomerFormData) {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    // ตรวจสอบว่ามี user_id หรือไม่ ถ้าไม่มีให้ใช้ ID ของผู้ใช้ปัจจุบัน
    if ((!formData.user_id || formData.user_id === '') && authStore.user?.id) {
      formData.user_id = authStore.user.id;
    }
    
    // ถ้ายังไม่มี user_id ให้แสดงข้อความผิดพลาด
    if (!formData.user_id || formData.user_id === '') {
      throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    }
    
    if (isEditMode.value) {
      // ในกรณีแก้ไข ไม่ต้องส่ง created_at และ updated_at ไปด้วย
      const { created_at, updated_at, ...updateData } = formData;
      await customerStore.updateCustomer(customerId.value, updateData);
      successMessage.value = 'อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว';
    } else {
      // ในกรณีสร้างใหม่ ไม่ต้องส่ง created_at และ updated_at ไปด้วย
      const { created_at, updated_at, id, ...createData } = formData;
      
      // ตรวจสอบว่ามีค่าที่จำเป็น
      console.log('Creating customer with data:', createData);
      
      await customerStore.createCustomer(createData);
      successMessage.value = 'เพิ่มลูกค้าใหม่เรียบร้อยแล้ว';
      // รีเซ็ตฟอร์มหลังจากเพิ่มลูกค้าใหม่
      form.resetForm();
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    console.error('Error saving customer:', error);
  } finally {
    loading.value = false;
  }
};

// กลับไปหน้ารายการลูกค้า
const goBack = () => {
  router.push('/customers');
};
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" class="mx-auto customer-form__card">
          <v-card-title class="d-flex justify-space-between align-center flex-wrap customer-form__header">
            <div>
              <span class="customer-form__title">{{ isEditMode ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่' }}</span>
              <p class="customer-form__subtitle">
                {{ isEditMode ? 'แก้ไขข้อมูลลูกค้าที่มีอยู่ในระบบ' : 'เพิ่มข้อมูลลูกค้าใหม่เข้าสู่ระบบ' }}
              </p>
            </div>
          </v-card-title>
          <v-card-text>
            <!-- แสดงข้อความแจ้งเตือน -->
            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable>
              {{ errorMessage }}
            </v-alert>
            
            <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable>
              {{ successMessage }}
            </v-alert>
            
            <!-- สถานะกำลังโหลด -->
            <div v-if="loading" class="d-flex justify-center my-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            
            <div v-else>
              <!-- ใช้ BaseForm component -->
              <BaseForm
                :loading="loading || customerStore.loading"
                @submit="form.handleSubmit"
              >
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="name"
                      label="ชื่อลูกค้า *"
                      :error-messages="nameError"
                      variant="outlined"
                      density="comfortable"
                      @input="form.validateField('name')"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-text-field
                      v-model="phone"
                      label="เบอร์โทรศัพท์"
                      :error-messages="phoneError"
                      variant="outlined"
                      density="comfortable"
                      @input="form.validateField('phone')"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="address"
                      label="ที่อยู่"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-text-field
                      v-model="profileImgUrl"
                      label="URL รูปโปรไฟล์"
                      variant="outlined"
                      density="comfortable"
                      placeholder="https://example.com/image.jpg"
                    ></v-text-field>
                  </v-col>
                </v-row>
                
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    variant="outlined"
                    rounded="xl"
                    class="mr-2"
                    @click="goBack"
                  >
                    ยกเลิก
                  </v-btn>
                  <v-btn
                    color="primary"
                    type="submit"
                    rounded="xl"
                    :loading="loading || customerStore.loading"
                  >
                    {{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล' }}
                  </v-btn>
                </div>
              </BaseForm>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- ไม่จำเป็นต้องมี <style> -->
