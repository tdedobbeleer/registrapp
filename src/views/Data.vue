<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('nav.data') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('data.title') }}</h1>
    <div class="mb-3">
      <BButtonGroup>
        <BFormSelect v-model="selectedActivityType" :options="activityTypeOptions" />
        <BFormInput type="date" v-model="startDate" placeholder="{{$t('data.startDate')}}"/>
        <BFormInput type="date" v-model="endDate" placeholder="{{$t('data.endDate')}}"/>
      </BButtonGroup>
    </div>
    <div class="mb-3">
      <BButton variant="primary" @click="exportCsv">
        <i class="bi bi-download"></i> {{ $t('data.exportCsv') }}
      </BButton>
    </div>
    <div class="table-responsive">
      <table id="data-table" class="table table-striped table-hover">
        <thead>
          <tr>
            <th v-for="field in fields" :key="field.key">{{ field.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedData" :key="item.first_name + item.last_name">
            <td v-for="field in fields" :key="field.key">
              <span v-if="field.key === 'first_name' || field.key === 'last_name'">{{ item[field.key] }}</span>
              <input v-else type="checkbox" :checked="item[field.key]" disabled />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BPagination
      v-model="currentPage"
      :total-rows="filteredData.length"
      :per-page="perPage"
      aria-controls="data-table"
    ></BPagination>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../supabase'
import type { ActivityType } from '../types'
import Papa from 'papaparse'

const { t } = useI18n()

interface TableItem {
  first_name: string
  last_name: string
  [key: string]: any
}

const activityTypes = ref<ActivityType[]>([])
const participants = ref<any[]>([])
const rawData = ref<any[]>([])
const selectedActivityType = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const activityTypeOptions = computed(() => [
  { value: '', text: t('data.filterByActivityType') },
  ...activityTypes.value.map(at => ({ value: at.id, text: at.name }))
])

const filteredActivities = computed(() => {
  let activities = rawData.value.map(reg => reg.activities).filter((act, index, self) => self.findIndex(a => a.id === act.id) === index); // unique activities
  if (selectedActivityType.value) {
    activities = activities.filter(act => act.activity_types.id === selectedActivityType.value);
  }
  if (startDate.value) {
    const start = new Date(startDate.value);
    activities = activities.filter(act => new Date(act.date) >= start);
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    activities = activities.filter(act => new Date(act.date) <= end);
  }
  return activities;
})

const fields = computed(() => [
  { key: 'first_name', label: t('data.firstName') },
  { key: 'last_name', label: t('data.lastName') },
  ...filteredActivities.value.map(act => ({ key: 'act_' + act.id, label: new Date(act.date).toLocaleDateString() }))
])

const filteredData = computed(() => {
  const acts = filteredActivities.value;
  return participants.value.map(part => {
    const item: TableItem = {
      first_name: part.first_name,
      last_name: part.last_name
    };
    acts.forEach(act => {
      item['act_' + act.id] = false;
    });
    // Check registrations
    rawData.value.forEach(reg => {
      if (reg.participants.id === part.id) {
        const actId = reg.activities.id;
        if (acts.find(act => act.id === actId)) {
          item['act_' + actId] = true;
        }
      }
    });
    return item;
  });
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredData.value.slice(start, end)
})

const fetchActivityTypes = async () => {
  const { data, error } = await supabase
    .from('activity_types')
    .select('*')
  if (error) {
    console.error('Error fetching activity types:', error)
  } else {
    activityTypes.value = data || []
  }
}

const fetchParticipants = async () => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
  if (error) {
    console.error('Error fetching participants:', error)
  } else {
    participants.value = data || []
  }
}

const fetchData = async () => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, activities(*, activity_types(*)), participants(*)')
  if (error) {
    console.error('Error fetching data:', error)
  } else {
    rawData.value = data || []
  }
}

const exportCsv = () => {
  const exportData = filteredData.value.map(item => {
    const newItem: any = {
      first_name: item.first_name,
      last_name: item.last_name
    };
    filteredActivities.value.forEach(act => {
      newItem[new Date(act.date).toLocaleDateString()] = item['act_' + act.id] ? 'TRUE' : 'FALSE';
    });
    return newItem;
  });
  const csv = Papa.unparse(exportData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'data.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchActivityTypes()
  fetchParticipants()
  fetchData()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>