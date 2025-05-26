import { defineStore } from 'pinia';
import type { Stock } from '@/types/stock';
import { supabase } from '@/supabaseClient';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stocks: [] as Stock[],
    selectedStock: null as Stock | null,
    loading: false,
    error: null as any | null,
    totalItems: 0,
  }),
  actions: {
    async fetchAllStocks(page: number = 1, itemsPerPage: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, error, count } = await supabase
          .from('stocks')
          .select(
            `
            *, products(*, units(*))
            `,
            { count: 'exact' }
          )
          .range(from, to);

        if (error) throw error;
        this.stocks = data.map(stock => ({ ...stock, status: this.calculateStockStatus(stock.min_stock, stock.current_stock) })) as unknown as Stock[];
        this.totalItems = count || 0;
      } catch (error: any) {
        this.error = error;
        console.error('Error fetching stocks:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchStockById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase
          .from('stocks')
          .select(
            `
            *, products(*, units(*))
            `
          )
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          this.selectedStock = { ...data, status: this.calculateStockStatus(data.min_stock, data.current_stock) } as unknown as Stock;
        }
      } catch (err: any) {
        this.error = err;
        console.error('Error fetching stock by ID:', err);
      } finally {
        this.loading = false;
      }
    },

    async createStock(stockData: Omit<Stock, 'id' | 'created_at' | 'updated_at' | 'products' | 'units'>) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase
          .from('stocks')
          .insert([stockData])
          .select(
            `
            *, products(*, units(*))
            `
          )
          .single();

        if (error) throw error;
        if (data) {
          const newStock = { ...data, status: this.calculateStockStatus(data.min_stock, data.current_stock) } as unknown as Stock;
          this.stocks.push(newStock);
        }
      } catch (err: any) {
        this.error = err;
        console.error('Error creating stock:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateStock(id: string, stockData: Partial<Omit<Stock, 'id' | 'created_at' | 'updated_at' | 'products' | 'units'>>) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase
          .from('stocks')
          .update(stockData)
          .eq('id', id)
          .select(
            `
            *, products(*, units(*))
            `
          )
          .single();

        if (error) throw error;
        if (data) {
          const updatedStock = { ...data, status: this.calculateStockStatus(data.min_stock, data.current_stock) } as unknown as Stock;
          const index = this.stocks.findIndex(s => s.id === id);
          if (index !== -1) {
            this.stocks[index] = updatedStock;
          }
          if (this.selectedStock?.id === id) {
            this.selectedStock = updatedStock;
          }
        }
        return data as unknown as Stock;
      } catch (err: any) {
        this.error = err;
        console.error('Error updating stock:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteStock(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await supabase
          .from('stocks')
          .delete()
          .eq('id', id);

        if (error) throw error;
        this.stocks = this.stocks.filter(s => s.id !== id);
        if (this.selectedStock?.id === id) {
          this.selectedStock = null;
        }
      } catch (err: any) {
        this.error = err;
        console.error('Error deleting stock:', err);
      } finally {
        this.loading = false;
      }
    },

    calculateStockStatus(minStock: number, currentStock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
      if (currentStock === 0) {
        return 'Out of Stock';
      } else if (currentStock <= minStock) {
        return 'Low Stock';
      } else {
        return 'In Stock';
      }
    },
  },
});
