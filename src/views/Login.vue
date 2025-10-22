<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 p-3 bg-light">
    <BCard class="w-100" style="max-width: 400px;">
      <BCardHeader class="bg-primary text-white text-center">
        <BCardImg src="/logo.png" class="w-50"/>
      </BCardHeader>
      <BCardBody>
        <div class="text-center">
          <BSpinner
            label="Spinning"
            class="mx-1"
          />
        </div>
        <p class="text-muted mb-3">{{ $t('login.redirecting') }}</p>
        <BAlert v-if="errorMessage" variant="danger">
          {{ errorMessage }}
        </BAlert>
      </BCardBody>
    </BCard>
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
})
</script>
