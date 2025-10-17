import { useI18n } from 'vue-i18n'

export function useErrorHandler() {
  const { t } = useI18n()

  const sanitizeError = (error: any): string => {
    // If it's already a string, return it
    if (typeof error === 'string') {
      return error
    }

    // If it has a message property, use that
    if (error?.message) {
      // Check for common Supabase/PostgreSQL error patterns and sanitize them
      const message = error.message.toLowerCase()

      // Authentication errors
      if (message.includes('invalid login credentials') ||
          message.includes('email not confirmed') ||
          message.includes('invalid email')) {
        return t('errors.invalidCredentials')
      }

      // Permission errors
      if (message.includes('insufficient_privilege') ||
          message.includes('permission denied') ||
          message.includes('access denied')) {
        return t('errors.permissionDenied')
      }

      // Duplicate key errors
      if (message.includes('duplicate key') ||
          message.includes('unique constraint') ||
          message.includes('already exists')) {
        return t('errors.duplicateEntry')
      }

      // Foreign key constraint errors
      if (message.includes('foreign key') ||
          message.includes('violates foreign key constraint') ||
          message.includes('still referenced')) {
        return t('errors.constraintViolation')
      }

      // Network/connection errors
      if (message.includes('network') ||
          message.includes('connection') ||
          message.includes('timeout')) {
        return t('errors.networkError')
      }

      // Database connection errors
      if (message.includes('connection to server') ||
          message.includes('server closed the connection')) {
        return t('errors.databaseError')
      }

      // Generic database errors
      if (message.includes('syntax error') ||
          message.includes('invalid input syntax')) {
        return t('errors.invalidInput')
      }

      // Return a generic message for any other database-specific errors
      return t('errors.operationFailed')
    }

    // If it has a code property (Supabase specific)
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116': // Row not found
          return t('errors.notFound')
        case '23505': // Unique violation
          return t('errors.duplicateEntry')
        case '23503': // Foreign key violation
          return t('errors.constraintViolation')
        case '42501': // Insufficient privilege
          return t('errors.permissionDenied')
        default:
          return t('errors.operationFailed')
      }
    }

    // Default fallback
    return t('errors.unknownError')
  }

  const handleApiError = (error: any, operation: string = 'operation'): string => {
    console.error(`Error during ${operation}:`, error)
    return sanitizeError(error)
  }

  return {
    sanitizeError,
    handleApiError
  }
}