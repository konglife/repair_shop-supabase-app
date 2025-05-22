<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/product';
import { useCategoryStore } from '../stores/category'; // Import category store
import { useUnitStore } from '../stores/unit'; // Import unit store
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/common/useForm';

// Lazy load components
const BaseForm = defineAsyncComponent(() => import('../components/common/BaseForm.vue'));

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore(); // Initialize category store
const unitStore = useUnitStore(); // Initialize unit store
const authStore = useAuthStore();

// ตรวจสอบว่าเป็นการแก้ไขหรือเพิ่มใหม่
const isEditMode = computed(() => route.params.id !== undefined);
const productId = computed(() => route.params.id as string);

// สถานะของฟอร์ม
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// ข้อมูลสินค้าเริ่มต้น
interface ProductFormData {
  id: string;
  product_code: string | null;
  name: string;
  category_id: string | null;
  unit_id: string | null;
  selling_price: number;
  average_cost: number;
  note: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const initialProduct: ProductFormData = {
  id: '',
  product_code: null,
  name: '',
  category_id: null,
  unit_id: null,
  selling_price: 0,
  average_cost: 0, // จะถูกอัปเดตโดย Edge Function
  note: null,
  user_id: authStore.user?.id || ''
};

// กฎการตรวจสอบข้อมูล
const validationRules = {
  name: [
    (v: string) => !!v || 'กรุณากรอกชื่อสินค้า',
    (v: string) => v.length >= 2 || 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  ],
  selling_price: [
    (v: number) => v !== null && v !== undefined && v >= 0 || 'กรุณากรอกราคาขายที่ถูกต้อง',
  ],
  category_id: [
    (v: string) => !!v || 'กรุณาเลือกหมวดหมู่',
  ],
  unit_id: [
    (v: string) => !!v || 'กรุณาเลือกหน่วยนับ',
  ]
};

// ใช้ useForm composable
const form = useForm<ProductFormData>({
  initialValues: { ...initialProduct },
  validationRules,
  onSubmit: saveProduct
});

// สร้าง refs สำหรับแต่ละฟิลด์
const name = computed({
  get: () => form.values.value.name,
  set: (value) => form.setFieldValue('name', value)
});

const category_id = computed({
  get: () => form.values.value.category_id,
  set: (value) => form.setFieldValue('category_id', value)
});

const unit_id = computed({
  get: () => form.values.value.unit_id,
  set: (value) => form.setFieldValue('unit_id', value)
});

const selling_price = computed({
  get: () => form.values.value.selling_price,
  set: (value) => form.setFieldValue('selling_price', value)
});

const note = computed({
  get: () => form.values.value.note,
  set: (value) => form.setFieldValue('note', value)
});

// สร้าง refs สำหรับข้อผิดพลาดของฟอร์ม
const nameError = computed(() => form.errors.value['name'] || '');
const sellingPriceError = computed(() => form.errors.value['selling_price'] || '');
const categoryIdError = computed(() => form.errors.value['category_id'] || '');
const unitIdError = computed(() => form.errors.value['unit_id'] || '');

// โหลดข้อมูลที่จำเป็น (categories, units) และข้อมูลสินค้าในกรณีแก้ไข
onMounted(async () => {
  loading.value = true;
  try {
    await categoryStore.fetchAllCategories();
    await unitStore.fetchAllUnits();

    if (isEditMode.value) {
      await productStore.fetchProductById(productId.value);
      if (productStore.selectedProduct) {
        const product = productStore.selectedProduct;
        form.setFieldValue('id', product.id);
        form.setFieldValue('product_code', product.product_code);
        form.setFieldValue('name', product.name);
        form.setFieldValue('category_id', product.category_id);
        form.setFieldValue('unit_id', product.unit_id);
        form.setFieldValue('selling_price', product.selling_price);
        form.setFieldValue('average_cost', product.average_cost);
        form.setFieldValue('note', product.note);
        form.setFieldValue('user_id', product.user_id);
        if ('created_at' in form.values.value) {
          form.values.value.created_at = product.created_at;
        }
        if ('updated_at' in form.values.value) {
          form.values.value.updated_at = product.updated_at;
        }
      } else {
        errorMessage.value = 'ไม่พบข้อมูลสินค้า';
        router.push('/products');
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
  } finally {
    loading.value = false;
  }
});

// บันทึกข้อมูลสินค้า
async function saveProduct(formData: ProductFormData) {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    if ((!formData.user_id || formData.user_id === '') && authStore.user?.id) {
      formData.user_id = authStore.user.id;
    }
    
    if (!formData.user_id || formData.user_id === '') {
      throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    }
    
    if (isEditMode.value) {
      const { created_at, updated_at, average_cost, ...updateData } = formData;
      await productStore.updateProduct(productId.value, updateData);
      successMessage.value = 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว';
    } else {
      const { created_at, updated_at, id, average_cost, ...createData } = formData;
      
      console.log('Creating product with data:', createData);
      
      await productStore.createProduct(createData);
      successMessage.value = 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว';
      form.resetForm();
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    console.error('Error saving product:', error);
  } finally {
    loading.value = false;
  }
};

// กลับไปหน้ารายการสินค้า
const goBack = () => {
  router.push('/products');
};
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" class="mx-auto product-form__card">
          <v-card-title class="d-flex justify-space-between align-center flex-wrap product-form__header">
            <div>
              <span class="product-form__title">{{ isEditMode ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่' }}</span>
              <p class="product-form__subtitle">
                {{ isEditMode ? 'แก้ไขข้อมูลสินค้าที่มีอยู่ในระบบ' : 'เพิ่มข้อมูลสินค้าใหม่เข้าสู่ระบบ' }}
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
                :loading="loading || productStore.loading"
                @submit="form.handleSubmit"
              >
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="name"
                      label="ชื่อสินค้า *"
                      :error-messages="nameError"
                      variant="outlined"
                      density="comfortable"
                      @input="form.validateField('name')"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-select
                      v-model="category_id"
                      label="หมวดหมู่ *"
                      :items="categoryStore.categories"
                      item-title="name"
                      item-value="id"
                      :error-messages="categoryIdError"
                      variant="outlined"
                      density="comfortable"
                      @update:model-value="form.validateField('category_id')"
                      required
                    ></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="unit_id"
                      label="หน่วยนับ *"
                      :items="unitStore.units"
                      item-title="name"
                      item-value="id"
                      :error-messages="unitIdError"
                      variant="outlined"
                      density="comfortable"
                      @update:model-value="form.validateField('unit_id')"
                      required
                    ></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model.number="selling_price"
                      label="ราคาขาย *"
                      :error-messages="sellingPriceError"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      min="0"
                      @input="form.validateField('selling_price')"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="note"
                      label="หมายเหตุ"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                    ></v-textarea>
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
                    :loading="loading || productStore.loading"
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
