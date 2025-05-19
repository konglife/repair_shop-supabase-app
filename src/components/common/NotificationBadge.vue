<template>
  <div class="notification-container">
    <button class="notification-button" @click="$emit('click')">
      <v-icon icon="mdi-bell" size="small"></v-icon>
    </button>
    <span v-if="count > 0" class="notification-badge">
      {{ count > 99 ? '99+' : count }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  count: {
    type: Number,
    default: 0
  }
});

defineEmits(['click']);
</script>

<style scoped>
.notification-container {
  position: relative;
  display: inline-block;
}

.notification-button {
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

.notification-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: var(--v-error-base, #f44336);
  color: white;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

:deep(.v-theme--dark) .notification-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
