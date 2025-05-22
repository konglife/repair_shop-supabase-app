<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5 bg-error text-white">
        <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
        ยืนยันการลบซัพพลายเออร์
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p class="text-body-1 mt-4">คุณต้องการลบซัพพลายเออร์นี้ใช่หรือไม่?</p>
        <p class="text-caption text-medium-emphasis">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="loading"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          class="ml-3"
          @click="confirmDelete"
          :loading="loading"
        >
          ลบข้อมูล
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['confirm', 'cancel']);
const dialog = ref(false);
const loading = ref(false);

// เปิด dialog
const openDialog = () => {
  dialog.value = true;
};

// ปิด dialog
const closeDialog = () => {
  dialog.value = false;
  emit('cancel');
};

// ยืนยันการลบ
const confirmDelete = () => {
  loading.value = true;
  emit('confirm');
  setTimeout(() => {
    loading.value = false;
    dialog.value = false;
  }, 500);
};

// Export functions
defineExpose({
  openDialog
});
</script>

<style scoped>
/* สไตล์เฉพาะสำหรับ dialog ลบซัพพลายเออร์ */
</style>
