<template>
  <v-container fluid>
    <ConfirmationDialog />

    <v-card class="mx-auto rounded-lg" elevation="3">
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการสต็อกสินค้า</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลสต็อกสินค้าทั้งหมดในระบบ</p>
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
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar (Optional, can be added later if needed) -->
        <!-- <StockFilter
          @search="(query: string) => { searchQuery = query; handleSearch(); }"
          @reset="searchQuery = ''; handleSearch()"
        /> -->

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
          v-else-if="stockStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ stockStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!stocks.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลสต็อกสินค้า
        </v-alert>

        <!-- No Search Results (if search is implemented) -->
        <!-- <v-alert
          v-else-if="noSearchResults"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบผลลัพธ์สำหรับการค้นหาของคุณ
        </v-alert> -->

        <StockTable
          v-else
          v-model="stocks"
          v-model:loading="loading"
          v-model:total-items="stockStore.totalItems"
          v-model:itemsPerPage="itemsPerPage"
          @update:options="loadStocks"
          @update-min-stock="updateMinStock"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useStockStore } from '@/stores/stock';
import { useNotification } from '@/composables/common/useNotification';
import { useConfirmation } from '@/composables/common/useConfirmation';
import type { Stock } from '@/types/stock';
import StockTable from '@/components/stock/StockTable.vue';

const ConfirmationDialog = defineAsyncComponent(() => import('@/components/common/ConfirmationDialog.vue'));
// const StockFilter = defineAsyncComponent(() => import('@/components/stock/StockFilter.vue'));

const stockStore = useStockStore();
const { success, error } = useNotification();
const { confirm } = useConfirmation();

const stocks = ref<Stock[]>([]);
const loading = ref(true);
const itemsPerPage = ref(10);

const loadStocks = async ({ page, itemsPerPage }: { page: number; itemsPerPage: number }) => {
  loading.value = true;
  await stockStore.fetchAllStocks(page, itemsPerPage);
  stocks.value = stockStore.stocks;
  loading.value = false;
};

const handleRefresh = () => {
  loadStocks({ page: 1, itemsPerPage: itemsPerPage.value });
};

const updateMinStock = async ({ id, minStock }: { id: string; minStock: number }) => {
  try {
    const confirmed = await confirm({
      title: 'ยืนยันการแก้ไขสต็อกขั้นต่ำ',
      message: `คุณต้องการแก้ไขสต็อกขั้นต่ำของสินค้านี้เป็น ${minStock} ใช่หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
    });

    if (confirmed) {
      await stockStore.updateStock(id, { min_stock: minStock });
      success('แก้ไขสต็อกขั้นต่ำเรียบร้อยแล้ว');
      loadStocks({ page: 1, itemsPerPage: itemsPerPage.value }); // Reload to reflect changes
    }
  } catch (err) {
    console.error('Error updating min stock:', err);
    error('ไม่สามารถแก้ไขสต็อกขั้นต่ำได้: ' + (err instanceof Error ? err.message : String(err)));
  }
};

onMounted(() => {
  loadStocks({ page: 1, itemsPerPage: 10 });
});
</script>
