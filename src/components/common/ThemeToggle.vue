<template>
  <button @click="$emit('toggle')" class="theme-toggle-button">
    <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="small"></v-icon>
  </button>
</template>

<script setup lang="ts">
defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle']);
</script>

<style scoped>
.theme-toggle-button {
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

.theme-toggle-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.v-theme--dark) .theme-toggle-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
