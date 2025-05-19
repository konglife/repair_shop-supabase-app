<script setup lang="ts">
import BaseCard from '../common/BaseCard.vue';

const props = defineProps({
  customer: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

// Function to generate initials from name or email
const getInitials = (name: string) => {
  if (!name) return 'NA';
  // Handle email addresses
  if (name.includes('@')) {
    const username = name.split('@')[0];
    if (username.length > 1) {
      return username.substring(0, 2).toUpperCase();
    } 
    return username.substring(0, 1).toUpperCase().repeat(2);
  }
  // Regular name - take first 2 letters
  return name.substring(0, 2).toUpperCase();
};

const handleEdit = () => {
  emit('edit', props.customer.id);
};

const handleDelete = () => {
  emit('delete', props.customer.id);
};
</script>

<template>
  <BaseCard class="customer-card" elevation="3">
    <template #title>
      <div class="d-flex align-center">
        <v-avatar size="48" color="primary" class="mr-4" rounded="lg">
          <span class="text-subtitle-1 text-white">{{ getInitials(customer.name) }}</span>
        </v-avatar>
        <div>
          <div class="text-h6">{{ customer.name }}</div>
          <div class="text-subtitle-2 mt-1 d-flex align-center">
            <v-icon size="small" class="mr-1">mdi-phone</v-icon>
            {{ customer.phone }}
          </div>
        </div>
      </div>
    </template>
    
    <template #default>
      <div class="address-container">
        <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
        <span>{{ customer.address }}</span>
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
.customer-card {
  transition: transform 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.address-container {
  display: flex;
  align-items: flex-start;
}

.address-container span {
  flex: 1;
  line-height: 1.4;
}
</style>
