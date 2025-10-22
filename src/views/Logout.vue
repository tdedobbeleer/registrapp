<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 p-3 bg-light">
    <BCard class="w-100" style="max-width: 400px;">
      <BCardHeader class="bg-success text-white text-center">
        <BCardImg src="/logo.png" class="w-50"/>
      </BCardHeader>
      <BCardBody class="text-center">
        <p class="mb-3">{{ $t('logout.message') }}</p>
        <BButton
          @click="handleLogin"
          variant="primary"
          class="w-100"
        >
          {{ $t('logout.loginAgain') }}
        </BButton>
      </BCardBody>
    </BCard>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { login } from '../auth0'
import { BCard, BCardHeader, BCardBody, BButton } from 'bootstrap-vue-next'

const router = useRouter()

const handleLogin = async () => {
  await login('/')
}
</script>