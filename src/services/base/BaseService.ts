import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type ServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

export class BaseService<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get all records from the table
   */
  async getAll(options: { select?: string } = {}): Promise<ServiceResponse<T[]>> {
    try {
      const query = supabase.from(this.tableName).select(options.select || '*');
      const { data, error } = await query;
      
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a record by ID
   */
  async getById(id: string, options: { select?: string } = {}): Promise<ServiceResponse<T>> {
    try {
      const query = supabase
        .from(this.tableName)
        .select(options.select || '*')
        .eq('id', id)
        .single();
        
      const { data, error } = await query;
      
      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const { data: newRecord, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
        
      return { data: newRecord as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const { data: updatedRecord, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      return { data: updatedRecord as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
        
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get records with filter
   */
  async getByFilter(
    column: string, 
    value: string | number | boolean,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(options.select || '*')
        .eq(column, value);
        
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
