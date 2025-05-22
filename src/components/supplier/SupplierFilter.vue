<template>
  <v-card flat class="pa-4 rounded-lg">
    <v-text-field
      v-model="searchQueryModel"
      label="ค้นหาซัพพลายเออร์"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      density="comfortable"
      clearable
      @keyup.enter="$emit('search')"
      @click:clear="$emit('search')"
    ></v-text-field>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const emit = defineEmits(['search', 'update:searchQuery']);

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
});

// สร้าง computed property สำหรับ two-way binding
const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (value) => {
    emit('update:searchQuery', value);
  }
});

// ใช้ emit function ที่ประกาศไว้ข้างบน
</script>

<style scoped>
/* สไตล์เฉพาะสำหรับฟิลเตอร์ซัพพลายเออร์ */
</style>
