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
        <BAlert v-if="error" variant="danger">
          {{ error }}
        </BAlert>
      </BCardBody>
    </BCard>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { login } from '../auth0'

const route = useRoute()
const error = ref('')

onMounted(async () => {
  try {
    const redirectPath = (route.query.redirect as string) || '/'
    await login(redirectPath)
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  }
})

</script>
