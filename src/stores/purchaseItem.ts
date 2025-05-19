import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { PurchaseItem } from '../types/purchaseItem';

const purchaseItemTable = useSupabaseTable('purchase_items');

export const usePurchaseItemStore = defineStore('purchaseItem', {
  state: () => ({
    purchaseItems: [] as PurchaseItem[],
    selectedPurchaseItem: null as PurchaseItem | null,
    loading: false,
    error: null as any | null,
  }),
  actions: {
    // Note: This action fetches all purchase items.
    // In a real application, you would likely want to fetch items for a specific purchase.
    async fetchAllPurchaseItems() {
      this.loading = true;
      this.error = null;
      try {
        const data = await purchaseItemTable.getAll();
        if (data !== null && data !== undefined) {
          this.purchaseItems = data as unknown as PurchaseItem[];
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching purchase items:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchPurchaseItemById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await purchaseItemTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedPurchaseItem = data as unknown as PurchaseItem;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching purchase item with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createPurchaseItem(purchaseItemData: Omit<PurchaseItem, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const newPurchaseItem = await purchaseItemTable.create(purchaseItemData);
        if (newPurchaseItem !== null && newPurchaseItem !== undefined) {
          this.purchaseItems.push(newPurchaseItem as unknown as PurchaseItem);
        }
        return newPurchaseItem as unknown as PurchaseItem;
      } catch (err) {
        this.error = err;
        console.error('Error creating purchase item:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePurchaseItem(id: string, purchaseItemData: Partial<Omit<PurchaseItem, 'id'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedPurchaseItem = await purchaseItemTable.update(id, purchaseItemData);
        if (updatedPurchaseItem) {
          const index = this.purchaseItems.findIndex(item => item.id === id);
          if (index !== -1) {
            this.purchaseItems[index] = updatedPurchaseItem as PurchaseItem;
          }
          if (this.selectedPurchaseItem?.id === id) {
             this.selectedPurchaseItem = updatedPurchaseItem as PurchaseItem;
          }
        }
        return updatedPurchaseItem as PurchaseItem;
      } catch (err) {
        this.error = err;
        console.error(`Error updating purchase item with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePurchaseItem(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await purchaseItemTable.remove(id);
        this.purchaseItems = this.purchaseItems.filter(item => item.id !== id);
        if (this.selectedPurchaseItem?.id === id) {
          this.selectedPurchaseItem = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting purchase item with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
