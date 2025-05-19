<template>
  <button @click="$emit('toggle')" class="sidebar-toggle-button">
    <v-icon :icon="collapsed ? 'mdi-menu' : 'mdi-close'" size="small"></v-icon>
  </button>
</template>

<script setup lang="ts">
defineProps({
  collapsed: {
    type: Boolean,
    default: true
  }
});

defineEmits(['toggle']);
</script>

<style scoped>
.sidebar-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.sidebar-toggle-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.v-theme--dark) .sidebar-toggle-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
