<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useUnitStore } from '../stores/unit';
import { useConfirmation } from '../composables/common/useConfirmation';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const UnitTable = defineAsyncComponent(() => import('../components/unit/UnitTable.vue'));
const UnitFormDialog = defineAsyncComponent(() => import('../components/unit/UnitFormDialog.vue')); // เพิ่ม import
const ConfirmationDialog = defineAsyncComponent(() => import('../components/common/ConfirmationDialog.vue'));

const unitStore = useUnitStore();

// Table and search state
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// สถานะสำหรับ dialog ฟอร์ม
const showUnitFormDialog = ref(false);
const selectedUnitIdForEdit = ref<string | undefined>(undefined);

// ใช้ useConfirmation composable
const { confirm } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();

// Load units on mount
onMounted(() => {
  loadUnits();
});

const loadUnits = (page = 1) => {
  unitStore.fetchAllUnits(page, pageSize.value);
};

// Filtered units based on search query
const filteredUnits = computed(() => {
  if (!searchQuery.value.trim()) return unitStore.units;
  
  const query = searchQuery.value.toLowerCase();
  return unitStore.units.filter(unit => {
    return (
      unit.name?.toLowerCase().includes(query)
    );
  });
});

// Check if there are no search results
const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredUnits.value.length === 0);

// Navigation and CRUD operations
const openAddUnitDialog = () => {
  selectedUnitIdForEdit.value = undefined; // ตั้งค่าเป็น undefined สำหรับโหมดเพิ่มใหม่
  showUnitFormDialog.value = true; // เปิด dialog
};

const handleEdit = (id: string) => {
  selectedUnitIdForEdit.value = id; // ตั้งค่า ID สำหรับโหมดแก้ไข
  showUnitFormDialog.value = true; // เปิด dialog
};

const handleUnitSaved = () => {
  loadUnits(currentPage.value); // โหลดข้อมูลใหม่หลังจากบันทึกสำเร็จ
};

/**
 * เปิดไดอะล็อกยืนยันการลบหน่วยนับ
 * @param id รหัสหน่วยนับที่ต้องการลบ
 */
const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for unit ID:', id);
  if (!id) {
    console.error('Invalid unit ID for deletion');
    error('ไม่พบรหัสหน่วยนับที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirm จาก useConfirmation และส่ง options แบบเต็มรูปแบบ
  const confirmed = await confirm({
    title: 'ยืนยันการลบข้อมูลหน่วยนับ',
    message: 'คุณต้องการลบข้อมูลหน่วยนับนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    type: 'error',
    persistent: true
  });
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบหน่วยนับ
    await deleteUnit(id);
  }
};

/**
 * ลบหน่วยนับ
 * @param id รหัสหน่วยนับที่ต้องการลบ
 */
const deleteUnit = async (id: string) => {
  try {
    await unitStore.deleteUnit(id);
    success('ลบข้อมูลหน่วยนับเรียบร้อยแล้ว');
    setTimeout(() => {
      loadUnits(currentPage.value);
    }, 500);
  } catch (err) {
    console.error('Error deleting unit:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const handleRefresh = () => {
  loadUnits(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadUnits(page);
};

const handleSearch = () => {
  currentPage.value = 1;
  loadUnits(1);
};
</script>

<template>
  <v-container fluid>
    <!-- ใช้ ConfirmationDialog component -->
    <ConfirmationDialog />

    <!-- Unit Form Dialog -->
    <UnitFormDialog
      v-model="showUnitFormDialog"
      :unit-id="selectedUnitIdForEdit"
      @saved="handleUnitSaved"
    />

    <!-- Main Content -->
    <v-card class="mx-auto rounded-lg" elevation="3">
      <!-- Page Header -->
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการหน่วยนับ</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลหน่วยนับทั้งหมดในระบบ</p>
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
            @click="openAddUnitDialog"
          >
            เพิ่มหน่วยนับ
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar -->
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="ค้นหาหน่วยนับ..."
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
        <div v-if="unitStore.loading" class="d-flex justify-center align-center my-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="unitStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ unitStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!unitStore.units.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลหน่วยนับ กรุณาเพิ่มหน่วยนับใหม่
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
          ไม่พบหน่วยนับที่ตรงกับคำค้นหา
        </v-alert>

        <!-- Unit Table -->
        <div v-if="!unitStore.loading && !unitStore.error && unitStore.units.length > 0 && !noSearchResults" class="table-responsive">
          <UnitTable
            :units="filteredUnits"
            :loading="unitStore.loading"
            :total-units="unitStore.totalUnits"
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
