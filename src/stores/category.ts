import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Category } from '../types/category';

const categoryTable = useSupabaseTable('categories');

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    selectedCategory: null as Category | null,
    loading: false,
    error: null as any | null,
  }),
  actions: {
    async fetchAllCategories() {
      this.loading = true;
      this.error = null;
      try {
        const data = await categoryTable.getAll();
        if (data !== null && data !== undefined) {
          this.categories = data as unknown as Category[];
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching categories:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchCategoryById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await categoryTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedCategory = data as unknown as Category;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching category with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newCategory = await categoryTable.create(categoryData);
        if (newCategory !== null && newCategory !== undefined) {
          this.categories.push(newCategory as unknown as Category);
        }
        return newCategory as unknown as Category;
      } catch (err) {
        this.error = err;
        console.error('Error creating category:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedCategory = await categoryTable.update(id, categoryData);
        if (updatedCategory) {
          const index = this.categories.findIndex(c => c.id === id);
          if (index !== -1) {
            this.categories[index] = updatedCategory as Category;
          }
          if (this.selectedCategory?.id === id) {
             this.selectedCategory = updatedCategory as Category;
          }
        }
        return updatedCategory as Category;
      } catch (err) {
        this.error = err;
        console.error(`Error updating category with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await categoryTable.remove(id);
        this.categories = this.categories.filter(c => c.id !== id);
        if (this.selectedCategory?.id === id) {
          this.selectedCategory = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting category with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
