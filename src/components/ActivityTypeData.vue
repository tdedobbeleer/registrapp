<template>
  <div>
    <div class="d-flex flex-column gap-2 mb-3">
      <div class="flex-fill">
        <BFormSelect v-model="selectedActivityType" :options="activityTypeOptions" />
      </div>
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
      <BButton variant="primary" @click="exportCsv">
        <i class="bi bi-download"></i> {{ $t('data.exportCsv') }}
      </BButton>
    </div>
    <div class="table-responsive">
      <table id="activity-type-data-table" class="table table-striped table-hover">
        <thead>
          <tr>
            <th>{{ $t('data.firstName') }}</th>
            <th>{{ $t('data.lastName') }}</th>
            <th>{{ $t('data.registrations') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedData" :key="item.first_name + item.last_name">
            <td>{{ item.first_name }}</td>
            <td>{{ item.last_name }}</td>
            <td>{{ item.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <BPagination
      v-model="currentPage"
      :total-rows="participantCounts.length"
      :per-page="perPage"
      aria-controls="activity-type-data-table"
    ></BPagination>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BFormSelect, BFormInput, BButton, BPagination } from 'bootstrap-vue-next'
import type { ActivityType } from '../types'
import Papa from 'papaparse'
import { useApi } from '../composables/api'

const { activityTypes: apiActivityTypes, participants: apiParticipants, data: apiData } = useApi()

const activityTypes = ref<ActivityType[]>([])
const participants = ref<any[]>([])
const registrations = ref<any[]>([])
const selectedActivityType = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const activityTypeOptions = computed(() => [
  ...activityTypes.value.map(at => ({ value: at.id, text: at.name }))
])

const filteredRegistrations = computed(() => {
  let regs = registrations.value
  if (selectedActivityType.value) {
    regs = regs.filter(reg => reg.activities.activity_types.id === selectedActivityType.value)
  }
  if (startDate.value) {
    const start = new Date(startDate.value)
    regs = regs.filter(reg => new Date(reg.activities.date) >= start)
  }
  if (endDate.value) {
    const end = new Date(endDate.value)
    regs = regs.filter(reg => new Date(reg.activities.date) <= end)
  }
  return regs
})

const participantCounts = computed(() => {
  return participants.value.map(part => {
    const count = filteredRegistrations.value.filter(reg => reg.participants.id === part.id).length
    return {
      first_name: part.first_name,
      last_name: part.last_name,
      count
    }
  }).filter(item => item.count > 0 || !selectedActivityType.value) // show all if no type selected, else only with counts
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return participantCounts.value.slice(start, end)
})

const fetchActivityTypes = async () => {
  activityTypes.value = await apiActivityTypes.fetch()
}

const fetchParticipants = async () => {
  participants.value = await apiParticipants.fetchAll()
}

const fetchRegistrations = async () => {
  registrations.value = await apiData.fetch()
}

const resetFilters = () => {
  selectedActivityType.value = activityTypes.value[0]?.id || ''
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

const exportCsv = () => {
  const csv = Papa.unparse(participantCounts.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'activity_type_data.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await fetchActivityTypes()
  selectedActivityType.value = activityTypes.value[0]?.id || ''
  await fetchParticipants()
  await fetchRegistrations()
})
</script>

<style scoped>
</style>