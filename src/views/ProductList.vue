<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useProductStore } from '../stores/product';
import { useRouter } from 'vue-router';
import { useConfirmation } from '../composables/common/useConfirmation';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const ProductCard = defineAsyncComponent(() => import('../components/product/ProductCard.vue'));
const ProductTable = defineAsyncComponent(() => import('../components/product/ProductTable.vue'));
const ProductFilter = defineAsyncComponent(() => import('../components/product/ProductFilter.vue'));
const ConfirmationDialog = defineAsyncComponent(() => import('../components/common/ConfirmationDialog.vue'));

const productStore = useProductStore();
const router = useRouter();

// Table and search state
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// ใช้ useConfirmation composable
const { confirm } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();

// Load products on mount
onMounted(() => {
  loadProducts();
});

const loadProducts = (page = 1) => {
  productStore.fetchAllProducts(page, pageSize.value);
};

// Filtered products based on search query
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return productStore.products;
  
  const query = searchQuery.value.toLowerCase();
  return productStore.products.filter(product => {
    return (
      product.name?.toLowerCase().includes(query) ||
      product.product_code?.toLowerCase().includes(query)
    );
  });
});

// Check if there are no search results
const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredProducts.value.length === 0);

// Navigation and CRUD operations
const navigateToAddProduct = () => {
  router.push('/products/new');
};

const handleEdit = (id: string) => {
  router.push(`/products/${id}/edit`);
};

/**
 * เปิดไดอะล็อกยืนยันการลบสินค้า
 * @param id รหัสสินค้าที่ต้องการลบ
 */
const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for product ID:', id);
  if (!id) {
    console.error('Invalid product ID for deletion');
    error('ไม่พบรหัสสินค้าที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirm จาก useConfirmation และส่ง options แบบเต็มรูปแบบ
  const confirmed = await confirm({
    title: 'ยืนยันการลบข้อมูลสินค้า',
    message: 'คุณต้องการลบข้อมูลสินค้ารายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmText: 'ลบข้อมูล',
    cancelText: 'ยกเลิก',
    type: 'error',
    persistent: true
  });
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบสินค้า
    await deleteProduct(id);
  }
};

/**
 * ลบสินค้า
 * @param id รหัสสินค้าที่ต้องการลบ
 */
const deleteProduct = async (id: string) => {
  try {
    await productStore.deleteProduct(id);
    success('ลบข้อมูลสินค้าเรียบร้อยแล้ว');
    setTimeout(() => {
      loadProducts(currentPage.value);
    }, 500);
  } catch (err) {
    console.error('Error deleting product:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const handleRefresh = () => {
  loadProducts(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadProducts(page);
};

const handleSearch = () => {
  currentPage.value = 1;
  loadProducts(1);
};
</script>

<template>
  <v-container fluid>
    <!-- ใช้ ConfirmationDialog component -->
    <ConfirmationDialog />

    <!-- Main Content -->
    <v-card class="mx-auto rounded-lg" elevation="3">
      <!-- Page Header -->
      <v-card-title class="d-flex justify-space-between align-center flex-wrap pa-4">
        <div>
          <span class="text-h5 font-weight-bold">รายการสินค้า</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลสินค้าทั้งหมดในระบบ</p>
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
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            rounded="xl"
            @click="navigateToAddProduct"
          >
            เพิ่มสินค้า
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar -->
        <ProductFilter
          @search="(query) => { searchQuery = query; handleSearch(); }"
          @reset="searchQuery = ''; handleSearch()"
        />

        <!-- Loading State -->
        <div v-if="productStore.loading" class="d-flex justify-center align-center my-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="productStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ productStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!productStore.products.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลสินค้า กรุณาเพิ่มสินค้าใหม่
        </v-alert>

        <!-- No Search Results -->
        <v-alert
          v-else-if="noSearchResults"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบสินค้าที่ตรงกับคำค้นหา
        </v-alert>

        <!-- Product List - Card View for Mobile (sm and smaller) -->
        <div v-if="!productStore.loading && !productStore.error && productStore.products.length > 0 && !noSearchResults && $vuetify.display.smAndDown" class="product-cards">
          <ProductCard 
            v-for="product in filteredProducts" 
            :key="product.id" 
            :product="product"
            @edit="handleEdit"
            @delete="openDeleteDialog"
            class="mb-4"
          />

          <!-- Pagination for Mobile -->
          <div class="d-flex justify-center mt-6">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(productStore.totalProducts / pageSize)"
              @update:model-value="handlePageChange"
              rounded="xl"
              total-visible="3"
              density="comfortable"
              class="elevation-2 rounded-xl pa-2"
            ></v-pagination>
          </div>
        </div>

        <!-- Product Table - For Desktop (md and larger) -->
        <div v-if="!productStore.loading && !productStore.error && productStore.products.length > 0 && !noSearchResults && $vuetify.display.mdAndUp" class="table-responsive">
          <ProductTable
            :products="filteredProducts"
            :loading="productStore.loading"
            :total-products="productStore.totalProducts"
            :current-page="currentPage"
            :page-size="pageSize"
            @edit="handleEdit"
            @delete="openDeleteDialog"
            @update:page="handlePageChange"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
