<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem to="/activities">{{ $t('nav.activities') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('nav.registrations') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('registrations.title') }}</h1>
    <div v-if="loading" class="text-center">
      <BSpinner />
    </div>
    <div v-else>
    <div v-if="activity" class="mb-3">
      <h4>{{ $t('registrations.activity') }}: {{ getActivityTypeName(activity.activity_type_id) }} - {{ formatDate(activity.date) }}&nbsp;<BBadge variant="success">{{registrationCount}}</BBadge></h4>
    </div>
    <div class="mb-3">
      <BInputGroup class="mt-3">
        <template #prepend>
          <BInputGroupText><i class="bi bi-search-heart"></i></BInputGroupText>
        </template>
        <BFormInput v-model="searchTerm" :placeholder="$t('registrations.filterPlaceholder')" ></BFormInput>
        <template #append>
          <BInputGroupText v-if="searchTerm" @click="searchTerm = ''" style="cursor: pointer;"><i class="bi bi-x"></i></BInputGroupText>
        </template>
      </BInputGroup>
    </div>
    <div class="mb-3 d-flex gap-2">
      <BDropdown :text="$t('registrations.sortBy')">
        <BDropdownItem @click="sortBy = 'first_name'">{{ $t('registrations.firstName') }}</BDropdownItem>
        <BDropdownItem @click="sortBy = 'last_name'">{{ $t('registrations.lastName') }}</BDropdownItem>
        <BDropdownItem @click="sortBy = 'registered'">{{ $t('registrations.registered') }}</BDropdownItem>
      </BDropdown>
      <BButton variant="primary" @click="openAddModal">
        <i class="bi bi-person-fill-add"></i> {{ $t('participants.addParticipant') }}
      </BButton>
    </div>
    <div class="list-group">
      <div
        v-for="participant in paginatedParticipants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong @click="openEditModal(participant)" style="cursor: pointer;">{{ participant.first_name }} <span class="text-uppercase">{{ participant.last_name }}</span></strong>
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
      :total-rows="filteredParticipants.length"
      :per-page="perPage"
      class="mt-3"
    />

    <ParticipantModal
      v-model="showModal"
      :mode="modalMode"
      :participant="editingParticipant"
      :activity-types="activityTypes"
      :activity-type-id="activity?.activity_type_id"
      @added="handleParticipantChange"
      @updated="handleParticipantChange"
      @activity-type-added="handleParticipantChange"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import type { Activity, Participant, Registration, ActivityType } from '../types'
import ParticipantModal from '../components/ParticipantModal.vue'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'
import { supabase } from '../supabase'

interface Props {
  activityId: string
}

const props = defineProps<Props>()

const { participants: apiParticipants, activities: apiActivities, activityTypes: apiActivityTypes, registrations: apiRegistrations } = useApi()

const activity = ref<Activity | null>(null)
const activityTypes = ref<ActivityType[]>([])
const participants = ref<Participant[]>([])
const registrations = ref<Registration[]>([])
const currentPage = ref(1)
const perPage = 10
const searchTerm = ref('')
const sortBy = ref('last_name')
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingParticipant = ref<Participant | null>(null)
const loading = ref(true)
let registrationChannel: any = null
let participantChannel: any = null

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredParticipants.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredParticipants.value.length / perPage))

const filteredParticipants = computed(() => {
  let filtered = participants.value
  if (searchTerm.value) {
    filtered = filtered.filter(p =>
      p.first_name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }
  return filtered.sort((a, b) => {
    if (sortBy.value === 'first_name') {
      return a.first_name.toLowerCase().localeCompare(b.first_name.toLowerCase())
    } else if (sortBy.value === 'last_name') {
      return a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase())
    } else if (sortBy.value === 'registered') {
      const aReg = isRegistered(a.id) ? 1 : 0
      const bReg = isRegistered(b.id) ? 1 : 0
      if (aReg !== bReg) return bReg - aReg // registered first
      return a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase()) // then by last name
    }
    return 0
  })
})

const registrationCount = computed(() => {
  return registrations.value.length
})

const isRegistered = (participantId: string) => {
  return registrations.value.some(r => r.participant_id === participantId)
}

const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
}

