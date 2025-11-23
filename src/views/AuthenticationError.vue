<template>
  <div class="container mt-5">
    <BRow>
      <BCol cols="12" class="text-center mb-5">
        <h1>{{ $t('publicError.title') }}</h1>
        <p class="lead">{{ $t('publicError.description') }}</p>
      </BCol>
    </BRow>
    <BRow class="justify-content-center">
      <BCol md="6" lg="4" class="mb-4">
        <BCard class="text-center h-100">
          <BCardBody>
            <BCardTitle>{{ $t('publicError.errorTitle') }}</BCardTitle>
            <BCardText>{{ $t('publicError.errorDescription') }}</BCardText>
            <BButton variant="primary" @click="handleLogin">{{ $t('publicError.tryAgainButton') }}</BButton>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>

<script setup lang="ts">
import { login } from '../auth0'
import { BRow, BCol, BCard, BCardBody, BCardTitle, BCardText, BButton } from 'bootstrap-vue-next'

const handleLogin = async () => {
  await login('/')
}
</script>

<style scoped>
/* Additional styles if needed */
</style>