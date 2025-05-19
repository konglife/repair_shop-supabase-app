import { ref, computed, watch } from 'vue';

interface UseTableOptions {
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortDesc?: boolean;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: { key: string; order: 'asc' | 'desc' }) => void;
}

export function useTable(options: UseTableOptions = {}) {
  const {
    defaultPageSize = 10,
    defaultSortBy = '',
    defaultSortDesc = false,
    defaultPage = 1,
    onPageChange,
    onSortChange,
  } = options;

  // Pagination state
  const currentPage = ref(defaultPage);
  const pageSize = ref(defaultPageSize);
  const totalItems = ref(0);

  // Sorting state
  const sortBy = ref(defaultSortBy);
  const sortDesc = ref(defaultSortDesc);

  // Loading state
  const loading = ref(false);

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));
  const paginationInfo = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1;
    const end = Math.min(start + pageSize.value - 1, totalItems.value);
    return {
      start: totalItems.value > 0 ? start : 0,
      end,
      total: totalItems.value,
    };
  });

  // Watchers
  watch(currentPage, (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  });

  watch([sortBy, sortDesc], () => {
    if (onSortChange && sortBy.value) {
      onSortChange({
        key: sortBy.value,
        order: sortDesc.value ? 'desc' : 'asc',
      });
    }
  });

  // Methods
  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  const handleSortChange = (key: string) => {
    if (sortBy.value === key) {
      sortDesc.value = !sortDesc.value;
    } else {
      sortBy.value = key;
      sortDesc.value = false;
    }
  };

  const setTotalItems = (total: number) => {
    totalItems.value = total;
    // Adjust current page if it's out of bounds
    if (totalItems.value > 0 && currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const reset = () => {
    currentPage.value = defaultPage;
    sortBy.value = defaultSortBy;
    sortDesc.value = defaultSortDesc;
  };

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDesc,
    loading,
    
    // Computed
    totalPages,
    paginationInfo,
    
    // Methods
    handlePageChange,
    handleSortChange,
    setTotalItems,
    setLoading,
    reset,
  };
}
