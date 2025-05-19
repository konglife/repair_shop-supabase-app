<template>
  <v-breadcrumbs :items="breadcrumbItems" class="pa-0 ml-2">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right" size="small"></v-icon>
    </template>
    <template v-slot:item="{ item, index }">
      <v-breadcrumbs-item
        :to="index < breadcrumbItems.length - 1 ? item.to : undefined"
        :disabled="index === breadcrumbItems.length - 1"
      >
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Generate breadcrumbs from route.matched for Vuetify v-breadcrumbs
const breadcrumbItems = computed(() => {
  // Default home item
  const items = [
    {
      title: 'หน้าหลัก',
      disabled: false,
      to: '/',
    }
  ];
  
  // Add current route and its parents
  if (route.name && route.name !== 'home' && route.name !== 'dashboard') {
    // For customer list
    if (route.name === 'customers' || route.path.includes('/customers')) {
      items.push({
        title: 'รายการลูกค้า',
        disabled: route.name === 'customers',
        to: '/customers',
      });
    }
    
    // For customer add/edit
    if (route.name === 'customer-add' || route.path.includes('/customers/add')) {
      if (!items.some(item => item.title === 'รายการลูกค้า')) {
        items.push({
          title: 'รายการลูกค้า',
          disabled: false,
          to: '/customers',
        });
      }
      items.push({
        title: 'เพิ่มลูกค้าใหม่',
        disabled: true,
        to: '',
      });
    } else if (route.name === 'customer-edit' || route.path.includes('/customers/edit')) {
      if (!items.some(item => item.title === 'รายการลูกค้า')) {
        items.push({
          title: 'รายการลูกค้า',
          disabled: false,
          to: '/customers',
        });
      }
      items.push({
        title: 'แก้ไขข้อมูลลูกค้า',
        disabled: true,
        to: '',
      });
    }
    
    // For repair routes
    if (route.name === 'repairs' || route.path.includes('/repairs')) {
      items.push({
        title: 'รายการงานซ่อม',
        disabled: route.name === 'repairs',
        to: '/repairs',
      });
    }
    
    // For products routes
    if (route.name === 'products' || route.path.includes('/products')) {
      items.push({
        title: 'รายการสินค้า',
        disabled: route.name === 'products',
        to: '/products',
      });
    }
    
    // For reports routes
    if (route.name === 'reports' || route.path.includes('/reports')) {
      items.push({
        title: 'รายงาน',
        disabled: route.name === 'reports',
        to: '/reports',
      });
    }
    
    // For settings routes
    if (route.name === 'settings' || route.path.includes('/settings')) {
      items.push({
        title: 'ตั้งค่า',
        disabled: route.name === 'settings',
        to: '/settings',
      });
    }
  }
  
  return items;
});
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
