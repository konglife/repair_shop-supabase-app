<template>
  <BaseCard>
    <template v-slot:title>
      <div class="d-flex align-center">
        <v-avatar color="primary" class="mr-3">
          <v-icon>mdi-truck-delivery</v-icon>
        </v-avatar>
        <span>{{ supplier.name }}</span>
      </div>
    </template>
    
    <template v-slot:content>
      <v-list-item v-if="supplier.phone">
        <template v-slot:prepend>
          <v-icon color="primary">mdi-phone</v-icon>
        </template>
        <v-list-item-title>{{ supplier.phone }}</v-list-item-title>
      </v-list-item>
      
      <v-list-item v-if="supplier.url">
        <template v-slot:prepend>
          <v-icon color="primary">mdi-web</v-icon>
        </template>
        <v-list-item-title>{{ supplier.url }}</v-list-item-title>
      </v-list-item>
      
      <v-list-item v-if="supplier.note">
        <template v-slot:prepend>
          <v-icon color="primary">mdi-note-text</v-icon>
        </template>
        <v-list-item-title>{{ supplier.note }}</v-list-item-title>
      </v-list-item>
    </template>
    
    <template v-slot:actions>
      <v-btn
        color="primary"
        variant="text"
        @click="$emit('edit', supplier.id)"
      >
        แก้ไข
      </v-btn>
      <v-btn
        color="error"
        variant="text"
        @click="$emit('delete', supplier.id)"
      >
        ลบ
      </v-btn>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Supplier } from '../../types/supplier';
import BaseCard from '../common/BaseCard.vue';

defineEmits(['edit', 'delete']);

defineProps({
  supplier: {
    type: Object as () => Supplier,
    required: true
  }
});
</script>

<style scoped>
/* สไตล์เฉพาะสำหรับการ์ดซัพพลายเออร์ */
</style>
