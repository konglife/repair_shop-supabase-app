import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Purchase } from '../types/purchase';

const purchaseTable = useSupabaseTable('purchases');

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    purchases: [] as Purchase[],
    selectedPurchase: null as Purchase | null,
    loading: false,
    error: null as any | null,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  }),
  actions: {
    async fetchPurchases(page: number = 1, itemsPerPage: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        console.log('fetchPurchases called with:', { page, itemsPerPage });
        const { data, count } = await purchaseTable.getAll(
          (page - 1) * itemsPerPage,
          page * itemsPerPage - 1,
          (query: any) => query.order('created_at', { ascending: false }) // Pass query builder for ordering
        );

        this.purchases = data || [];
        this.totalItems = count || 0;
        console.log('fetchPurchases completed. Total items:', this.totalItems, 'Data:', this.purchases);
      } catch (err) {
        this.error = err;
        console.error('Error fetching purchases:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchPurchaseById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await purchaseTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedPurchase = data as unknown as Purchase;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching purchase with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createPurchase(purchaseData: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'total_amount' | 'stock_update_processed'>) {
      this.loading = true;
      this.error = null;
      try {
        const newPurchase = await purchaseTable.create(purchaseData);
        if (newPurchase !== null && newPurchase !== undefined) {
          this.purchases.push(newPurchase as unknown as Purchase);
        }
        return newPurchase as unknown as Purchase;
      } catch (err) {
        this.error = err;
        console.error('Error creating purchase:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePurchase(id: string, purchaseData: Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'total_amount' | 'stock_update_processed'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedPurchase = await purchaseTable.update(id, purchaseData);
        if (updatedPurchase) {
          const index = this.purchases.findIndex(p => p.id === id);
          if (index !== -1) {
            this.purchases[index] = updatedPurchase as Purchase;
          }
          if (this.selectedPurchase?.id === id) {
             this.selectedPurchase = updatedPurchase as Purchase;
          }
        }
        return updatedPurchase as Purchase;
      } catch (err) {
        this.error = err;
        console.error(`Error updating purchase with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePurchase(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await purchaseTable.remove(id);
        this.purchases = this.purchases.filter(p => p.id !== id);
        if (this.selectedPurchase?.id === id) {
          this.selectedPurchase = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting purchase with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
