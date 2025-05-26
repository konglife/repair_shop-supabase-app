<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">{{ isEditMode ? 'แก้ไข' : 'สร้าง' }}ใบสั่งซื้อ</h1>
        <v-card>
          <v-card-text>
            <v-form ref="form" @submit.prevent="savePurchase">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchase.purchase_order_number"
                    label="เลขที่ใบสั่งซื้อ"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <!-- TODO: Supplier selection -->
                  <v-select
                    v-model="purchase.supplier_id"
                    :items="supplierOptions"
                    item-title="name"
                    item-value="id"
                    label="ผู้จำหน่าย"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchase.purchase_date"
                    label="วันที่สั่งซื้อ"
                    type="date"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="purchase.expected_delivery_date"
                    label="วันที่คาดว่าจะได้รับ"
                    type="date"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="purchase.status"
                    :items="['Pending', 'Received', 'Cancelled']"
                    label="สถานะ"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="purchase.notes"
                    label="หมายเหตุ"
                  ></v-textarea>
                </v-col>
              </v-row>

              <h2 class="text-h6 mt-4 mb-2">รายการสินค้าที่สั่งซื้อ</h2>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>ราคาต่อหน่วย</th>
                    <th>รวม</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in purchaseItems" :key="index">
                    <td>{{ productOptions.find(p => p.id === item.product_id)?.name || item.product_id }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.total_price }}</td>
                    <td>
                      <v-icon small class="mr-2" @click="editPurchaseItem(item)">mdi-pencil</v-icon>
                      <v-icon small @click="removePurchaseItem(index)">mdi-delete</v-icon>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <v-btn color="secondary" class="mt-4" @click="addPurchaseItem">เพิ่มรายการสินค้า</v-btn>

              <v-divider class="my-4"></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="router.back()">ยกเลิก</v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :disabled="isLoading || !user"
                >
                  บันทึก
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <PurchaseItemFormDialog
    v-model="purchaseItemDialog"
    :item="selectedPurchaseItem"
    :products="productOptions"
    @save-item="handleSavePurchaseItem"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue';
import { usePurchaseStore } from '@/stores/purchase';
import { usePurchaseItemStore } from '@/stores/purchaseItem';
import { useSupplierStore } from '@/stores/supplier';
import { useProductStore } from '@/stores/product';
import { useAuth } from '@/composables/common/useAuth';
import { useRouter } from 'vue-router';
import type { Purchase } from '@/types/purchase';
import type { PurchaseItem } from '@/types/purchaseItem';
import PurchaseItemFormDialog from '@/components/purchase/PurchaseItemFormDialog.vue';

// Define props for the component
const props = defineProps<{
  id?: string; // Define id as an optional string prop
}>();

const router = useRouter();
const purchaseStore = usePurchaseStore();
const purchaseItemStore = usePurchaseItemStore();
const supplierStore = useSupplierStore();
const productStore = useProductStore();
const { user, isLoading } = useAuth();

const purchaseId = ref<string | null>(null);
const isEditMode = computed(() => !!purchaseId.value);
const originalPurchaseItems = ref<PurchaseItem[]>([]);

const purchase = ref<Purchase>({
  id: null,
  purchase_order_number: null,
  supplier_id: null,
  purchase_date: new Date().toISOString().split('T')[0],
  expected_delivery_date: null,
  status: 'Pending',
  notes: null,
  total_amount: 0,
  user_id: null,
  created_at: '',
  updated_at: '',
  stock_update_processed: false,
});

watchEffect(() => {
  if (user.value) {
    purchase.value.user_id = user.value.id;
  }
});

const purchaseItems = ref<PurchaseItem[]>([]);
const purchaseItemDialog = ref(false);
const selectedPurchaseItem = ref<PurchaseItem | null>(null);
const editingItemIndex = ref<number | null>(null);

const form = ref<HTMLFormElement | null>(null);

const supplierOptions = computed(() => supplierStore.suppliers.map(supplier => ({ id: supplier.id, name: supplier.name })));
const productOptions = computed(() => productStore.products.map(product => ({ id: product.id, name: product.name })));

onMounted(async () => {
  if (props.id) {
    purchaseId.value = props.id;
    await purchaseStore.fetchPurchaseById(props.id);
    if (purchaseStore.selectedPurchase) {
      purchase.value = { ...purchaseStore.selectedPurchase };
      // Format dates for display in type='date' inputs
      if (purchase.value.purchase_date) {
        purchase.value.purchase_date = new Date(purchase.value.purchase_date).toISOString().split('T')[0];
      }
      if (purchase.value.expected_delivery_date) {
        purchase.value.expected_delivery_date = new Date(purchase.value.expected_delivery_date).toISOString().split('T')[0];
      }
      // Fetch purchase items for this purchase
      await purchaseItemStore.fetchPurchaseItems(props.id);
      purchaseItems.value = purchaseItemStore.purchaseItems;
      originalPurchaseItems.value = JSON.parse(JSON.stringify(purchaseItems.value));
    }
  }
  await supplierStore.fetchAllSuppliers();
  await productStore.fetchAllProducts();
});

