<script setup lang="ts">
import BaseCard from '../common/BaseCard.vue';
import type { Product } from '../../types/product';

const props = defineProps({
  product: {
    type: Object as () => Product,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const handleEdit = () => {
  emit('edit', props.product.id);
};

const handleDelete = () => {
  emit('delete', props.product.id);
};
</script>

<template>
  <BaseCard class="product-card" elevation="3">
    <template #title>
      <div class="d-flex align-center">
        <v-icon size="48" color="primary" class="mr-4">mdi-package-variant</v-icon>
        <div>
          <div class="text-h6">{{ product.name }}</div>
          <div class="text-subtitle-2 mt-1 d-flex align-center">
            <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
            {{ product.product_code || 'ไม่มีรหัสสินค้า' }}
          </div>
        </div>
      </div>
    </template>
    
    <template #default>
      <div class="d-flex flex-column">
        <div class="d-flex align-center mb-1">
          <v-icon size="small" class="mr-1">mdi-currency-usd</v-icon>
          <span>ราคาขาย: {{ product.selling_price }}</span>
        </div>
      </div>
    </template>
    
    <template #actions>
      <v-spacer></v-spacer>
      <v-btn 
        color="primary" 
        variant="text" 
        icon="mdi-pencil" 
        @click="handleEdit"
        class="mr-2"
      ></v-btn>
      <v-btn 
        color="error" 
        variant="text" 
        icon="mdi-delete" 
        @click="handleDelete"
      ></v-btn>
    </template>
  </BaseCard>
</template>

<style scoped>
.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
