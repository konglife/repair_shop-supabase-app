<script setup lang="ts">
import { ref, watch } from 'vue';

// Define props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  unitId: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Define emits
const emit = defineEmits(['update:modelValue', 'confirm']);

// Local dialog state
const localDialog = ref(props.modelValue);

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newValue) => {
  localDialog.value = newValue;
});

// Watch for changes in local dialog state
watch(localDialog, (newValue) => {
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
});

// Handle close
const handleClose = () => {
  localDialog.value = false;
};

// Handle confirm
const handleConfirm = () => {
  emit('confirm', props.unitId);
};
</script>

<template>
  <v-dialog
    v-model="localDialog"
    max-width="500"
    persistent
    class="delete-dialog"
  >
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon color="error" size="large" class="mr-2">mdi-alert-circle</v-icon>
        ยืนยันการลบข้อมูล
      </v-card-title>
      
      <v-card-text class="pa-4 pb-0">
        <p>คุณต้องการลบข้อมูลหน่วยนับนี้ใช่หรือไม่?</p>
        <p class="text-body-2 text-medium-emphasis">
          การดำเนินการนี้ไม่สามารถยกเลิกได้ และข้อมูลทั้งหมดของหน่วยนับนี้จะถูกลบออกจากระบบ
        </p>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          rounded="xl"
          @click="handleClose"
          :disabled="loading"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          rounded="xl"
          class="ml-3"
          @click="handleConfirm"
          :loading="loading"
        >
          ยืนยันการลบ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.delete-dialog {
  border-radius: 16px;
}
</style>
