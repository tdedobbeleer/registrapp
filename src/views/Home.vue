<template>
  <div class="container mt-3">
    <h1 class="text-center">{{ $t('dashboard.title') }}</h1>

    <!-- Warnings Section -->
    <div class="mb-4">
      <h2>{{ $t('dashboard.warnings') }}</h2>
      <BRow>
        <BCol md="6">
          <BCard class="h-100 border-danger">
            <BCardTitle>{{ $t('dashboard.duplicateParticipants') }}</BCardTitle>
            <BCardText>
              <ul v-if="duplicates.length > 0" class="list-unstyled">
                <li v-for="dup in duplicates" :key="dup.first_name + dup.last_name">
                  <i class="bi bi-exclamation-triangle text-warning"></i>
                  {{ dup.first_name }} {{ dup.last_name }} ({{ dup.count }} {{ $t('dashboard.times') }})
                </li>
              </ul>
              <p v-else>{{ $t('dashboard.noDuplicatesFound') }}</p>
            </BCardText>
          </BCard>
        </BCol>
        <BCol md="6">
          <BCard class="h-100 border-warning">
            <BCardTitle>{{ $t('dashboard.emptyOldActivities') }}</BCardTitle>
            <BCardText>
              <ul v-if="emptyActivities.length > 0" class="list-unstyled">
                <li v-for="act in emptyActivities" :key="act.id">
                  <a :href="`/activities?date=${new Date(act.date).toISOString().split('T')[0]}`" target="_blank" class="text-decoration-none">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    {{ act.activity_types?.name }} {{ $t('dashboard.on') }} {{ new Date(act.date).toLocaleDateString() }}
                  </a>
                </li>
              </ul>
              <p v-else>{{ $t('dashboard.noEmptyOldActivitiesFound') }}</p>
            </BCardText>
          </BCard>
        </BCol>
      </BRow>
    </div>

    <!-- Gauges Section -->
    <div>
      <h2>{{ $t('dashboard.gauges') }}</h2>
      <BRow>
        <BCol md="3" sm="6" class="mb-3">
          <BCard class="text-center h-100" bg-variant="primary" text-variant="white">
            <BCardBody>
              <div class="h1">{{ totalActivitiesThisYear }}</div>
              <p>{{ $t('dashboard.totalActivitiesThisYear') }}</p>
            </BCardBody>
          </BCard>
        </BCol>
        <BCol md="3" sm="6" class="mb-3">
          <BCard class="text-center h-100" bg-variant="success" text-variant="white">
            <BCardBody>
              <div class="h1">{{ totalRegistrationsThisYear }}</div>
              <p>{{ $t('dashboard.totalRegistrationsThisYear') }}</p>
            </BCardBody>
          </BCard>
        </BCol>
        <BCol md="3" sm="6" class="mb-3">
          <BCard class="text-center h-100" bg-variant="info" text-variant="white">
            <BCardBody>
              <div class="h1">{{ totalParticipantsLastWeek }}</div>
              <p>{{ $t('dashboard.totalParticipantsLastWeek') }}</p>
            </BCardBody>
          </BCard>
        </BCol>
        <BCol md="3" sm="6" class="mb-3">
          <BCard class="text-center h-100" bg-variant="warning" text-variant="dark">
            <BCardBody>
              <div class="h1">{{ totalParticipants }}</div>
              <p>{{ $t('dashboard.totalParticipants') }}</p>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BRow, BCol, BCard, BCardTitle, BCardText, BCardBody } from 'bootstrap-vue-next'
import { useApi } from '../composables/api'

const { dashboard } = useApi()

const duplicates = ref<{ first_name: string, last_name: string, count: number }[]>([])
const emptyActivities = ref<any[]>([])
const totalActivitiesThisYear = ref(0)
const totalParticipantsLastWeek = ref(0)
const totalParticipants = ref(0)
const totalRegistrationsThisYear = ref(0)

onMounted(async () => {
  duplicates.value = await dashboard.findDuplicateParticipants()
  emptyActivities.value = await dashboard.findEmptyOldActivities()
  totalActivitiesThisYear.value = await dashboard.getTotalActivitiesThisYear()
  totalParticipantsLastWeek.value = await dashboard.getTotalParticipantsLastWeek()
  totalParticipants.value = await dashboard.getTotalParticipants()
  totalRegistrationsThisYear.value = await dashboard.getTotalRegistrationsThisYear()
})
</script>

<style scoped>
</style>