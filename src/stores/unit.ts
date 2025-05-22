import { defineStore } from 'pinia';
import { supabase } from '../supabaseClient'; // Import supabase client โดยตรง
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Unit } from '../types/unit';

const unitTable = useSupabaseTable('units');

export const useUnitStore = defineStore('unit', {
  state: () => ({
    units: [] as Unit[],
    selectedUnit: null as Unit | null,
    loading: false,
    error: null as any | null,
    totalUnits: 0, // เพิ่ม totalUnits
  }),
  actions: {
    async fetchAllUnits(page: number = 1, pageSize: number = 10) { // เพิ่ม page และ pageSize
      this.loading = true;
      this.error = null;
      try {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        
        const { data, count, error } = await supabase // ใช้ supabase ที่ import โดยตรง
          .from('units')
          .select('*', { count: 'exact' })
          .range(start, end);

        if (error) throw error;

        if (data !== null && data !== undefined) {
          this.units = data as unknown as Unit[];
          this.totalUnits = count || 0; // อัปเดต totalUnits
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching units:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchUnitById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await unitTable.getById(id);
         if (data !== null && data !== undefined) {
          this.selectedUnit = data as unknown as Unit;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching unit with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createUnit(unitData: Omit<Unit, 'id' | 'created_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newUnit = await unitTable.create(unitData);
        if (newUnit !== null && newUnit !== undefined) {
          this.units.push(newUnit as unknown as Unit);
        }
        return newUnit as unknown as Unit;
      } catch (err) {
        this.error = err;
        console.error('Error creating unit:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateUnit(id: string, unitData: Partial<Omit<Unit, 'id' | 'created_at'>>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedUnit = await unitTable.update(id, unitData);
        if (updatedUnit) {
          const index = this.units.findIndex(u => u.id === id);
          if (index !== -1) {
            this.units[index] = updatedUnit as Unit;
          }
          if (this.selectedUnit?.id === id) {
             this.selectedUnit = updatedUnit as Unit;
          }
        }
        return updatedUnit as Unit;
      } catch (err) {
        this.error = err;
        console.error(`Error updating unit with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUnit(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await unitTable.remove(id);
        this.units = this.units.filter(u => u.id !== id);
        if (this.selectedUnit?.id === id) {
          this.selectedUnit = null;
        }
      } catch (err) {
        this.error = err;
        console.error(`Error deleting unit with ID ${id}:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
