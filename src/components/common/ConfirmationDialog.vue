<template>
  <v-dialog
    v-model="dialog.show"
    :persistent="dialog.persistent"
    :max-width="dialog.width"
    class="confirmation-dialog"
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon
          :icon="getIconByType(dialog.type)"
          :color="getColorByType(dialog.type)"
          size="large"
          class="mr-2"
        ></v-icon>
        {{ dialog.title }}
      </v-card-title>
      
      <v-card-text class="pa-4 pb-0">
        <p>{{ dialog.message }}</p>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="onCancel"
          :disabled="loading"
        >
          {{ dialog.cancelText }}
        </v-btn>
        <v-btn
          :color="getColorByType(dialog.type)"
          :loading="loading"
          variant="elevated"
          class="ml-3"
          @click="onConfirm"
        >
          {{ dialog.confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useConfirmation } from '../../composables/common/useConfirmation';

const { state: dialog, loading, handleConfirm, handleCancel } = useConfirmation();

// ฟังก์ชันสำหรับจัดการเมื่อกดปุ่มยืนยัน
const onConfirm = () => {
  handleConfirm();
};

// ฟังก์ชันสำหรับจัดการเมื่อกดปุ่มยกเลิก
const onCancel = () => {
  handleCancel();
};

// ฟังก์ชันสำหรับแปลงประเภทเป็นไอคอน
const getIconByType = (type: string) => {
  switch (type) {
    case 'info':
      return 'mdi-information';
    case 'warning':
      return 'mdi-alert';
    case 'error':
      return 'mdi-alert-circle';
    case 'success':
      return 'mdi-check-circle';
    default:
      return 'mdi-help-circle';
  }
};

// ฟังก์ชันสำหรับแปลงประเภทเป็นสี
const getColorByType = (type: string) => {
  switch (type) {
    case 'info':
      return 'primary';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'success':
      return 'success';
    default:
      return 'primary';
  }
};
</script>

<style scoped>
.confirmation-dialog {
  border-radius: 16px;
}
</style>
