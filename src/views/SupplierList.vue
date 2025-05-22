<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useSupplierStore } from '../stores/supplier';
import { useRouter } from 'vue-router';
import { useConfirmation } from '../composables/common/useConfirmation';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const SupplierCard = defineAsyncComponent(() => import('../components/supplier/SupplierCard.vue'));
const SupplierTable = defineAsyncComponent(() => import('../components/supplier/SupplierTable.vue'));
const SupplierFilter = defineAsyncComponent(() => import('../components/supplier/SupplierFilter.vue'));
const ConfirmationDialog = defineAsyncComponent(() => import('../components/common/ConfirmationDialog.vue'));

const supplierStore = useSupplierStore();
const router = useRouter();

// Table and search state
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// ใช้ useConfirmation composable
const { confirm } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();

// Load suppliers on mount
onMounted(() => {
  loadSuppliers();
});

const loadSuppliers = (page = 1) => {
  // ถ้า supplierStore.fetchAllSuppliers รองรับการแบ่งหน้า ให้ส่ง page และ pageSize ไปด้วย
  // supplierStore.fetchAllSuppliers(page, pageSize.value);
  // ถ้ายังไม่รองรับ ให้ใช้แบบเดิมไปก่อน
  supplierStore.fetchAllSuppliers();
  // บันทึกหน้าปัจจุบัน
  currentPage.value = page;
};

// Filtered suppliers based on search query
const filteredSuppliers = computed(() => {
  if (!searchQuery.value.trim()) return supplierStore.suppliers;
  
  const query = searchQuery.value.toLowerCase();
  return supplierStore.suppliers.filter(supplier => {
    return (
      supplier.name?.toLowerCase().includes(query) ||
      supplier.phone?.includes(query) ||
      supplier.url?.toLowerCase().includes(query) ||
      supplier.note?.toLowerCase().includes(query)
    );
  });
});

// Check if there are no search results
const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredSuppliers.value.length === 0);

// Navigation and CRUD operations
const navigateToAddSupplier = () => {
  router.push('/suppliers/new');
};

const handleEdit = (id: string) => {
  router.push(`/suppliers/${id}/edit`);
};

/**
 * เปิดไดอะล็อกยืนยันการลบซัพพลายเออร์
 * @param id รหัสซัพพลายเออร์ที่ต้องการลบ
 */
const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for supplier ID:', id);
  if (!id) {
    console.error('Invalid supplier ID for deletion');
    error('ไม่พบรหัสซัพพลายเออร์ที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirm จาก useConfirmation และส่ง options แบบเต็มรูปแบบ
  const confirmed = await confirm({
    title: 'ยืนยันการลบข้อมูลซัพพลายเออร์',
    message: 'คุณต้องการลบข้อมูลซัพพลายเออร์รายนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    type: 'error',
    persistent: true
  });
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบซัพพลายเออร์
    await deleteSupplier(id);
  }
};

/**
 * ลบซัพพลายเออร์
 * @param id รหัสซัพพลายเออร์ที่ต้องการลบ
 */
const deleteSupplier = async (id: string) => {
  try {
    await supplierStore.deleteSupplier(id);
    success('ลบข้อมูลซัพพลายเออร์เรียบร้อยแล้ว');
    setTimeout(() => {
      loadSuppliers();
    }, 500);
  } catch (err) {
    console.error('Error deleting supplier:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const handleRefresh = () => {
  loadSuppliers(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadSuppliers(page);
};

const handleSearch = () => {
  // เมื่อค้นหา ให้กลับไปหน้าแรก
  currentPage.value = 1;
  loadSuppliers(1);
  console.log('Searching for:', searchQuery.value);
};
</script>

<template>
  <v-container fluid>
    <!-- ใช้ ConfirmationDialog component -->
    <ConfirmationDialog />

    <!-- Main Content -->
    <v-card class="mx-auto rounded-lg" elevation="3">
      <!-- Page Header -->
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการซัพพลายเออร์</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลซัพพลายเออร์ทั้งหมดในระบบ</p>
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
            @click="navigateToAddSupplier"
          >
            เพิ่มซัพพลายเออร์
          </v-btn>
        </div>
      </v-card-title>

      <!-- Search Filter -->
      <v-card-text class="pa-4 pt-0">
        <SupplierFilter
          v-model:searchQuery="searchQuery"
          @search="handleSearch"
        />
      </v-card-text>

      <!-- Data Display -->
      <v-card-text class="pa-4 pt-0">
        <!-- Pagination Controls (ถ้ามีการแบ่งหน้า) -->
        <div v-if="filteredSuppliers.length > 0 && supplierStore.suppliers.length > pageSize" class="d-flex justify-center my-4">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(supplierStore.suppliers.length / pageSize)"
            @update:model-value="handlePageChange"
            rounded="circle"
          ></v-pagination>
        </div>
        <!-- Loading State -->
        <div v-if="supplierStore.loading" class="d-flex justify-center align-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="supplierStore.error"
          type="error"
          class="mb-4"
        >
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {{ supplierStore.error }}
        </v-alert>

        <!-- No Results -->
        <v-alert
          v-else-if="noSearchResults"
          type="info"
          class="mb-4"
        >
          ไม่พบข้อมูลซัพพลายเออร์ที่ตรงกับคำค้นหา "{{ searchQuery }}"
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="filteredSuppliers.length === 0"
          type="info"
          class="mb-4"
        >
          ยังไม่มีข้อมูลซัพพลายเออร์ในระบบ กรุณาเพิ่มซัพพลายเออร์
        </v-alert>

        <!-- Data Table (Desktop) -->
        <div v-else-if="$vuetify.display.mdAndUp">
          <SupplierTable
            :suppliers="filteredSuppliers"
            :loading="supplierStore.loading"
            @edit="handleEdit"
            @delete="openDeleteDialog"
          />
        </div>

        <!-- Data Cards (Mobile) -->
        <div v-else-if="$vuetify.display.smAndDown">
          <v-row>
            <v-col
              v-for="supplier in filteredSuppliers"
              :key="supplier.id"
              cols="12"
            >
              <SupplierCard
                :supplier="supplier"
                @edit="handleEdit"
                @delete="openDeleteDialog"
              />
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
/* สไตล์เฉพาะสำหรับหน้ารายการซัพพลายเออร์ */
</style>
