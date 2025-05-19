import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Stock } from '../types/stock';

const stockTable = useSupabaseTable('stocks');

export const useStockStore = defineStore('stock', {
  state: () => ({
    stocks: [] as Stock[],
    selectedStock: null as Stock | null,
    loading: false,
    error: null as any | null,
  }),
  actions: {
    async fetchAllStocks() {
      this.loading = true;
      this.error = null;
      try {
        const data = await stockTable.getAll();
        if (data !== null && data !== undefined) {
          this.stocks = data as unknown as Stock[];
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching stocks:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchStockById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await stockTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedStock = data as unknown as Stock;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching stock with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createStock(stockData: Omit<Stock, 'id' | 'last_updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newStock = await stockTable.create(stockData);
        if (newStock !== null && newStock !== undefined) {
          this.stocks.push(newStock as unknown as Stock);
        }
        return newStock as unknown as Stock;
      } catch (err) {
        this.error = err;
        console.error('Error creating stock:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateStock(id: string, stockData: Partial<Omit<Stock, 'id' | 'last_updated_at'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedStock = await stockTable.update(id, stockData);
        if (updatedStock) {
          const index = this.stocks.findIndex(s => s.id === id);
          if (index !== -1) {
            this.stocks[index] = updatedStock as Stock;
          }
          if (this.selectedStock?.id === id) {
             this.selectedStock = updatedStock as Stock;
          }
        }
        return updatedStock as Stock;
      } catch (err) {
        this.error = err;
        console.error(`Error updating stock with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteStock(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await stockTable.remove(id);
        this.stocks = this.stocks.filter(s => s.id !== id);
        if (this.selectedStock?.id === id) {
          this.selectedStock = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting stock with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
