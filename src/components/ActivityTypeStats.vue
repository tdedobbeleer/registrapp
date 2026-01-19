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

    <!-- Stackline Chart for Attendance by Activity Type -->
    <div class="mb-4">
      <h3>{{ $t('data.attendanceTrend') }}</h3>
      <div class="chart-container" style="height: 400px;">
        <UiStackline
          v-if="chartDataset && chartDataset.length > 0 && chartDataset.every(serie => serie.data && serie.data.length > 0)"
          :dataset="chartDataset"
          :style="{ height: '100%' }"
        />
        <div v-else class="text-center py-4">
          <p>{{ $t('data.noAttendanceData') }}</p>
          <p v-if="attendanceData.length === 0">No registration data available</p>
          <p v-else>Data format issue - check console for details</p>
        </div>
      </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { BFormInput, BButton } from 'bootstrap-vue-next'
import { useApi } from '../composables/api'

const { registrations: apiRegistrations, data: apiData } = useApi()

const activityStats = ref<any[]>([])
const startDate = ref('')
const endDate = ref('')
const attendanceData = ref<any[]>([])

const fetchStats = async () => {
  activityStats.value = await apiRegistrations.getActivityTypeStats(startDate.value || undefined, endDate.value || undefined)
  await fetchAttendanceData()
}

const fetchAttendanceData = async () => {
  const data = await apiData.fetchAttendanceByDate()
  attendanceData.value = data
}

const chartDataset = computed(() => {
  // Group data by date and activity type
  const dateMap = new Map<string, Map<string, number>>()

  // Debug: Check if we have attendance data
  console.log('Attendance data:', attendanceData.value)

  attendanceData.value.forEach((registration: any) => {
    const date = registration.activities?.date
    const activityTypeName = registration.activities?.activity_types?.name

    if (date && activityTypeName) {
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map())
      }
      const activityMap = dateMap.get(date)!
      activityMap.set(activityTypeName, (activityMap.get(activityTypeName) || 0) + 1)
    }
  })

  // Convert to chart format for vue-data-ui
  const dataset: any[] = []
  const dates: string[] = []

  // Get all unique dates
  Array.from(dateMap.keys()).sort().forEach(date => {
    dates.push(date)
  })

  // Get all unique activity types
  const activityTypes = new Set<string>()
  dateMap.forEach(activityMap => {
    activityMap.forEach((value, key) => {
      activityTypes.add(key)
    })
  })

  // Create dataset for each activity type
  Array.from(activityTypes).forEach(activityType => {
    const data: any[] = []
    dates.forEach(date => {
      const count = dateMap.get(date)?.get(activityType) || 0
      data.push(count)
    })

    dataset.push({
      name: activityType,
      data: data
    })
  })

  // Debug: Check final dataset
  console.log('Chart dataset:', dataset)

  // Limit to last month by default if no date filters
  if (!startDate.value && !endDate.value && dates.length > 30) {
    const limitedDates = dates.slice(-30)
    const limitedDataset = dataset.map(serie => ({
      name: serie.name,
      data: serie.data.slice(-30)
    }))

    console.log('Limited dataset:', limitedDataset)
    return limitedDataset
  }

  return dataset.length > 0 ? dataset : []
})


const resetFilters = () => {
  startDate.value = ''
  endDate.value = ''
  fetchStats()
}

// Watch for date filter changes
watch([startDate, endDate], () => {
  fetchStats()
})

onMounted(async () => {
  await fetchStats()
})
</script>

<style scoped>
</style>