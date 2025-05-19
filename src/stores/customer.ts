import { defineStore } from 'pinia';
import { useSupabaseTable } from '../composables/useSupabaseTable';
import type { Customer } from '../types/customer';
import { supabase } from '../supabaseClient'; // Import supabase client

const customerTable = useSupabaseTable('customers');

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [] as Customer[],
    selectedCustomer: null as Customer | null,
    loading: false,
    error: null as any | null,
    // Pagination state
    totalCustomers: 0,
  }),
  actions: {
    async fetchAllCustomers(page: number = 1, pageSize: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize - 1;

        const { data, error: fetchError, count } = await supabase
          .from('customers') // Directly use supabase client for count
          .select('*', { count: 'exact' }) // Fetch data and count
          .range(startIndex, endIndex); // Apply pagination

        if (fetchError) {
          this.error = fetchError;
          console.error('Error fetching customers:', fetchError);
          this.customers = [];
          this.totalCustomers = 0;
        } else {
          this.customers = data as unknown as Customer[];
          this.totalCustomers = count || 0;
        }
      } catch (err) {
        this.error = err;
        console.error('Error fetching customers:', err);
        this.customers = [];
        this.totalCustomers = 0;
      } finally {
        this.loading = false;
      }
    },

    async fetchCustomerById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await customerTable.getById(id);
         if (data !== null && data !== undefined) { // Explicitly check if data is not null/undefined
          this.selectedCustomer = data as unknown as Customer; // Use unknown as intermediate step
        }
      } catch (err) {
        this.error = err;
        console.error(`Error fetching customer with ID ${id}:`, err);
      } finally {
        this.loading = false;
      }
    },

    async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true;
      this.error = null;
      try {
        const newCustomer = await customerTable.create(customerData);
        if (newCustomer !== null && newCustomer !== undefined) { // Explicitly check if data is not null/undefined
          this.customers.push(newCustomer as unknown as Customer); // Use unknown as intermediate step
        }
        return newCustomer as unknown as Customer; // Use unknown as intermediate step
      } catch (err) {
        this.error = err;
        console.error('Error creating customer:', err);
        throw err; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },

    async updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) {
      this.loading = true;
      this.error = null;
      try {
        console.log(`Updating customer with ID ${id}:`, customerData);
        
        // ตรวจสอบว่า id ถูกต้องหรือไม่
        if (!id) {
          throw new Error('ไม่พบรหัสลูกค้าที่ต้องการแก้ไข');
        }
        
        const updatedCustomer = await customerTable.update(id, customerData);
        console.log('Updated customer result:', updatedCustomer);
        
        if (updatedCustomer) {
          const index = this.customers.findIndex(c => c.id === id);
          if (index !== -1) {
            this.customers[index] = updatedCustomer as Customer;
          }
          if (this.selectedCustomer?.id === id) {
             this.selectedCustomer = updatedCustomer as Customer;
          }
        } else {
          throw new Error('ไม่สามารถอัปเดตข้อมูลลูกค้าได้');
        }
        
        return updatedCustomer as Customer;
      } catch (err) {
        this.error = err;
        console.error(`Error updating customer with ID ${id}:`, err);
        throw err; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },

    async deleteCustomer(id: string) {
      this.loading = true;
      this.error = null;
      try {
        console.log(`Deleting customer with ID ${id}`);
        
        // ตรวจสอบว่า id ถูกต้องหรือไม่
        if (!id) {
          const error = new Error('ไม่พบรหัสลูกค้าที่ต้องการลบ');
          console.error(error);
          throw error;
        }
        
        // เรียกใช้ API เพื่อลบข้อมูลโดยตรงจาก Supabase
        console.log('Calling Supabase API to delete customer...');
        const { data, error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);
        
        console.log('Supabase delete response:', { data, error: deleteError });
        
        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
          throw deleteError;
        }
        
        // อัปเดตข้อมูลในสโตร์
        const previousLength = this.customers.length;
        this.customers = this.customers.filter(c => c.id !== id);
        console.log(`Filtered customers: removed ${previousLength - this.customers.length} items`);
        
        if (this.selectedCustomer?.id === id) {
          this.selectedCustomer = null;
          console.log('Cleared selected customer');
        }
        
        console.log(`Customer with ID ${id} deleted successfully`);
        return true; // ส่งค่ากลับเป็น true เมื่อลบสำเร็จ
      } catch (err) {
        this.error = err;
        console.error(`Error deleting customer with ID ${id}:`, err);
        throw err; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },
  },
});
