<template>
  <div class="base-table">
    <slot name="pre-table"></slot>
    
    <v-data-table
      v-bind="$attrs"
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :page="currentPage"
      @update:page="$emit('update:page', $event)"
      @update:sort-by="$emit('update:sort-by', $event)"
      class="base-data-table"
    >
      <!-- Default slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
      
      <!-- Loading slot -->
      <template #loading>
        <slot name="loading">
          <v-skeleton-loader type="table-row@6" />
        </slot>
      </template>
      
      <!-- No-data slot -->
      <template #no-data>
        <slot name="no-data">
          <v-sheet class="pa-6 text-center">
            <v-icon size="large" icon="mdi-database-off" class="mb-4" />
            <div class="text-h6">ไม่พบข้อมูล</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              ไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา
            </div>
            <slot name="no-data-actions"></slot>
          </v-sheet>
        </slot>
      </template>
    </v-data-table>
    
    <slot name="post-table"></slot>
  </div>
</template>

<script setup lang="ts">
// กำหนด interface สำหรับ header ของตาราง
interface DataTableHeader {
  title: string;
  key: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  width?: string | number;
}

defineProps({
  headers: {
    type: Array as () => DataTableHeader[],
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
});

defineEmits(['update:page', 'update:sort-by']);
</script>

<style lang="scss">
.base-table {
  width: 100%;
  
  .base-data-table {
    border-radius: 16px;
    overflow: hidden;
    
    :deep(.v-data-table__th) {
      font-weight: 600 !important;
      padding: 16px !important;
      white-space: nowrap;
    }
    
    :deep(.v-data-table__td) {
      padding: 12px 16px !important;
    }
  }
}

/* Dark mode styles */
.v-theme--dark .base-data-table {
  background-color: #121212 !important;
  
  :deep(.v-data-table__tr) {
    background-color: #121212 !important;
    color: rgba(255, 255, 255, 0.87) !important;
  }
  
  :deep(.v-data-table__th) {
    background-color: #1E1E1E !important;
    color: rgba(255, 255, 255, 0.87) !important;
    border-bottom: thin solid rgba(255, 255, 255, 0.12) !important;
  }
  
  :deep(.v-data-table__tr:hover) {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }
}

/* Light mode styles */
.v-theme--light .base-data-table {
  background-color: white !important;
  
  :deep(.v-data-table__tr) {
    background-color: white !important;
    color: rgba(0, 0, 0, 0.87) !important;
  }
  
  :deep(.v-data-table__th) {
    background-color: #F5F5F5 !important;
    color: rgba(0, 0, 0, 0.87) !important;
    border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
  }
  
  :deep(.v-data-table__tr:hover) {
    background-color: rgba(0, 0, 0, 0.03) !important;
  }
}
</style>
