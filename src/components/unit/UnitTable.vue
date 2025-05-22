<script setup lang="ts">
import { computed } from 'vue';
import BaseTable from '../common/BaseTable.vue';
import { useTable } from '../../composables/common/useTable';
import type { Unit } from '../../types/unit';

// Define props
const props = defineProps({
  units: {
    type: Array as () => Unit[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalUnits: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
});

// Define emits
const emit = defineEmits(['edit', 'delete', 'update:page']);

// Setup table headers
const headers = [
  { title: 'ชื่อหน่วยนับ', key: 'name', align: 'start' as const, sortable: true },
  { title: 'การจัดการ', key: 'actions', align: 'center' as const, sortable: false },
];

// Use table composable
const table = useTable({
  defaultPageSize: props.pageSize,
  defaultPage: props.currentPage,
  onPageChange: (page) => {
    emit('update:page', page);
  }
});

// Set total items when props change
computed(() => {
  table.setTotalItems(props.totalUnits);
  return props.totalUnits;
});

// Handle edit and delete actions
const handleEdit = (unitId: string) => {
  emit('edit', unitId);
};

const handleDelete = (unitId: string) => {
  emit('delete', unitId);
};
</script>

<template>
  <BaseTable
    :headers="headers"
    :items="units"
    :loading="loading"
    :current-page="currentPage"
    :items-per-page="pageSize"
    @update:page="$emit('update:page', $event)"
    class="unit-table"
  >
    <!-- Custom cell rendering for name column -->
    <template #item.name="{ item }">
      <div class="d-flex align-center py-2">
        <span>{{ item.name }}</span>
      </div>
    </template>
    
    <!-- Custom cell rendering for actions column -->
    <template #item.actions="{ item }">
      <div class="d-flex justify-center">
        <v-btn
          @click="handleEdit(item.id)"
          icon="mdi-pencil"
          size="small"
          variant="text"
          color="primary"
          class="mr-2 action-btn"
          elevation="0"
        ></v-btn>
        <v-btn
          @click="handleDelete(item.id)"
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          class="action-btn"
          elevation="0"
        ></v-btn>
      </div>
    </template>
    
    <!-- Custom empty state -->
    <template #no-data>
      <v-sheet class="pa-6 text-center">
        <v-icon size="64" icon="mdi-ruler" class="mb-4"></v-icon>
        <div class="text-h6 mb-2">ไม่พบข้อมูลหน่วยนับ</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          ยังไม่มีข้อมูลหน่วยนับในระบบ หรือไม่พบข้อมูลที่ตรงกับการค้นหา
        </div>
      </v-sheet>
    </template>
  </BaseTable>
</template>

<style scoped>
.unit-table {
  width: 100%;
}

.action-btn {
  transition: transform 0.2s ease, background-color 0.3s ease !important;
}

.action-btn:hover {
  transform: scale(1.15) !important;
}
</style>