const fetchParticipantWithActivityTypes = async (participantId: string): Promise<Participant | null> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        participant_activity_types (
          activity_type_id
        )
      `)
      .eq('id', participantId)
      .single()

    if (error) {
      console.error('Error fetching participant with activity types:', error)
      return null
    }

    return {
      ...data,
      activity_types: (data.participant_activity_types || []).map((pat: any) => pat.activity_type_id)
    }
  } catch (error) {
    console.error('Error in fetchParticipantWithActivityTypes:', error)
    return null
  }
}


const fetchActivity = async () => {
  try {
    activity.value = await apiActivities.fetchOne(props.activityId)
  } catch (error) {
    console.error('Error fetching activity:', error)
  }
}

const fetchActivityTypes = async () => {
  try {
    activityTypes.value = await apiActivityTypes.fetch()
  } catch (error) {
    console.error('Error fetching activity types:', error)
  }
}

const fetchParticipants = async () => {
  try {
    participants.value = await apiParticipants.fetch(activity.value?.activity_type_id)
    loading.value = false
  } catch (error) {
    console.error('Error fetching participants:', error)
  }
}

const fetchRegistrations = async () => {
  try {
    registrations.value = await apiRegistrations.fetch(props.activityId)
    loading.value = false
  } catch (error) {
    console.error('Error fetching registrations:', error)
  }
}

const setupRealtimeSubscription = () => {
  registrationChannel = supabase
    .channel('registrations-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'registrations',
        filter: `activity_id=eq.${props.activityId}`
      },
      (payload) => {
        console.log('Realtime registration INSERT:', payload)
        handleRealtimeChange(payload)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'registrations',
        filter: `activity_id=eq.${props.activityId}`
      },
      (payload) => {
        console.log('Realtime registration DELETE:', payload)
        handleRealtimeChange(payload)
      }
    )
    .subscribe()

  participantChannel = supabase
    .channel('participants-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants'
      },
      (payload) => {
        console.log('Realtime participant change:', payload)
        handleParticipantRealtimeChange(payload)
      }
    )
    .subscribe()
}

const handleRealtimeChange = (payload: any) => {
  const { eventType, new: newRecord, old: oldRecord } = payload

  if (eventType === 'INSERT') {
    // Add new registration
    registrations.value.push(newRecord)
  } else if (eventType === 'DELETE') {
    // Remove deleted registration
    registrations.value = registrations.value.filter(r => r.participant_id !== oldRecord.participant_id || r.activity_id !== oldRecord.activity_id)
  }
}

const handleParticipantRealtimeChange = (payload: any) => {
  const { eventType, new: newRecord, old: oldRecord } = payload

  if (eventType === 'INSERT') {
    // For new participants, we need to fetch their activity types since they're not included in the realtime payload
    fetchParticipantWithActivityTypes(newRecord.id).then(participant => {
      if (participant && activity.value && participant.activity_types.includes(activity.value.activity_type_id)) {
        participants.value.push(participant)
      }
    }).catch(error => {
      console.error('Error fetching participant with activity types:', error)
    })
  } else if (eventType === 'DELETE') {
    // Remove deleted participant
    participants.value = participants.value.filter(p => p.id !== oldRecord.id)
  } else if (eventType === 'UPDATE') {
    // For updates, we need to fetch the updated activity types
    fetchParticipantWithActivityTypes(newRecord.id).then(participant => {
      if (participant) {
        const index = participants.value.findIndex(p => p.id === newRecord.id)
        if (index !== -1) {
          // Check if participant is still eligible for this activity
          if (activity.value && participant.activity_types.includes(activity.value.activity_type_id)) {
            participants.value[index] = participant
          } else {
            // Remove if no longer eligible
            participants.value.splice(index, 1)
          }
        } else {
          // Add if now eligible
          if (activity.value && participant.activity_types.includes(activity.value.activity_type_id)) {
            participants.value.push(participant)
          }
        }
      }
    }).catch(error => {
      console.error('Error fetching updated participant with activity types:', error)
    })
  }
}

const toggleRegistration = async (participantId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const isChecked = target.checked
  try {
    if (isChecked) {
      await apiRegistrations.add(participantId, props.activityId)
      // No need to manually update registrations.value as realtime will handle it
    } else {
      await apiRegistrations.delete(participantId, props.activityId)
      // No need to manually update registrations.value as realtime will handle it
    }
  } catch (error) {
    console.error('Error toggling registration:', error)
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  editingParticipant.value = null
  showModal.value = true
}

const openEditModal = (participant: Participant) => {
  modalMode.value = 'edit'
  editingParticipant.value = participant
  showModal.value = true
}

const handleParticipantChange = () => {
  loading.value = true;
  fetchParticipants()
}


onMounted(async () => {
  await fetchActivity()
  await fetchActivityTypes()
  await fetchParticipants()
  await fetchRegistrations()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (registrationChannel) {
    supabase.removeChannel(registrationChannel)
  }
  if (participantChannel) {
    supabase.removeChannel(participantChannel)
  }
})

watch(searchTerm, () => {
  currentPage.value = 1
})

watch(sortBy, () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Additional styles if needed */
</style>