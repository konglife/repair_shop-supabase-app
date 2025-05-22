<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import { useCategoryStore } from '../../stores/category';
import { useAuthStore } from '../../stores/auth';
import { useForm } from '../../composables/common/useForm';

// Lazy load components
const BaseForm = defineAsyncComponent(() => import('../common/BaseForm.vue'));
// ConfirmationDialog ไม่ได้ใช้ในคอมโพเนนต์นี้โดยตรง

const categoryStore = useCategoryStore();
const authStore = useAuthStore();

// Define props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categoryId: {
    type: String,
    default: null
  }
});

// Define emits
const emit = defineEmits(['update:modelValue', 'saved']);

// Local dialog state
const localDialog = ref(props.modelValue);

// ตรวจสอบว่าเป็นการแก้ไขหรือเพิ่มใหม่
const isEditMode = computed(() => props.categoryId !== null);

// สถานะของฟอร์ม
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// ข้อมูลหมวดหมู่เริ่มต้น
interface CategoryFormData {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

const initialCategory: CategoryFormData = {
  id: '',
  name: '',
  user_id: authStore.user?.id || ''
};

// กฎการตรวจสอบข้อมูล
const validationRules = {
  name: [
    (v: string) => !!v || 'กรุณากรอกชื่อหมวดหมู่',
    (v: string) => v.length >= 2 || 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
  ],
};

// ใช้ useForm composable
const form = useForm<CategoryFormData>({
  initialValues: { ...initialCategory },
  validationRules,
  onSubmit: saveCategory
});

// สร้าง refs สำหรับแต่ละฟิลด์
const name = computed({
  get: () => form.values.value.name,
  set: (value) => form.setFieldValue('name', value)
});

// สร้าง refs สำหรับข้อผิดพลาดของฟอร์ม
const nameError = computed(() => form.errors.value['name'] || '');

// Watch for changes in modelValue prop to open/close dialog
watch(() => props.modelValue, async (newValue) => {
  localDialog.value = newValue;
  if (newValue && isEditMode.value) {
    loading.value = true;
    errorMessage.value = '';
    try {
      await categoryStore.fetchCategoryById(props.categoryId as string);
      if (categoryStore.selectedCategory) {
        const category = categoryStore.selectedCategory;
        form.setFieldValue('id', category.id);
        form.setFieldValue('name', category.name);
        form.setFieldValue('user_id', category.user_id);
        if ('created_at' in form.values.value) {
          form.values.value.created_at = category.created_at;
        }
      } else {
        errorMessage.value = 'ไม่พบข้อมูลหมวดหมู่';
      }
    } catch (error: any) {
      errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
      loading.value = false;
    }
  } else if (newValue && !isEditMode.value) {
    // Reset form for new entry
    form.resetForm();
    errorMessage.value = '';
    successMessage.value = '';
  }
});

// Watch for changes in local dialog state to emit update
watch(localDialog, (newValue) => {
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
});

// บันทึกข้อมูลหมวดหมู่
async function saveCategory(formData: CategoryFormData) {
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
      const { created_at, ...updateData } = formData;
      await categoryStore.updateCategory(props.categoryId as string, updateData);
      successMessage.value = 'อัปเดตข้อมูลหมวดหมู่เรียบร้อยแล้ว';
    } else {
      const { created_at, id, ...createData } = formData;
      await categoryStore.createCategory(createData);
      successMessage.value = 'เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว';
      form.resetForm();
    }
    emit('saved'); // แจ้งว่าบันทึกสำเร็จ
    handleClose(); // ปิด dialog
  } catch (error: any) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    console.error('Error saving category:', error);
  } finally {
    loading.value = false;
  }
};

// Handle close
const handleClose = () => {
  localDialog.value = false;
  errorMessage.value = '';
  successMessage.value = '';
  form.resetForm(); // Reset form on close
};
</script>

<template>
  <v-dialog
    v-model="localDialog"
    max-width="600"
    persistent
    class="category-form-dialog"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">{{ isEditMode ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">
            {{ isEditMode ? 'แก้ไขข้อมูลหมวดหมู่ที่มีอยู่ในระบบ' : 'เพิ่มข้อมูลหมวดหมู่ใหม่เข้าสู่ระบบ' }}
          </p>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="handleClose"></v-btn>
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
        <div v-if="loading || categoryStore.loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else>
          <!-- ใช้ BaseForm component -->
          <BaseForm
            :loading="loading || categoryStore.loading"
            @submit="form.handleSubmit"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  label="ชื่อหมวดหมู่ *"
                  :error-messages="nameError"
                  variant="outlined"
                  density="comfortable"
                  @input="form.validateField('name')"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            
            <div class="d-flex justify-end mt-4">
              <v-btn
                variant="outlined"
                rounded="xl"
                class="mr-2"
                @click="handleClose"
              >
                ยกเลิก
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                rounded="xl"
                :loading="loading || categoryStore.loading"
              >
                {{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล' }}
              </v-btn>
            </div>
          </BaseForm>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.category-form-dialog {
  border-radius: 16px;
}
</style>
