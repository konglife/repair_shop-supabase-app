<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFilter } from '../../composables/common/useFilter';

// Define emits
const emit = defineEmits(['search', 'reset']);

// Define filter fields
const filterFields = [
  {
    key: 'purchase_order_number',
    label: 'เลขที่ใบสั่งซื้อ',
    type: 'text' as const,
  },
  {
    key: 'supplier_id',
    label: 'รหัสผู้จำหน่าย',
    type: 'text' as const,
  },
];

// Use filter composable
const { setSearchQuery, resetFilters, hasActiveFilters } = useFilter({
  fields: filterFields,
  onFilterChange: (filters) => {
    emit('search', filters.searchQuery);
  }
});

// Expose search query for v-model binding
const localSearchQuery = ref('');

watch(localSearchQuery, (newValue) => {
  setSearchQuery(newValue);
});

// Handle reset
const handleReset = () => {
  resetFilters();
  localSearchQuery.value = '';
  emit('reset');
};
</script>

<template>
  <div class="purchase-filter">
    <v-text-field
      v-model="localSearchQuery"
      prepend-inner-icon="mdi-magnify"
      label="ค้นหาใบสั่งซื้อ..."
      single-line
      hide-details
      density="comfortable"
      variant="outlined"
      rounded="xl"
      class="search-field"
      clearable
      @click:clear="handleReset"
    >
      <template v-slot:append>
        <v-fade-transition leave-absolute>
          <v-btn
            v-if="hasActiveFilters"
            color="primary"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="handleReset"
          ></v-btn>
        </v-fade-transition>
      </template>
    </v-text-field>
  </div>
</template>

<style scoped>
.purchase-filter {
  width: 100%;
  margin-bottom: 16px;
}

.search-field {
  max-width: 400px;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 100%;
  }
}
</style>
