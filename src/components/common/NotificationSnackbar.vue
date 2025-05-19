<template>
  <v-snackbar
    v-model="notification.show"
    :color="notification.type"
    :timeout="notification.timeout"
    :location="notification.position"
    class="notification-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="getIconByType(notification.type)"
        class="mr-2"
        size="small"
      ></v-icon>
      <span>{{ notification.message }}</span>
    </div>
    
    <template v-slot:actions v-if="notification.closable">
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="close"
        size="small"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotification } from '../../composables/common/useNotification';

const { state: notification, close } = useNotification();

// ฟังก์ชันสำหรับแปลงประเภทเป็นไอคอน
const getIconByType = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
    default:
      return 'mdi-information';
  }
};
</script>

<style scoped>
.notification-snackbar {
  border-radius: 8px;
}
</style>
