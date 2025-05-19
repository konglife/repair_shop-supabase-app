<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFilter } from '../../composables/common/useFilter';

// Define emits
const emit = defineEmits(['search', 'reset']);

// Define filter fields
const filterFields = [
  {
    key: 'name',
    label: 'ชื่อ',
    type: 'text' as const,
  },
  {
    key: 'phone',
    label: 'โทรศัพท์',
    type: 'text' as const,
  },
  {
    key: 'address',
    label: 'ที่อยู่',
    type: 'text' as const,
  }
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
  <div class="customer-filter">
    <v-text-field
      v-model="localSearchQuery"
      prepend-inner-icon="mdi-magnify"
      label="ค้นหาลูกค้า..."
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
.customer-filter {
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
