<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">Home</BBreadcrumbItem>
      <BBreadcrumbItem to="/activities">Activities</BBreadcrumbItem>
      <BBreadcrumbItem active>Registrations</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>Registrations</h1>
    <div v-if="activity" class="mb-3">
      <h4>Activity: {{ getActivityTypeName(activity.activity_type_id) }} - {{ formatDate(activity.date) }}&nbsp;<BBadge variant="success">{{registrationCount}}</BBadge></h4>
    </div>
    <div class="list-group">
      <div
        v-for="participant in paginatedParticipants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ participant.first_name }} {{ participant.last_name }}</strong>
        </div>
        <BFormCheckbox
          switch
          size="lg"
          :checked="isRegistered(participant.id)"
          @change="toggleRegistration(participant.id, $event)"
        >
        </BFormCheckbox>
      </div>
    </div>
    <BPagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :total-rows="participants.length"
      :per-page="perPage"
      class="mt-3"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { Activity, Participant, Registration, ActivityType } from '../types'

interface Props {
  activityId: string
}

const props = defineProps<Props>()

const activity = ref<Activity | null>(null)
const activityTypes = ref<ActivityType[]>([])
const participants = ref<Participant[]>([])
const registrations = ref<Registration[]>([])
const currentPage = ref(1)
const perPage = 10

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return participants.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(participants.value.length / perPage))

const registrationCount = computed(() => {
  return registrations.value.filter(r => r.registration).length
})

const isRegistered = (participantId: string) => {
  return registrations.value.some(r => r.participant_id === participantId && r.registration)
}

const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const fetchActivity = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', props.activityId)
    .single()
  if (error) {
    console.error('Error fetching activity:', error)
  } else {
    activity.value = data
  }
}

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
    .order('last_name')
  if (error) {
    console.error('Error fetching participants:', error)
  } else {
    participants.value = data || []
  }
}

const fetchRegistrations = async () => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('activity_id', props.activityId)
  if (error) {
    console.error('Error fetching registrations:', error)
  } else {
    registrations.value = data || []
  }
}

const toggleRegistration = async (participantId: string, event) => {
  const existing = registrations.value.find(r => r.participant_id === participantId)
  const checked = event.srcElement.checked
  if (existing) {
    const { error } = await supabase
      .from('registrations')
      .update({ registration: checked })
      .eq('id', existing.id)
    if (error) {
      console.error('Error updating registration:', error)
    } else {
      existing.registration = checked
    }
  } else {
    const { data, error } = await supabase
      .from('registrations')
      .insert([{ participant_id: participantId, activity_id: props.activityId, registration: checked }])
      .select()
    if (error) {
      console.error('Error inserting registration:', error)
    } else if (data) {
      registrations.value.push(data[0])
    }
  }
}

onMounted(() => {
  fetchActivity()
  fetchActivityTypes()
  fetchParticipants()
  fetchRegistrations()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>