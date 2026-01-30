<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('nav.data') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1 class="text-center">{{ $t('data.participantData') }}</h1>
    <ParticipantData />
  </div>
</template>

<script setup lang="ts">
import { BBreadcrumb, BBreadcrumbItem } from 'bootstrap-vue-next'
import ParticipantData from '../components/ParticipantData.vue'
</script>
