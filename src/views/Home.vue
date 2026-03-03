<template>
  <div class="container mt-3">
    <h1 class="text-center">{{ $t('dashboard.title') }}</h1>

    <!-- Changelog Section -->
    <div class="mb-4">
      <h2>{{ $t('dashboard.changelog') }}</h2>
      <BCard>
        <BCardBody>
          <ul v-if="changelogItems.length > 0" class="list-unstyled mb-0">
            <li v-for="(item, index) in displayedChangelog" :key="index" class="mb-2">
              <i class="bi bi-rocket-takeoff text-primary"></i>
              <span class="ms-2">{{ item.date }}</span>
              <span class="ms-2">{{ $t(item.key) }}</span>
            </li>
          </ul>
          <p v-else class="mb-0 text-muted">{{ $t('dashboard.noChangelog') }}</p>
          <div v-if="changelogItems.length > 5" class="mt-3">
            <BButton variant="link" @click="showAll = !showAll">
              {{ showAll ? $t('dashboard.showLess') : $t('dashboard.showMore') }}
            </BButton>
          </div>
        </BCardBody>
      </BCard>
    </div>
    <!-- Warnings Section -->
    <div class="mb-4">
      <h2>{{ $t('dashboard.warnings') }}</h2>
      <BRow>
        <BCol md="4" class="mb-3 mb-md-0">
          <BCard class="h-100 border-danger">
            <BCardTitle>{{ $t('dashboard.duplicateParticipants') }}&nbsp;<i class="bi bi-union"></i></BCardTitle>
            <BCardText>
              <ul v-if="duplicates.length > 0" class="list-unstyled">
                <li v-for="dup in duplicates" :key="dup.first_name + dup.last_name">
                  <router-link :to="{ path: '/merge-participants', query: { ids: dup.ids.join(',') } }" class="text-decoration-none">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    {{ dup.first_name }} {{ dup.last_name }} ({{ dup.count }} {{ $t('dashboard.times') }})
                  </router-link>
                </li>
              </ul>
              <p v-else>{{ $t('dashboard.noDuplicatesFound') }}</p>
            </BCardText>
          </BCard>
        </BCol>
        <BCol md="4" class="mb-3 mb-md-0">
          <BCard class="h-100 border-warning">
            <BCardTitle>{{ $t('dashboard.similarParticipants') }}&nbsp;<i class="bi bi-intersect"></i></BCardTitle>
            <BCardText>
              <ul v-if="similarParticipants.length > 0" class="list-unstyled">
                <li v-for="sim in similarParticipants" :key="sim.name">
                  <router-link :to="{ path: '/merge-participants', query: { ids: sim.ids.join(',') } }" class="text-decoration-none">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    {{ sim.names.join(', ') }}
                  </router-link>
                </li>
              </ul>
              <p v-else>{{ $t('dashboard.noSimilarParticipantsFound') }}</p>
            </BCardText>
          </BCard>
        </BCol>
        <BCol md="4">
          <BCard class="h-100 border-secondary">
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
import { ref, onMounted, computed } from 'vue'
import { BRow, BCol, BCard, BCardTitle, BCardText, BCardBody, BButton } from 'bootstrap-vue-next'
import { useApi } from '../composables/api'

const { dashboard } = useApi()

const duplicates = ref<{ first_name: string, last_name: string, count: number, ids: string[] }[]>([])
const rawSimilarParticipants = ref<{ name: string, names: string[], ids: string[] }[]>([])
const emptyActivities = ref<any[]>([])
const totalActivitiesThisYear = ref(0)
const totalParticipantsLastWeek = ref(0)
const totalParticipants = ref(0)
const totalRegistrationsThisYear = ref(0)
const showAll = ref(false)

// Changelog data
const changelogItems = ref([
  { date: '2026-03-03', key: 'changelog.frequencySort' },
  { date: '2026-03-03', key: 'changelog.change1' },
])

const displayedChangelog = computed(() => {
  return showAll.value ? changelogItems.value : changelogItems.value.slice(0, 5)
})

// Filter out exact duplicates from similar participants
const similarParticipants = computed(() => {
  // Build a set of exact duplicate name keys (firstName_lastName in lowercase)
  const duplicateKeys = new Set(
    duplicates.value.map(d => `${d.first_name.toLowerCase()}_${d.last_name.toLowerCase()}`)
  )
  
  // Filter out groups where all names in the group are exact duplicates
  return rawSimilarParticipants.value.filter(group => {
    // Check if all names in this group match an exact duplicate
    const allNamesExactMatch = group.names.every(name => {
      const [firstName, lastName] = name.split(' ')
      return firstName && lastName && duplicateKeys.has(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`)
    })
    return !allNamesExactMatch
  })
})

onMounted(async () => {
  duplicates.value = await dashboard.findDuplicateParticipants()
  rawSimilarParticipants.value = await dashboard.findSimilarParticipantNames()
  emptyActivities.value = await dashboard.findEmptyOldActivities()
  totalActivitiesThisYear.value = await dashboard.getTotalActivitiesThisYear()
  totalParticipantsLastWeek.value = await dashboard.getTotalParticipantsLastWeek()
  totalParticipants.value = await dashboard.getTotalParticipants()
  totalRegistrationsThisYear.value = await dashboard.getTotalRegistrationsThisYear()
})
</script>

<style scoped>
</style>