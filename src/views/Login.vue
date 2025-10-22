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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { login, isAuthenticated } from '../auth0'
import { BCard, BCardHeader, BCardBody, BAlert, BSpinner, BCardImg } from 'bootstrap-vue-next'

// Setup i18n and router
const { t } = useI18n()
const router = useRouter()

// Reactive state
const errorMessage = ref('')

onMounted(async () => {
  try {
    const authenticated = await isAuthenticated()
    if (authenticated) {
      // If already authenticated, redirect to home
      router.push('/')
    } else {
      // If not authenticated, redirect to Auth0
      const redirectPath = router.currentRoute.value.query.redirect as string || '/'
      await login(redirectPath)
    }
  } catch (error: unknown) {
    console.error('Authentication check error:', error)
    errorMessage.value = error instanceof Error
      ? error.message
      : t('login.error.generic')
  }
})
</script>
