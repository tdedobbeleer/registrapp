<template>
  <div class="container mt-5">
    <BRow class="justify-content-center">
      <BCol md="6" lg="4" class="mb-4">
        <BCard class="text-center h-100">
          <BCardBody>
            <BCardTitle>{{ $t('unauthorized.accessTitle') }}</BCardTitle>
            <BCardText>{{ $t('unauthorized.accessDescription') }}</BCardText>
            <BButton variant="primary" @click="goHome">{{ $t('unauthorized.goHomeButton') }}</BButton>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* Additional styles if needed */
</style>