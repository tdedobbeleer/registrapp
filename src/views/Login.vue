<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('login.title') }}</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">{{ $t('login.email') }}</label>
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
              <div class="mb-3">
                <label for="password" class="form-label">{{ $t('login.password') }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading || !emailValid">
                {{ loading ? $t('login.loggingIn') : $t('login.login') }}
              </button>
            </form>
            <div class="mt-3 text-center">
              <router-link to="/password-recovery" class="text-decoration-none">{{ $t('login.forgotPassword') }}</router-link>
            </div>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'
import { useEmailValidation } from '../composables/useEmailValidation'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const { emailValid, emailError } = useEmailValidation(email)

const handleLogin = async () => {
  email.value = email.value.trim()
  if (!emailValid.value) {
    error.value = t('common.invalidEmail')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (authError) throw authError
    // On success, redirect to intended location or activities
    const redirect = route.query.redirect as string || '/activities'
    router.push(redirect)
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