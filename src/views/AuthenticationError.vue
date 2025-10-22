<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12 text-center mb-5">
        <h1>{{ $t('publicError.title') }}</h1>
        <p class="lead">{{ $t('publicError.description') }}</p>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4 mb-4">
        <BCard class="text-center h-100">
          <BCardBody>
            <BCardTitle>{{ $t('publicError.errorTitle') }}</BCardTitle>
            <BCardText>{{ $t('publicError.errorDescription') }}</BCardText>
            <BButton variant="primary" @click="handleLogin">{{ $t('publicError.tryAgainButton') }}</BButton>
          </BCardBody>
        </BCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login } from '../auth0'
import { BCard, BCardBody, BCardTitle, BCardText, BButton } from 'bootstrap-vue-next'

const handleLogin = async () => {
  await login('/')
}
</script>

<style scoped>
/* Additional styles if needed */
</style>