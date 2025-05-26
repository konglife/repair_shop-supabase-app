import { ref } from 'vue';
import { supabase } from '../supabaseClient';

export function useSupabaseTable(tableName: string) {
  const data = ref<any | any[] | null>(null);
  const error = ref<any | null>(null);
  const loading = ref<boolean>(false);

  const getAll = async (
    start: number = 0,
    end: number = 9,
    queryBuilder?: (query: any) => any, // SupabaseQueryBuilder
    columns = '*'
  ): Promise<{ data: any[] | null; count: number | null }> => {
    loading.value = true;
    error.value = null;
    let query = supabase.from(tableName).select(columns, { count: 'exact' });

    if (queryBuilder) {
      query = queryBuilder(query);
    }

    try {
      const { data: resultData, error: resultError, count: resultCount } = await query
        .range(start, end);

      data.value = resultData;
      error.value = resultError;
      loading.value = false;
      return { data: resultData, count: resultCount };
    } catch (err: any) {
      error.value = err;
      loading.value = false;
      throw err;
    }
  };

  const getById = async (id: string, columns = '*') => {
    loading.value = true;
    error.value = null;
    const { data: resultData, error: resultError } = await supabase
      .from(tableName)
      .select(columns)
      .eq('id', id)
      .single();
    data.value = resultData; // Note: This will be a single object, not an array
    error.value = resultError;
    loading.value = false;
    if (resultError) throw resultError;
    return resultData;
  };

  const create = async (rowData: any) => {
    loading.value = true;
    error.value = null;
    const { data: resultData, error: resultError } = await supabase
      .from(tableName)
      .insert(rowData)
      .select() // Supabase v2 recommends .select() to return the created record
      .single();
    error.value = resultError;
    loading.value = false;
    if (resultError) throw resultError;
    return resultData;
  };

  const update = async (id: string, rowData: any) => {
    loading.value = true;
    error.value = null;
    const { data: resultData, error: resultError } = await supabase
      .from(tableName)
      .update(rowData)
      .eq('id', id)
      .select() // Supabase v2 recommends .select() to return the updated record
      .single();
    error.value = resultError;
    loading.value = false;
    if (resultError) throw resultError;
    return resultData;
  };

  const remove = async (id: string) => {
    loading.value = true;
    error.value = null;
    const { error: resultError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    error.value = resultError;
    loading.value = false;
    if (resultError) throw resultError;
  };

  return {
    data,
    error,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
