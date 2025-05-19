import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Product } from '../types/product';

const productTable = useSupabaseTable('products');

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    selectedProduct: null as Product | null,
    loading: false,
    error: null as any | null,
  }),
  actions: {
    async fetchAllProducts() {
      this.loading = true;
      this.error = null;
      try {
        const data = await productTable.getAll();
        if (data !== null && data !== undefined) {
          this.products = data as unknown as Product[];
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching products:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await productTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedProduct = data as unknown as Product;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching product with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'average_cost'>) {
      this.loading = true;
      this.error = null;
      try {
        const newProduct = await productTable.create(productData);
        if (newProduct !== null && newProduct !== undefined) {
          this.products.push(newProduct as unknown as Product);
        }
        return newProduct as unknown as Product;
      } catch (err) {
        this.error = err;
        console.error('Error creating product:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'average_cost'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedProduct = await productTable.update(id, productData);
        if (updatedProduct) {
          const index = this.products.findIndex(p => p.id === id);
          if (index !== -1) {
            this.products[index] = updatedProduct as Product;
          }
          if (this.selectedProduct?.id === id) {
             this.selectedProduct = updatedProduct as Product;
          }
        }
        return updatedProduct as Product;
      } catch (err) {
        this.error = err;
        console.error(`Error updating product with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await productTable.remove(id);
        this.products = this.products.filter(p => p.id !== id);
        if (this.selectedProduct?.id === id) {
          this.selectedProduct = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting product with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
