<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('passwordRecovery.title') }}</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handlePasswordRecovery">
              <div class="mb-3">
                <label for="email" class="form-label">{{ $t('passwordRecovery.email') }}</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': emailError }"
                  id="email"
                  v-model="email"
                  required
                />
                <div v-if="emailError" class="text-danger">{{ emailError }}</div>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading || !emailValid">
                {{ loading ? $t('passwordRecovery.sending') : $t('passwordRecovery.sendRecoveryEmail') }}
              </button>
            </form>
            <div class="mt-3 text-center">
              <router-link to="/login" class="text-decoration-none">{{ $t('passwordRecovery.backToLogin') }}</router-link>
            </div>
          </div>
        </div>
        <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useEmailValidation } from '../composables/useEmailValidation'
import { useValidation } from '../composables/useValidation'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { validateRequired } = useValidation()

const email = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

const { emailValid, emailError } = useEmailValidation(email)
const emailRequiredError = validateRequired(email, 'Email')

const handlePasswordRecovery = async () => {
   email.value = email.value.trim()
   if (!emailValid.value || emailRequiredError.value) {
     error.value = emailError.value || emailRequiredError.value || t('common.invalidEmail')
     return
   }
   loading.value = true
   error.value = ''
   message.value = ''
   try {
     const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
       redirectTo: `${window.location.origin}/reset-password`, // Adjust as needed
     })
     if (resetError) throw resetError
     message.value = t('common.recoveryEmailSent')
   } catch (err: any) {
     error.value = err.message
   } finally {
     loading.value = false
   }
 }
</script>

<style scoped>
/* Additional styles if needed */
</style>