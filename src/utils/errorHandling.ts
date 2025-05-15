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
    const errorMsg = error.message.toLowerCase();
    
    // Authentication specific errors
    if (errorMsg.includes('invalid login')) {
      return 'Invalid email or password';
    } else if (errorMsg.includes('already registered')) {
      return 'Email is already registered. Please use a different email or login instead.';
    } else if (errorMsg.includes('password') && errorMsg.includes('strong')) {
      return 'Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols.';
    } else if (errorMsg.includes('email verification')) {
      return 'Please verify your email address before logging in.';
    }
    
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
