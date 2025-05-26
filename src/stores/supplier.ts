import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Supplier } from '../types/supplier';

const supplierTable = useSupabaseTable('suppliers');

export const useSupplierStore = defineStore('supplier', {
  state: () => ({
    suppliers: [] as Supplier[],
    selectedSupplier: null as Supplier | null,
    loading: false,
    error: null as any | null,
  }),
  actions: {
    async fetchAllSuppliers() {
      this.loading = true;
      this.error = null;
      try {
        const data = await supplierTable.getAll();
        if (data !== null && data !== undefined) {
          this.suppliers = data.data as unknown as Supplier[];
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching suppliers:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchSupplierById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await supplierTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedSupplier = data as unknown as Supplier;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching supplier with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newSupplier = await supplierTable.create(supplierData);
        if (newSupplier !== null && newSupplier !== undefined) {
          this.suppliers.push(newSupplier as unknown as Supplier);
        }
        return newSupplier as unknown as Supplier;
      } catch (err) {
        this.error = err;
        console.error('Error creating supplier:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSupplier(id: string, supplierData: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedSupplier = await supplierTable.update(id, supplierData);
        if (updatedSupplier) {
          const index = this.suppliers.findIndex(s => s.id === id);
          if (index !== -1) {
            this.suppliers[index] = updatedSupplier as Supplier;
          }
          if (this.selectedSupplier?.id === id) {
             this.selectedSupplier = updatedSupplier as Supplier;
          }
        }
        return updatedSupplier as Supplier;
      } catch (err) {
        this.error = err;
        console.error(`Error updating supplier with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteSupplier(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await supplierTable.remove(id);
        this.suppliers = this.suppliers.filter(s => s.id !== id);
        if (this.selectedSupplier?.id === id) {
          this.selectedSupplier = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting supplier with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
