import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: PostgrestError | Error | null): string => {
  if (!error) return 'Unknown error occurred';
  
  if ('code' in error && 'message' in error) {
    // PostgrestError
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case '23505': return 'This record already exists';
      case '23503': return 'This operation would violate referential integrity';
      case '42P01': return 'The table does not exist';
      case '42703': return 'Column does not exist';
      default: return pgError.message || 'Database error occurred';
    }
  } else if (error instanceof Error) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};

/**
 * Handle error with toast notification
 */
export const handleError = (error: PostgrestError | Error | null, customMessage?: string): void => {
  const message = customMessage || formatErrorMessage(error);
  console.error('Error:', error);
  toast({
    variant: 'destructive',
    title: 'Error',
    description: message,
  });
};

/**
 * Check if the error is a specific PostgreSQL error
 */
export const isPostgresError = (error: any, code: string): boolean => {
  return error && 'code' in error && error.code === code;
};

/**
 * Map PostgreSQL errors to user-friendly messages
 */
export const errorCodeMessages: Record<string, string> = {
  '23505': 'A record with this information already exists',
  '23503': 'Cannot delete this record because other records depend on it',
  '42P01': 'Database configuration error: Table not found',
  '42703': 'Database configuration error: Column not found',
  '28P01': 'Invalid login credentials',
  '28000': 'Authentication failed',
};
