<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ isEditMode ? 'แก้ไข' : 'เพิ่ม' }}รายการสินค้า</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="editableItem.product_id"
                :items="products"
                item-title="name"
                item-value="id"
                label="สินค้า"
                :rules="[(v) => !!v || 'สินค้าห้ามว่าง']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="editableItem.quantity"
                label="จำนวน"
                type="number"
                :rules="[(v) => v > 0 || 'จำนวนต้องมากกว่า 0']"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-text-field
            v-model.number="editableItem.price"
            label="ราคาต่อหน่วย"
            type="number"
            :rules="[(v) => typeof v === 'number' && v >= 0 || 'ราคาต้องไม่ติดลบ']"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="cancel">ยกเลิก</v-btn>
        <v-btn color="primary" variant="text" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue';
import type { PurchaseItem } from '@/types/purchaseItem';

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object as PropType<PurchaseItem | null>, default: null },
  products: { type: Array as PropType<{ id: string; name: string }[]>, default: () => [] },
});

const emit = defineEmits(['update:modelValue', 'save-item', 'cancel']);

const dialog = ref(props.modelValue);
const editableItem = ref<PurchaseItem>({
  id: null,
  purchase_id: '',
  product_id: '',
  quantity: 0,
  price: 0,
  total_price: 0,
});

const form = ref<HTMLFormElement | null>(null);

const isEditMode = computed(() => !!props.item?.id);

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
  if (newVal) {
    // When dialog opens, reset form and load item if in edit mode
    if (form.value) {
      form.value.resetValidation();
    }
    if (props.item) {
      editableItem.value = { ...props.item };
    } else {
      // Reset for new item
      editableItem.value = {
        id: null,
        purchase_id: '',
        product_id: '',
        quantity: 0,
        price: 0,
        total_price: 0,
      };
    }
  }
});

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
});

watch([() => editableItem.value.quantity, () => editableItem.value.price], () => {
  editableItem.value.total_price = editableItem.value.quantity * editableItem.value.price;
});

const cancel = () => {
  dialog.value = false;
  emit('cancel');
};

const save = async () => {
  const { valid } = await form.value!.validate();
  if (!valid) return;

  emit('save-item', editableItem.value);
  dialog.value = false;
};
</script>
