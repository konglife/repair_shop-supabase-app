<template>
  <BaseTable
    :headers="headers"
    :items="suppliers"
    :loading="loading"
    :no-data-text="noDataText"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
  >
    <template v-slot:item.actions="{ item }">
      <div class="d-flex">
        <v-btn
          icon
          variant="text"
          color="primary"
          @click="$emit('edit', item.id)"
          class="mr-2"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          color="error"
          @click="$emit('delete', item.id)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import type { Supplier } from '../../types/supplier';
import BaseTable from '../common/BaseTable.vue';

defineEmits(['edit', 'delete']);

defineProps({
  suppliers: {
    type: Array as () => Supplier[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  noDataText: {
    type: String,
    default: 'ไม่พบข้อมูลซัพพลายเออร์'
  }
});

// กำหนดหัวตาราง
const headers = [
  { title: 'ชื่อซัพพลายเออร์', key: 'name', align: 'start' as const, sortable: true },
  { title: 'เบอร์โทรศัพท์', key: 'phone', align: 'start' as const, sortable: true },
  { title: 'เว็บไซต์', key: 'url', align: 'start' as const, sortable: true },
  { title: 'หมายเหตุ', key: 'note', align: 'start' as const, sortable: true },
  { title: 'จัดการ', key: 'actions', align: 'end' as const, sortable: false }
];
</script>

<style scoped>
/* สไตล์เฉพาะสำหรับตารางซัพพลายเออร์ */
</style>
