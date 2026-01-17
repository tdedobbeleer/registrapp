<template>
  <div>
    <div class="d-flex flex-column gap-2 mb-3">
      <div class="flex-fill">
        <label>{{ $t('data.dateRange') }}</label>
        <div class="d-flex gap-2">
          <BFormInput type="date" v-model="startDate" placeholder="{{$t('data.startDate')}}"/>
          <BFormInput type="date" v-model="endDate" placeholder="{{$t('data.endDate')}}"/>
        </div>
      </div>
    </div>
    <div class="mb-3">
      <BButton variant="secondary" @click="resetFilters" class="me-2">
        <i class="bi bi-arrow-clockwise"></i>
      </BButton>
    </div>
    <div class="table-responsive">
      <table id="activity-type-stats-table" class="table table-striped table-hover">
        <thead>
          <tr>
            <th>{{ $t('data.activityType') }}</th>
            <th>{{ $t('data.average') }}</th>
            <th>{{ $t('data.median') }}</th>
            <th>{{ $t('data.min') }}</th>
            <th>{{ $t('data.max') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in activityStats" :key="stat.name">
            <td>{{ stat.name }}</td>
            <td>{{ stat.average.toFixed(2) }}</td>
            <td>{{ stat.median.toFixed(2) }}</td>
            <td>{{ stat.min }}</td>
            <td>{{ stat.max }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BFormInput, BButton } from 'bootstrap-vue-next'
import { useApi } from '../composables/api'

const { registrations: apiRegistrations } = useApi()

const activityStats = ref<any[]>([])
const startDate = ref('')
const endDate = ref('')

const fetchStats = async () => {
  activityStats.value = await apiRegistrations.getActivityTypeStats(startDate.value || undefined, endDate.value || undefined)
}

const resetFilters = () => {
  startDate.value = ''
  endDate.value = ''
  fetchStats()
}

onMounted(async () => {
  await fetchStats()
})
</script>

<style scoped>
</style>