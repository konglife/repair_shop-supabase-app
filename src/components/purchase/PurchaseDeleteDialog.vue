<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">ยืนยันการลบ</v-card-title>
      <v-card-text>คุณแน่ใจหรือไม่ว่าต้องการลบใบสั่งซื้อนี้?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="cancelDelete">ยกเลิก</v-btn>
        <v-btn color="red-darken-1" variant="text" @click="deletePurchase">ลบ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePurchaseStore } from '@/stores/purchase';

const props = defineProps({
  modelValue: Boolean,
  purchaseId: [String, null],
});

const emit = defineEmits(['update:modelValue', 'purchase-deleted']);

const purchaseStore = usePurchaseStore();
const dialog = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
});

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
});

const cancelDelete = () => {
  dialog.value = false;
};

const deletePurchase = async () => {
  if (props.purchaseId) {
    await purchaseStore.deletePurchase(props.purchaseId);
    emit('purchase-deleted');
    dialog.value = false;
  }
};
</script>
