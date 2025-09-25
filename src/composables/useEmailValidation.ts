import { computed, type Ref } from 'vue'

export function useEmailValidation(email: Ref<string>) {
  const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
  const emailError = computed(() => email.value && !emailValid.value ? 'Invalid email format' : '')
  return { emailValid, emailError }
}