watch(purchaseItems, () => {
  purchase.value.total_amount = purchaseItems.value.reduce((sum: number, item: PurchaseItem) => sum + item.total_price, 0);
}, { deep: true });

const addPurchaseItem = () => {
  selectedPurchaseItem.value = null;
  editingItemIndex.value = null;
  purchaseItemDialog.value = true;
};

const editPurchaseItem = (item: PurchaseItem) => {
  selectedPurchaseItem.value = { ...item };
  purchaseItemDialog.value = true;
};

const removePurchaseItem = (index: number) => {
  purchaseItems.value.splice(index, 1);
};

const handleSavePurchaseItem = (item: PurchaseItem) => {
  if (editingItemIndex.value !== null) {
    // Update existing item
    purchaseItems.value[editingItemIndex.value] = item;
  } else {
    // Add new item
    // Ensure new items do not have an 'id' property so Supabase can generate it
    const newItem = { ...item };
    if (newItem.id === null || newItem.id === '') {
      newItem.id = undefined; // Changed from delete newItem.id;
    }
    purchaseItems.value.push(newItem as PurchaseItem);
  }
  purchaseItemDialog.value = false;
};

const savePurchase = async () => {
  if (isLoading.value) return;

  try {
    if (!form.value?.validate()) {
      return;
    }

    // Ensure user is logged in before saving
    if (!user.value) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการบันทึกใบสั่งซื้อ');
      return;
    }

    // Deep copy to avoid modifying the original reactive object during processing
    const purchaseToSave = JSON.parse(JSON.stringify(purchase.value));

    // Convert empty strings to null for specific fields before sending to Supabase
    if (purchaseToSave.expected_delivery_date === '') purchaseToSave.expected_delivery_date = null;
    if (purchaseToSave.supplier_id === '') purchaseToSave.supplier_id = null;
    // user_id should already be handled by useAuth, but ensure it's not an empty string if somehow set
    if (purchaseToSave.user_id === '') purchaseToSave.user_id = null;

    // Ensure dates are in ISO format before sending to Supabase
    if (purchaseToSave.purchase_date) {
      purchaseToSave.purchase_date = new Date().toISOString(); // Use current timestamp
    }
    if (purchaseToSave.expected_delivery_date) {
      purchaseToSave.expected_delivery_date = new Date(purchaseToSave.expected_delivery_date).toISOString(); // Use full ISO string
    }

    // Remove auto-generated fields before sending to Supabase for creation
    // Keep user_id for RLS policy
    const { id, created_at, updated_at, stock_update_processed, ...dataToSave } = purchaseToSave;

    let savedPurchaseId: string;

    if (isEditMode.value) {
      // Ensure purchaseId.value is a string before assigning
      if (purchaseId.value === null) {
        throw new Error('Purchase ID cannot be null in edit mode.');
      }
      await purchaseStore.updatePurchase(purchaseId.value, dataToSave);
      savedPurchaseId = purchaseId.value; // In edit mode, the ID is already known

      // Logic to delete removed purchase items
      const currentItemIds = new Set(purchaseItems.value.map(item => item.id));
      const itemsToDelete = originalPurchaseItems.value.filter(item => item.id && !currentItemIds.has(item.id));

      for (const item of itemsToDelete) {
        if (item.id) { // Ensure item.id is not null before deleting
          await purchaseItemStore.deletePurchaseItem(item.id);
        }
      }

    } else {
      // For creation, ensure user_id is included for RLS
      const newPurchase = await purchaseStore.createPurchase({ ...dataToSave, user_id: purchaseToSave.user_id });
      if (!newPurchase || !newPurchase.id) {
        throw new Error('Failed to create purchase or retrieve new ID.');
      }
      savedPurchaseId = newPurchase.id;
    }

    // Save purchase items
    for (const item of purchaseItems.value) {
      const itemToSave = { ...item, purchase_id: savedPurchaseId };
      // ตรวจสอบว่า itemToSave.id มีค่าและเป็น string
      if (itemToSave.id) { // This check ensures it's not null or undefined
        // If item has an ID, it's an existing item, update it
        await purchaseItemStore.updatePurchaseItem(itemToSave.id!, itemToSave);
      } else {
        // If item has no ID, it's a new item, create it
        // Ensure 'id' is not sent for new items, even if it's null
        const { id, ...newItemData } = itemToSave; // Destructure 'id' out
        await purchaseItemStore.createPurchaseItem(newItemData);
      }
    }

    router.push({ name: 'PurchaseList' });
  } catch (error) {
    console.error('Error saving purchase:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกใบสั่งซื้อ: ' + (error as Error).message);
  }
};
</script>
