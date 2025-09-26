<template>
  <div class="container mt-5 text-center">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>404</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('notFound.title') }}</h1>
    <p>{{ $t('notFound.message') }}</p>
    <BButton variant="primary" to="/">{{ $t('notFound.goHome') }}</BButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
/* Additional styles if needed */
</style>