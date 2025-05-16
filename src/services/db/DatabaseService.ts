import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type ServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Central database service that provides access to all tables in the database
 * This service is responsible for all direct database operations
 */
export class DatabaseService {
  /**
   * Get all records from a table
   */
  async getAll<T>(
    table: keyof Database['public']['Tables'],
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    try {
      const query = supabase.from(table).select(options.select || '*');
      const { data, error } = await query;
      
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a record by ID from any table
   */
  async getById<T>(
    table: keyof Database['public']['Tables'], 
    id: string, 
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const query = supabase
        .from(table)
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
   * Create a new record in any table
   */
  async create<T>(
    table: keyof Database['public']['Tables'],
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamps = {
        ...data,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { data: newRecord, error } = await supabase
        .from(table)
        .insert(dataWithTimestamps)
        .select()
        .single();
        
      return { data: newRecord as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create multiple records in any table
   */
  async createMany<T>(
    table: keyof Database['public']['Tables'],
    records: Partial<T>[]
  ): Promise<ServiceResponse<T[]>> {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamps = records.map(record => ({
        ...record,
        created_at: timestamp,
        updated_at: timestamp
      }));
      
      const { data: newRecords, error } = await supabase
        .from(table)
        .insert(dataWithTimestamps)
        .select();
        
      return { data: newRecords as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a record in any table
   */
  async update<T>(
    table: keyof Database['public']['Tables'],
    id: string, 
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const dataWithTimestamp = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedRecord, error } = await supabase
        .from(table)
        .update(dataWithTimestamp)
        .eq('id', id)
        .select()
        .single();
        
      return { data: updatedRecord as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a record from any table
   */
  async delete(
    table: keyof Database['public']['Tables'],
    id: string
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Find records by filter from any table
   */
  async findByFilter<T>(
    table: keyof Database['public']['Tables'],
    column: string, 
    value: string | number | boolean | null,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    try {
      const query = supabase
        .from(table)
        .select(options.select || '*');
      
      const { data, error } = value === null 
        ? await query.is(column, null)
        : await query.eq(column, value);
        
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Find records by multiple filters from any table
   */
  async findByFilters<T>(
    table: keyof Database['public']['Tables'],
    filters: Record<string, string | number | boolean | null>,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    try {
      let query = supabase
        .from(table)
        .select(options.select || '*');
      
      Object.entries(filters).forEach(([column, value]) => {
        if (value === null) {
          query = query.is(column, null);
        } else {
          query = query.eq(column, value);
        }
      });
      
      const { data, error } = await query;
        
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Advanced query with multiple filters and options
   */
  async query<T>(
    table: keyof Database['public']['Tables'],
    options: {
      select?: string;
      eq?: Record<string, any>;
      neq?: Record<string, any>;
      gt?: Record<string, any>;
      lt?: Record<string, any>;
      gte?: Record<string, any>;
      lte?: Record<string, any>;
      like?: Record<string, string>;
      ilike?: Record<string, string>;
      in?: Record<string, any[]>;
      containedBy?: Record<string, any[]>;
      contains?: Record<string, any[]>;
      rangeLt?: Record<string, any>;
      rangeGt?: Record<string, any>;
      rangeGte?: Record<string, any>;
      rangeLte?: Record<string, any>;
      order?: { column: string; ascending?: boolean }[];
      limit?: number;
      offset?: number;
    }
  ): Promise<ServiceResponse<T[]>> {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply equals filters
      if (options.eq) {
        Object.entries(options.eq).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }
      
      // Apply not-equals filters
      if (options.neq) {
        Object.entries(options.neq).forEach(([column, value]) => {
          query = query.neq(column, value);
        });
      }
      
      // Apply greater-than filters
      if (options.gt) {
        Object.entries(options.gt).forEach(([column, value]) => {
          query = query.gt(column, value);
        });
      }
      
      // Apply less-than filters
      if (options.lt) {
        Object.entries(options.lt).forEach(([column, value]) => {
          query = query.lt(column, value);
        });
      }
      
      // Apply greater-than-or-equals filters
      if (options.gte) {
        Object.entries(options.gte).forEach(([column, value]) => {
          query = query.gte(column, value);
        });
      }
      
      // Apply less-than-or-equals filters
      if (options.lte) {
        Object.entries(options.lte).forEach(([column, value]) => {
          query = query.lte(column, value);
        });
      }
      
      // Apply like filters
      if (options.like) {
        Object.entries(options.like).forEach(([column, value]) => {
          query = query.like(column, value);
        });
      }
      
      // Apply ilike filters
      if (options.ilike) {
        Object.entries(options.ilike).forEach(([column, value]) => {
          query = query.ilike(column, value);
        });
      }
      
      // Apply in filters
      if (options.in) {
        Object.entries(options.in).forEach(([column, values]) => {
          query = query.in(column, values);
        });
      }
      
      // Apply ordering
      if (options.order) {
        options.order.forEach(({ column, ascending = true }) => {
          query = query.order(column, { ascending });
        });
      }
      
      // Apply limit
      if (options.limit !== undefined) {
        query = query.limit(options.limit);
      }
      
      // Apply offset
      if (options.offset !== undefined) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      return { data: data as T[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Execute a database transaction
   */
  async transaction<T>(
    callback: () => Promise<ServiceResponse<T>>
  ): Promise<ServiceResponse<T>> {
    try {
      return await callback();
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Find a single record by filter
   */
  async findOne<T>(
    table: keyof Database['public']['Tables'],
    column: string, 
    value: string | number | boolean | null,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T>> {
    try {
      const query = supabase
        .from(table)
        .select(options.select || '*');
      
      const { data, error } = value === null 
        ? await query.is(column, null).limit(1).single()
        : await query.eq(column, value).limit(1).single();
        
      return { data: data as T, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}