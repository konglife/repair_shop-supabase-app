<script setup lang="ts">
import { onMounted, ref, computed, defineAsyncComponent } from 'vue';
import { useCustomerStore } from '../stores/customer';
import { useRouter } from 'vue-router';
import { useConfirmation } from '../composables/common/useConfirmation';
import { useNotification } from '../composables/common/useNotification';

// Lazy load components
const CustomerCard = defineAsyncComponent(() => import('../components/customer/CustomerCard.vue'));
const CustomerTable = defineAsyncComponent(() => import('../components/customer/CustomerTable.vue'));
const CustomerFilter = defineAsyncComponent(() => import('../components/customer/CustomerFilter.vue'));
const ConfirmationDialog = defineAsyncComponent(() => import('../components/common/ConfirmationDialog.vue'));

const customerStore = useCustomerStore();
const router = useRouter();

// Table and search state
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// ใช้ useConfirmation composable
const { confirmDelete } = useConfirmation();

// ใช้ useNotification composable
const { success, error } = useNotification();



// Load customers on mount
onMounted(() => {
  loadCustomers();
});

const loadCustomers = (page = 1) => {
  customerStore.fetchAllCustomers(page, pageSize.value);
};

// Filtered customers based on search query
const filteredCustomers = computed(() => {
  if (!searchQuery.value.trim()) return customerStore.customers;
  
  const query = searchQuery.value.toLowerCase();
  return customerStore.customers.filter(customer => {
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.address?.toLowerCase().includes(query)
    );
  });
});

// Check if there are no search results
const hasSearch = computed(() => searchQuery.value.trim().length > 0);
const noSearchResults = computed(() => hasSearch.value && filteredCustomers.value.length === 0);

// Navigation and CRUD operations
const navigateToAddCustomer = () => {
  router.push('/customers/new');
};

const handleEdit = (id: string) => {
  router.push(`/customers/${id}/edit`);
};

/**
 * เปิดไดอะล็อกยืนยันการลบลูกค้า
 * @param id รหัสลูกค้าที่ต้องการลบ
 */
const openDeleteDialog = async (id: string) => {
  console.log('Opening delete dialog for customer ID:', id);
  if (!id) {
    console.error('Invalid customer ID for deletion');
    error('ไม่พบรหัสลูกค้าที่ต้องการลบ');
    return;
  }
  
  // ใช้ confirmDelete จาก useConfirmation
  const confirmed = await confirmDelete('ลูกค้ารายนี้');
  
  if (confirmed) {
    // ถ้ายืนยันการลบ ให้ดำเนินการลบลูกค้า
    await deleteCustomer(id);
  }
};

/**
 * ลบลูกค้า
 * @param id รหัสลูกค้าที่ต้องการลบ
 */
const deleteCustomer = async (id: string) => {
  try {
    await customerStore.deleteCustomer(id);
    success('ลบข้อมูลลูกค้าเรียบร้อยแล้ว');
    setTimeout(() => {
      loadCustomers(currentPage.value);
    }, 500);
  } catch (err) {
    console.error('Error deleting customer:', err);
    error('ไม่สามารถลบข้อมูลได้ กรุณาลองอีกครั้ง: ' + (err instanceof Error ? err.message : String(err)));
  }
};

const handleRefresh = () => {
  loadCustomers(currentPage.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadCustomers(page);
};

const handleSearch = () => {
  currentPage.value = 1;
  loadCustomers(1);
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
          <span class="text-h5 font-weight-bold">รายการลูกค้า</span>
          <p class="text-subtitle-2 text-medium-emphasis mt-1 mb-0">จัดการข้อมูลลูกค้าทั้งหมดในระบบ</p>
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
            @click="navigateToAddCustomer"
          >
            เพิ่มลูกค้า
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Search Bar -->
        <CustomerFilter
          @search="(query) => { searchQuery = query; handleSearch(); }"
          @reset="searchQuery = ''; handleSearch()"
        />

        <!-- Loading State -->
        <div v-if="customerStore.loading" class="d-flex justify-center align-center my-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="customerStore.error"
          type="error"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          {{ customerStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!customerStore.customers.length"
          type="info"
          class="mb-6"
          rounded="xl"
          border="start"
          elevation="2"
        >
          ไม่พบข้อมูลลูกค้า กรุณาเพิ่มลูกค้าใหม่
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
          ไม่พบลูกค้าที่ตรงกับคำค้นหา
        </v-alert>

        <!-- Customer List - Card View for Mobile (sm and smaller) -->
        <div v-if="!customerStore.loading && !customerStore.error && customerStore.customers.length > 0 && !noSearchResults && $vuetify.display.smAndDown" class="customer-cards">
          <CustomerCard 
            v-for="customer in filteredCustomers" 
            :key="customer.id" 
            :customer="customer"
            @edit="handleEdit"
            @delete="openDeleteDialog"
            class="mb-4"
          />

          <!-- Pagination for Mobile -->
          <div class="d-flex justify-center mt-6">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(customerStore.totalCustomers / pageSize)"
              @update:model-value="handlePageChange"
              rounded="xl"
              total-visible="3"
              density="comfortable"
              class="elevation-2 rounded-xl pa-2"
            ></v-pagination>
          </div>
        </div>

        <!-- Customer Table - For Desktop (md and larger) -->
        <div v-if="!customerStore.loading && !customerStore.error && customerStore.customers.length > 0 && !noSearchResults && $vuetify.display.mdAndUp" class="table-responsive">
          <CustomerTable
            :customers="filteredCustomers"
            :loading="customerStore.loading"
            :total-customers="customerStore.totalCustomers"
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

<!-- ไม่จำเป็นต้องมี <style> -->
