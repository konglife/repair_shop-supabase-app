import { ref, computed, watch } from 'vue';

interface FilterOption {
  value: string | number | boolean;
  text: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
  options?: FilterOption[];
  defaultValue?: any;
}

interface UseFilterOptions {
  fields: FilterField[];
  onFilterChange?: (filters: Record<string, any>) => void;
  debounceMs?: number;
}

export function useFilter(options: UseFilterOptions) {
  const {
    fields,
    onFilterChange,
    debounceMs = 300,
  } = options;

  // Filter state
  const filters = ref<Record<string, any>>({});
  const searchQuery = ref('');
  const isFiltering = ref(false);
  const debounceTimeout = ref<number | null>(null);

  // Initialize default values
  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      filters.value[field.key] = field.defaultValue;
    } else {
      switch (field.type) {
        case 'text':
        case 'select':
          filters.value[field.key] = '';
          break;
        case 'number':
          filters.value[field.key] = null;
          break;
        case 'boolean':
          filters.value[field.key] = false;
          break;
        case 'date':
          filters.value[field.key] = null;
          break;
        case 'dateRange':
          filters.value[field.key] = [null, null];
          break;
      }
    }
  });

  // Methods
  const setFilter = (key: string, value: any) => {
    filters.value[key] = value;
    debouncedTriggerFilterChange();
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    debouncedTriggerFilterChange();
  };

  const resetFilters = () => {
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        filters.value[field.key] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'text':
          case 'select':
            filters.value[field.key] = '';
            break;
          case 'number':
            filters.value[field.key] = null;
            break;
          case 'boolean':
            filters.value[field.key] = false;
            break;
          case 'date':
            filters.value[field.key] = null;
            break;
          case 'dateRange':
            filters.value[field.key] = [null, null];
            break;
        }
      }
    });
    
    searchQuery.value = '';
    
    if (onFilterChange) {
      onFilterChange({ ...filters.value, searchQuery: searchQuery.value });
    }
  };

  const debouncedTriggerFilterChange = () => {
    isFiltering.value = true;
    
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value);
    }
    
    debounceTimeout.value = window.setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({ ...filters.value, searchQuery: searchQuery.value });
      }
      isFiltering.value = false;
      debounceTimeout.value = null;
    }, debounceMs);
  };

  // Apply filters to a local data array
  const applyFilters = <T>(data: T[]): T[] => {
    let filteredData = [...data];
    
    // Apply search query if present
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filteredData = filteredData.filter((item) => {
        // Search in all string properties
        return Object.values(item as object).some(
          (value) => 
            typeof value === 'string' && 
            value.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply individual filters
    for (const key in filters.value) {
      const filterValue = filters.value[key];
      
      // Skip empty filters
      if (
        filterValue === '' || 
        filterValue === null || 
        filterValue === undefined ||
        (Array.isArray(filterValue) && filterValue.every(v => v === null))
      ) {
        continue;
      }
      
      const field = fields.find((f) => f.key === key);
      if (!field) continue;
      
      filteredData = filteredData.filter((item) => {
        const itemValue = (item as any)[key];
        
        switch (field.type) {
          case 'text':
            return typeof itemValue === 'string' && 
                   itemValue.toLowerCase().includes(String(filterValue).toLowerCase());
          
          case 'select':
            return itemValue === filterValue;
          
          case 'number':
            return itemValue === filterValue;
          
          case 'boolean':
            return itemValue === filterValue;
          
          case 'date':
            if (!itemValue || !filterValue) return false;
            const itemDate = new Date(itemValue);
            const filterDate = new Date(filterValue);
            return itemDate.toDateString() === filterDate.toDateString();
          
          case 'dateRange':
            if (!itemValue || !filterValue[0] || !filterValue[1]) return false;
            const date = new Date(itemValue);
            const startDate = new Date(filterValue[0]);
            const endDate = new Date(filterValue[1]);
            return date >= startDate && date <= endDate;
          
          default:
            return true;
        }
      });
    }
    
    return filteredData;
  };

  // Computed properties
  const activeFiltersCount = computed(() => {
    let count = 0;
    
    if (searchQuery.value) {
      count++;
    }
    
    for (const key in filters.value) {
      const filterValue = filters.value[key];
      const field = fields.find((f) => f.key === key);
      
      if (!field) continue;
      
      if (
        (field.type === 'text' || field.type === 'select') && 
        filterValue !== ''
      ) {
        count++;
      } else if (
        (field.type === 'number' || field.type === 'date') && 
        filterValue !== null
      ) {
        count++;
      } else if (
        field.type === 'boolean' && 
        filterValue === true
      ) {
        count++;
      } else if (
        field.type === 'dateRange' && 
        Array.isArray(filterValue) && 
        filterValue[0] !== null && 
        filterValue[1] !== null
      ) {
        count++;
      }
    }
    
    return count;
  });

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

  // Watch for changes in filters
  watch([filters, searchQuery], () => {
    debouncedTriggerFilterChange();
  }, { deep: true });

  return {
    // State
    filters,
    searchQuery,
    isFiltering,
    
    // Computed
    activeFiltersCount,
    hasActiveFilters,
    
    // Methods
    setFilter,
    setSearchQuery,
    resetFilters,
    applyFilters,
  };
}
