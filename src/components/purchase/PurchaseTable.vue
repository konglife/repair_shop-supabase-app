<template>
  <div>
    <BaseTable
      :headers="headers"
      :items="props.modelValue"
      :loading="props.loading"
      :current-page="currentPage"
      :items-per-page="props.itemsPerPage"
      @update:page="handlePageChange"
      class="purchase-table"
    >
      <template #item.purchase_order_number="{ item }">
        {{ item.purchase_order_number ?? '' }}
      </template>
      <template #item.supplier_name="{ item }">
        {{ getSupplierName(item.supplier_id) }}
      </template>
      <template #item.purchase_date="{ item }">
        {{ formatDate(item.purchase_date) }}
      </template>
      <template #item.expected_delivery_date="{ item }">
        {{ formatDate(item.expected_delivery_date) }}
      </template>
      <template #item.status="{ item }">
        {{ item.status ?? '' }}
      </template>
      <template #item.total_amount="{ item }">
        {{ item.total_amount ?? '' }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-center">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="info"
            class="mr-2"
            @click="editPurchase(item.id as string)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="$emit('delete-purchase', item.id as string)"
          ></v-btn>
        </div>
      </template>
    </BaseTable>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import BaseTable from '../common/BaseTable.vue';
import type { PropType } from 'vue';
import { usePurchaseStore } from '@/stores/purchase';
import { useRouter } from 'vue-router';
import type { Purchase } from '@/types/purchase';
import type { Supplier } from '@/types/supplier';

const emit = defineEmits(['update:options', 'update:modelValue', 'update:loading', 'update:totalItems', 'delete-purchase', 'update:itemsPerPage']);

const props = defineProps({
  modelValue: { type: Array as PropType<Purchase[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, required: true },
  suppliers: { type: Array as PropType<Supplier[]>, default: () => [] },
});

const purchaseStore = usePurchaseStore();
const router = useRouter();

const headers = [
  { title: 'เลขที่ใบสั่งซื้อ', key: 'purchase_order_number' },
  { title: 'ผู้จำหน่าย', key: 'supplier_name' },
  { title: 'วันที่สั่งซื้อ', key: 'purchase_date' },
  { title: 'วันที่คาดว่าจะได้รับสินค้า', key: 'expected_delivery_date' },
  { title: 'สถานะ', key: 'status' },
  { title: 'ยอดรวม', key: 'total_amount' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const currentPage = ref(1);

const getSupplierName = (supplierId: string) => {
  const supplier = props.suppliers.find(s => s.id === supplierId);
  return supplier ? supplier.name : 'Unknown Supplier';
};

const loadItems = async ({ page, itemsPerPage: newItemsPerPage }: { page: number; itemsPerPage: number }) => {
  emit('update:itemsPerPage', newItemsPerPage);
  await purchaseStore.fetchPurchases(page, newItemsPerPage);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadItems({ page, itemsPerPage: props.itemsPerPage });
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const editPurchase = (id: string) => {
  router.push({ name: 'PurchaseForm', params: { id } });
};

onMounted(() => {
  // Initial load if not already loaded by loadItems
  if (props.modelValue.length === 0 && !props.loading) {
    loadItems({ page: 1, itemsPerPage: props.itemsPerPage });
  }
});
</script>
