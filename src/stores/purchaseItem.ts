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
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  }),
  actions: {
    async fetchPurchaseItems(purchaseId: string | null = null, page: number = 1, itemsPerPage: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        let queryBuilderFn = (query: any) => query;
        if (purchaseId) {
          queryBuilderFn = (query: any) => query.eq('purchase_id', purchaseId);
        }
        const { data, count } = await purchaseItemTable.getAll(
          (page - 1) * itemsPerPage,
          page * itemsPerPage - 1,
          queryBuilderFn
        );
        this.purchaseItems = data as PurchaseItem[];
        this.totalItems = count || 0;
        this.currentPage = page;
        this.itemsPerPage = itemsPerPage;
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

    async updatePurchaseItem(id: string | null, purchaseItemData: Partial<Omit<PurchaseItem, 'id'>>) {
      if (id === null) {
        console.error('Cannot update purchase item with null ID.');
        return;
      }
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
