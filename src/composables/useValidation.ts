import { computed, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useValidation() {
  const { t } = useI18n()

  const validateRequired = (value: Ref<string>, fieldName: string, allowDangerousChars: boolean = false) => {
    return computed(() => {
      const trimmed = value.value.trim()
      if (!trimmed) {
        return t('validation.required', { field: fieldName })
      }
      if (trimmed.length < 2) {
        return t('validation.minLength', { field: fieldName, min: 2 })
      }
      if (trimmed.length > 100) {
        return t('validation.maxLength', { field: fieldName, max: 100 })
      }
      // Check for potentially harmful characters (skip for passwords)
      if (!allowDangerousChars) {
        const dangerousChars = /[<>\"'&]/
        if (dangerousChars.test(trimmed)) {
          return t('validation.invalidChars', { field: fieldName })
        }
      }
      return ''
    })
  }

  const validateEmail = (email: Ref<string>) => {
    return computed(() => {
      const trimmed = email.value.trim()
      if (!trimmed) {
        return t('validation.required', { field: 'Email' })
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmed)) {
        return t('validation.invalidEmail')
      }
      if (trimmed.length > 254) {
        return t('validation.emailTooLong')
      }
      return ''
    })
  }

  const validateDateTime = (dateTime: Ref<string>, fieldName: string = 'Date and time') => {
    return computed(() => {
      if (!dateTime.value) {
        return t('validation.required', { field: fieldName })
      }
      const date = new Date(dateTime.value)
      if (isNaN(date.getTime())) {
        return t('validation.invalidDateTime')
      }
      return ''
    })
  }

  const validateDescription = (description: Ref<string>) => {
    return computed(() => {
      const trimmed = description.value.trim()
      if (!trimmed) {
        return t('validation.required', { field: 'Description' })
      }
      if (trimmed.length < 10) {
        return t('validation.descriptionTooShort', { min: 10 })
      }
      if (trimmed.length > 255) {
        return t('validation.descriptionTooLong', { max: 255 })
      }
      return ''
    })
  }

  const isFormValid = (...errors: Ref<string>[]) => {
    return computed(() => errors.every(error => !error.value))
  }

  return {
    validateRequired,
    validateEmail,
    validateDateTime,
    validateDescription,
    isFormValid
  }
}