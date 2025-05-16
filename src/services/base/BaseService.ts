import { Database } from '@/types/supabase';
import { DatabaseService, ServiceResponse } from '../db/DatabaseService';

/**
 * Base service class that provides common functionality for all domain services
 * All services should extend this class and provide the table name
 */
export class BaseService<T> {
  protected tableName: string;
  protected databaseService: DatabaseService;

  constructor(
    tableName: keyof Database['public']['Tables'], 
    databaseService?: DatabaseService
  ) {
    this.tableName = tableName as string;
    this.databaseService = databaseService || new DatabaseService();
  }

  /**
   * Get all records from the table
   */
  async getAll(options: { select?: string } = {}): Promise<ServiceResponse<T[]>> {
    return await this.databaseService.getAll<T>(this.tableName, options);
  }

  /**
   * Get a record by ID
   */
  async getById(id: string, options: { select?: string } = {}): Promise<ServiceResponse<T>> {
    return await this.databaseService.getById<T>(this.tableName, id, options);
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    return await this.databaseService.create<T>(this.tableName, data);
  }

  /**
   * Create multiple records
   */
  async createMany(records: Partial<T>[]): Promise<ServiceResponse<T[]>> {
    return await this.databaseService.createMany<T>(this.tableName, records);
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    return await this.databaseService.update<T>(this.tableName, id, data);
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<ServiceResponse<null>> {
    return await this.databaseService.delete(this.tableName, id);
  }

  /**
   * Find records by filter
   */
  async findByFilter(
    column: string, 
    value: string | number | boolean | null,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    return await this.databaseService.findByFilter<T>(
      this.tableName,
      column,
      value,
      options
    );
  }

  /**
   * Find records by multiple filters
   */
  async findByFilters(
    filters: Record<string, string | number | boolean | null>,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T[]>> {
    return await this.databaseService.findByFilters<T>(
      this.tableName,
      filters,
      options
    );
  }

  /**
   * Find a single record by filter
   */
  async findOne(
    column: string,
    value: string | number | boolean | null,
    options: { select?: string } = {}
  ): Promise<ServiceResponse<T>> {
    return await this.databaseService.findOne<T>(
      this.tableName,
      column,
      value,
      options
    );
  }

  /**
   * Advanced query with multiple filters and options
   */
  async query(
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
    return await this.databaseService.query<T>(this.tableName, options);
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(
    callback: () => Promise<ServiceResponse<R>>
  ): Promise<ServiceResponse<R>> {
    return await this.databaseService.transaction(callback);
  }
}
