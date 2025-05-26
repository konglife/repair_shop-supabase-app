<template>
  <div>
    <BaseTable
      :headers="headers"
      :items="props.modelValue"
      :loading="props.loading"
      :current-page="currentPage"
      :items-per-page="props.itemsPerPage"
      @update:page="handlePageChange"
      class="stock-table"
    >
      <template #item.product_name="{ item }">
        {{ item.products?.name ?? '' }}
      </template>
      <template #item.product_code="{ item }">
        {{ item.products?.product_code ?? '' }}
      </template>
      <template #item.unit_name="{ item }">
        {{ item.products?.units?.name ?? '' }}
      </template>
      <template #item.min_stock="{ item }">
        <v-text-field
          v-model.number="item.min_stock"
          type="number"
          density="compact"
          variant="outlined"
          hide-details
          single-line
          @change="updateMinStock({ id: item.id, minStock: item.min_stock, currentStock: item.current_stock })"
        ></v-text-field>
      </template>
      <template #item.current_stock="{ item }">
        {{ item.current_stock ?? '' }}
      </template>
      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" label>{{ item.status }}</v-chip>
      </template>
      <template #item.actions="">
        <!-- Actions can be added here if needed, e.g., view product details -->
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType } from 'vue';
import BaseTable from '@/components/common/BaseTable.vue';
import type { Stock } from '@/types/stock';
import { useStockStore } from '@/stores/stock.ts';

const stockStore = useStockStore();

const emit = defineEmits(['update:options', 'update:modelValue', 'update:loading', 'update:totalItems', 'update:itemsPerPage', 'update-min-stock']);

const props = defineProps({
  modelValue: { type: Array as PropType<Stock[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, required: true },
});

const headers = [
  { title: 'ชื่อสินค้า', key: 'product_name' },
  { title: 'รหัสสินค้า', key: 'product_code' },
  { title: 'หน่วย', key: 'unit_name' },
  { title: 'สต็อกขั้นต่ำ', key: 'min_stock' },
  { title: 'สต็อกปัจจุบัน', key: 'current_stock' },
  { title: 'สถานะ', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const currentPage = ref(1);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit('update:options', { page, itemsPerPage: props.itemsPerPage });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'success';
    case 'Low Stock':
      return 'warning';
    case 'Out of Stock':
      return 'error';
    default:
      return 'info';
  }
};

const updateMinStock = async ({ id, minStock, currentStock }: { id: string; minStock: number; currentStock: number }) => {
  try {
    const newStatus = stockStore.calculateStockStatus(minStock, currentStock);
    await stockStore.updateStock(id, { min_stock: minStock, status: newStatus });
    emit('update-min-stock', { id, minStock, newStatus });
  } catch (err: any) {
    console.error('Failed to update minimum stock: ' + err.message);
  }
};

onMounted(() => {
  // Initial load if not already loaded by loadItems
  if (props.modelValue.length === 0 && !props.loading) {
    emit('update:options', { page: 1, itemsPerPage: props.itemsPerPage });
  }
});
</script>
