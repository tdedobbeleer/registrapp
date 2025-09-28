<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3>{{ $t('login.title') }}</h3>
          </div>
          <div class="card-body">
              <div class="text-center">
                <button @click="handleLogin" class="btn btn-primary w-100" :disabled="loading">
                  {{ loading ? $t('login.loggingIn') : $t('login.login') }}
                </button>
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
import { login } from '../auth0'

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await login()
  } catch (err: any) {
    error.value = err.message || 'Login failed'
    loading.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>