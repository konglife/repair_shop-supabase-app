<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useCategoryStore } from '../stores/category';
import { useConfirmation } from '../composables/common/useConfirmation';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const CategoryTable = defineAsyncComponent(() => import('../components/category/CategoryTable.vue'));
const CategoryFormDialog = defineAsyncComponent(() => import('../components/category/CategoryFormDialog.vue')); // เพิ่ม import
const ConfirmationDialog = defineAsyncComponent(() => import('../components/common/ConfirmationDialog.vue'));

const categoryStore = useCategoryStore();

// Table and search state
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// สถานะสำหรับ dialog ฟอร์ม
const showCategoryFormDialog = ref(false);
const selectedCategoryIdForEdit = ref<string | undefined>(undefined);

// ใช้ useConfirmation composable
const { confirm } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();

// Load categories on mount
onMounted(() => {
  loadCategories();
});

const loadCategories = (page = 1) => {
  categoryStore.fetchAllCategories(page, pageSize.value);
};

// Filtered categories based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return categoryStore.categories;
  
  const query = searchQuery.value.toLowerCase();
  return categoryStore.categories.filter(category => {
    return (
      category.name?.toLowerCase().includes(query)
    );
  });
});

// Check if there are no search results
const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredCategories.value.length === 0);

// Navigation and CRUD operations
const openAddCategoryDialog = () => {
  selectedCategoryIdForEdit.value = undefined; // ตั้งค่าเป็น undefined สำหรับโหมดเพิ่มใหม่
  showCategoryFormDialog.value = true; // เปิด dialog
};

const handleEdit = (id: string) => {
  selectedCategoryIdForEdit.value = id; // ตั้งค่า ID สำหรับโหมดแก้ไข
  showCategoryFormDialog.value = true; // เปิด dialog
};

const handleCategorySaved = () => {
  loadCategories(currentPage.value); // โหลดข้อมูลใหม่หลังจากบันทึกสำเร็จ
};

/**
 * เปิดไดอะล็อกยืนยันการลบหมวดหมู่
 * @param id รหัสหมวดหมู่ที่ต้องการลบ
 */
const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for category ID:', id);
  if (!id) {
    console.error('Invalid category ID for deletion');
    error('ไม่พบรหัสหมวดหมู่ที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirm จาก useConfirmation และส่ง options แบบเต็มรูปแบบ
  const confirmed = await confirm({
    title: 'ยืนยันการลบข้อมูลหมวดหมู่',
    message: 'คุณต้องการลบข้อมูลหมวดหมู่นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    type: 'error',
    persistent: true
  });
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบหมวดหมู่
    await deleteCategory(id);
  }
};

/**
 * ลบหมวดหมู่
 * @param id รหัสหมวดหมู่ที่ต้องการลบ
 */
const deleteCategory = async (id: string) => {
  try {
    await categoryStore.deleteCategory(id);
    success('ลบข้อมูลหมวดหมู่เรียบร้อยแล้ว');
    setTimeout(() => {
      loadCategories(currentPage.value);
    }, 500);
  } catch (err) {
    console.error('Error deleting category:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const handleRefresh = () => {
  loadCategories(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadCategories(page);
};

const handleSearch = () => {
  currentPage.value = 1;
  loadCategories(1);
};
</script>

<template>
  <v-container fluid>
    <!-- ใช้ ConfirmationDialog component -->
    <ConfirmationDialog />

    <!-- Category Form Dialog -->
    <CategoryFormDialog
      v-model="showCategoryFormDialog"
      :category-id="selectedCategoryIdForEdit"
      @saved="handleCategorySaved"
    />

    <!-- Main Content -->
    <v-card class="mx-auto rounded-lg" elevation="3">
      <!-- Page Header -->
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการหมวดหมู่</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลหมวดหมู่ทั้งหมดในระบบ</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            prepend-icon="mdi-refresh"
            variant="outlined"
            rounded="xl"
            class="mr-2"
            @click="handleRefresh"
          >
            รีเฟรช
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            rounded="xl"
            @click="openAddCategoryDialog"
          >
            เพิ่มหมวดหมู่
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar -->
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="ค้นหาหมวดหมู่..."
          single-line
          hide-details
          density="comfortable"
          variant="outlined"
          rounded="xl"
          class="search-field"
          clearable
          @click:clear="searchQuery = ''; handleSearch()"
          @input="handleSearch"
        >
          <template v-slot:append>
            <v-fade-transition leave-absolute>
              <v-btn
                v-if="searchQuery.length > 0"
                color="primary"
                icon="mdi-close"
                size="small"
                variant="text"
                @click="searchQuery = ''; handleSearch()"
              ></v-btn>
            </v-fade-transition>
          </template>
        </v-text-field>

        <!-- Loading State -->
        <div v-if="categoryStore.loading" class="d-flex justify-center align-center my-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="categoryStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ categoryStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!categoryStore.categories.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลหมวดหมู่ กรุณาเพิ่มหมวดหมู่ใหม่
        </v-alert>

        <!-- No Search Results -->
        <v-alert
          v-else-if="noSearchResults"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา
        </v-alert>

        <!-- Category Table -->
        <div v-if="!categoryStore.loading && !categoryStore.error && categoryStore.categories.length > 0 && !noSearchResults" class="table-responsive">
          <CategoryTable
            :categories="filteredCategories"
            :loading="categoryStore.loading"
            :total-categories="categoryStore.totalCategories"
            :current-page="currentPage"
            :page-size="pageSize"
            @edit="handleEdit"
            @delete="openDeleteDialog"
            @update:page="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.search-field {
  max-width: 400px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 100%;
  }
}
</style>
