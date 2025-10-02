<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem to="/activities">{{ $t('nav.activities') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('nav.registrations') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('registrations.title') }}</h1>
    <div v-if="activity" class="mb-3">
      <h4>{{ $t('registrations.activity') }}: {{ getActivityTypeName(activity.activity_type_id) }} - {{ formatDate(activity.date) }}&nbsp;<BBadge variant="success">{{registrationCount}}</BBadge></h4>
    </div>
    <div class="mb-3">
      <BInputGroup class="mt-3">
        <template #prepend>
          <BInputGroupText><i class="bi bi-search-heart"></i></BInputGroupText>
        </template>
        <BFormInput v-model="searchTerm" :placeholder="$t('registrations.filterPlaceholder')" ></BFormInput>
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
      :loading="loading"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Activity, Participant, Registration, ActivityType } from '../types'
import ParticipantModal from '../components/ParticipantModal.vue'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'

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
const loading = ref(false)

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
  return registrations.value.filter(r => r.registration).length
})

const isRegistered = (participantId: string) => {
  return registrations.value.some(r => r.participant_id === participantId && r.registration)
}

const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
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
  } catch (error) {
    console.error('Error fetching participants:', error)
  }
}

const fetchRegistrations = async () => {
  try {
    registrations.value = await apiRegistrations.fetch(props.activityId)
  } catch (error) {
    console.error('Error fetching registrations:', error)
  }
}

const toggleRegistration = async (participantId: string, event : Event) => {
  const existing = registrations.value.find(r => r.participant_id === participantId)
  const el = event.target as HTMLInputElement
  const checked = el.checked
  try {
    if (existing) {
      await apiRegistrations.update(existing.id, checked)
      existing.registration = checked
    } else {
      const newReg = await apiRegistrations.add(participantId, props.activityId, checked)
      if (newReg) {
        registrations.value.push(newReg)
      }
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

const handleModalSubmit = async (data: { firstName: string; lastName: string; activityTypes?: string[] }) => {
  if (modalMode.value === 'add') {
    await addParticipant(data.firstName, data.lastName)
  } else if (editingParticipant.value) {
    await updateParticipant(editingParticipant.value.id, data.firstName, data.lastName)
  }
}

const addParticipant = async (firstName: string, lastName: string) => {
  loading.value = true
  try {
    await apiParticipants.add(firstName, lastName)
    await fetchParticipants()
    showModal.value = false
  } catch (error) {
    console.error('Error adding participant:', error)
  }
  loading.value = false
}

const updateParticipant = async (id: string, firstName: string, lastName: string) => {
  loading.value = true
  try {
    await apiParticipants.update(id, firstName, lastName)
    await fetchParticipants()
    showModal.value = false
  } catch (error) {
    console.error('Error updating participant:', error)
  }
  loading.value = false
}

onMounted(async () => {
  await fetchActivity()
  await fetchActivityTypes()
  await fetchParticipants()
  await fetchRegistrations()
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