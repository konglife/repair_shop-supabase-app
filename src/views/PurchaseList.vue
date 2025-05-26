<template>
  <v-container fluid>
    <!-- ใช้ ConfirmationDialog component -->
    <ConfirmationDialog />

    <!-- Main Content -->
    <v-card class="mx-auto rounded-lg" elevation="3">
      <!-- Page Header -->
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการใบสั่งซื้อ</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลใบสั่งซื้อทั้งหมดในระบบ</p>
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
            @click="createPurchase"
          >
            สร้างใบสั่งซื้อใหม่
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar -->
        <PurchaseFilter
          @search="(query: string) => { searchQuery = query; handleSearch(); }"
          @reset="searchQuery = ''; handleSearch()"
        />

        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-center align-center my-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="purchaseStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ purchaseStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!purchases.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลใบสั่งซื้อ กรุณาเพิ่มใบสั่งซื้อใหม่
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
          ไม่พบผลลัพธ์สำหรับการค้นหาของคุณ
        </v-alert>

        <PurchaseTable 
          v-else
          v-model="filteredPurchases"
          v-model:loading="loading"
          v-model:total-items="totalItems"
          v-model:itemsPerPage="itemsPerPage"
          @update:options="loadPurchases"
          @delete-purchase="openDeleteDialog"
          :suppliers="supplierStore.suppliers"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, computed } from 'vue';
import PurchaseTable from '@/components/purchase/PurchaseTable.vue';
import PurchaseFilter from '@/components/purchase/PurchaseFilter.vue';
import { usePurchaseStore } from '@/stores/purchase';
import { useRouter } from 'vue-router';
import type { Purchase } from '@/types/purchase';
import { useConfirmation } from '@/composables/common/useConfirmation';
import { useNotification } from '@/composables/common/useNotification';
import { useSupplierStore } from '@/stores/supplier';

// Lazy load common components
const ConfirmationDialog = defineAsyncComponent(() => import('@/components/common/ConfirmationDialog.vue'));

const purchaseStore = usePurchaseStore();
const router = useRouter();
const supplierStore = useSupplierStore();

const purchases = ref<Purchase[]>([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const searchQuery = ref('');

// ใช้ useConfirmation composable
const { confirm } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();

// ใช้ ConfirmationDialog แทน PurchaseDeleteDialog ซึ่งจัดการ dialog state ภายในตัวเอง


const loadPurchases = async ({ page, itemsPerPage }: { page: number; itemsPerPage: number }) => {
  loading.value = true;
  await purchaseStore.fetchPurchases(page, itemsPerPage);
  purchases.value = purchaseStore.purchases;
  totalItems.value = purchaseStore.totalItems;
  loading.value = false;
};

const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for purchase ID:', id);
  if (!id) {
    console.error('Invalid purchase ID for deletion');
    error('ไม่พบรหัสใบสั่งซื้อที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirm จาก useConfirmation และส่ง options แบบเต็มรูปแบบ
  const confirmed = await confirm({
    title: 'ยืนยันการลบใบสั่งซื้อ',
    message: 'คุณต้องการลบข้อมูลใบสั่งซื้อรายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    type: 'error',
    persistent: true
  });
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบใบสั่งซื้อ
    await deletePurchase(id);
  }
};

const deletePurchase = async (id: string) => {
  try {
    await purchaseStore.deletePurchase(id);
    success('ลบข้อมูลใบสั่งซื้อเรียบร้อยแล้ว');
    loadPurchases({ page: 1, itemsPerPage: 10 }); // Reset to first page
  } catch (err) {
    console.error('Error deleting purchase:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const createPurchase = () => {
  router.push({ name: 'PurchaseNew' });
};

const handleRefresh = () => {
  loadPurchases({ page: 1, itemsPerPage: itemsPerPage.value });
};

const handleSearch = () => {
  loadPurchases({ page: 1, itemsPerPage: itemsPerPage.value });
};

const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) return purchases.value;
  
  const query = searchQuery.value.toLowerCase();
  return purchases.value.filter(purchase => {
    return (
      purchase.purchase_order_number?.toLowerCase().includes(query) ||
      purchase.supplier_id?.toLowerCase().includes(query) // Assuming supplier_id can be searched by name
    );
  });
});

const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredPurchases.value.length === 0);

onMounted(() => {
  loadPurchases({ page: 1, itemsPerPage: 10 });
  supplierStore.fetchAllSuppliers();
});
</script>
