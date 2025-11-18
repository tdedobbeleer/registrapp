<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('participants.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('participants.title') }}</h1>
    <div v-if="loading" class="text-center">
      <BSpinner />
    </div>
    <div v-else>
    <div class="mb-3">
      <BInputGroup class="mt-3">
      <BDropdown variant="outline-secondary" class="me-2">
        <template #button-content>
          <i class="bi bi-filter"></i>
        </template>
        <BDropdownItem @click="filterRole = ''">{{ $t('participants.allRoles') }}</BDropdownItem>
        <BDropdownItem @click="filterRole = 'PHYSIOTHERAPIST'">{{ $t('participants.physiotherapist') }}</BDropdownItem>
        <BDropdownItem @click="filterRole = 'VOLUNTEER'">{{ $t('participants.volunteer') }}</BDropdownItem>
      </BDropdown>
      <BFormInput type="text" v-model="searchTerm" :placeholder="$t('participants.searchPlaceholder')" class="w-auto" />
      <BInputGroupText v-if="searchTerm" @click="searchTerm = ''" style="cursor: pointer;"><i class="bi bi-x"></i></BInputGroupText>
      <BButton
          variant="primary"
          @click="openAddModal"
        >
          <i class="bi bi-person-fill-add"></i>
        </BButton>
      </BInputGroup>
      <small class="text-muted">{{ $t('participants.filteringBy') }}: {{ filterRole === '' ? $t('participants.allRoles') : $t(`participants.${filterRole.toLowerCase()}`) }}</small>

    </div>
    <div class="list-group">
      <div
        v-for="participant in paginatedParticipants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-1">
          <strong>{{ participant.first_name }} <span class="text-uppercase">{{ participant.last_name }}</span></strong>
          <br />
          <div v-if="participant.participant_role">
            <small class="text-muted">{{ $t('participants.role') }}: {{$t(`participants.${participant.participant_role.toLowerCase()}`)}}</small>
          </div>
        </div>
        <div>
          <BButtonGroup>
            <BButton
              size="md"
              :title="$t('participants.edit')"
              variant="outline-secondary"
              @click="openEditModal(participant)"
            >
              <i class="bi bi-pen"></i>
            </BButton>
            <BButton
              :title="$t('participants.delete')"
              size="md"
              variant="outline-danger"
              @click="openDeleteModal(participant.id)"
            >
              <i class="bi bi-trash"></i>
            </BButton>
          </BButtonGroup>
        </div>
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
      :activityTypes="activityTypes"
      @added="handleParticipantChange"
      @updated="handleParticipantChange"
    />

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('participants.confirmDelete')" @ok="deleteParticipant" :ok-title="$t('participants.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('participants.deleteMessage') }}</p>
      <p v-if="hasRegistrations" class="text-warning fw-bold">{{ $t('participants.deleteWarning') }}</p>
    </BModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Participant, ActivityType } from '../types'
import ParticipantModal from '../components/ParticipantModal.vue'
import { useApi } from '../composables/api'

useI18n()
const { participants: apiParticipants, activityTypes: apiActivityTypes, registrations: apiRegistrations } = useApi()

const participants = ref<Participant[]>([])
const activityTypes = ref<ActivityType[]>([])
const searchTerm = ref('')
const filterRole = ref('')
const editingId = ref('')
const loading = ref(true)
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingParticipant = ref<Participant | null>(null)
const showDeleteModal = ref(false)
const deleteId = ref('')
const hasRegistrations = ref(false)
const currentPage = ref(1)
const perPage = 10


const filteredParticipants = computed(() =>
  participants.value.filter(participant =>
    `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
    (filterRole.value === '' || participant.participant_role === filterRole.value)
  )
)

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredParticipants.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredParticipants.value.length / perPage))

const openAddModal = () => {
  modalMode.value = 'add'
  editingParticipant.value = null
  showModal.value = true
}

const openEditModal = (participant: Participant) => {
  modalMode.value = 'edit'
  editingParticipant.value = participant
  editingId.value = participant.id
  showModal.value = true
}

const handleParticipantChange = () => {
  loading.value = true;
  fetchParticipants()
}


const fetchParticipants = async () => {
  try {
    participants.value = await apiParticipants.fetch()
    loading.value = false
  } catch (error) {
    console.error('Error fetching participants:', error)
  }
}

const fetchActivityTypes = async () => {
  try {
    activityTypes.value = await apiActivityTypes.fetch()
  } catch (error) {
    console.error('Error fetching activity types:', error)
  }
}


const openDeleteModal = async (id: string) => {
  deleteId.value = id
  // Check if participant has registrations
  try {
    const registrations = await apiRegistrations.fetchByParticipant(id)
    hasRegistrations.value = registrations.length > 0
  } catch (error) {
    console.error('Error checking registrations:', error)
    hasRegistrations.value = false
  }
  showDeleteModal.value = true
}


const deleteParticipant = async () => {
  try {
    await apiParticipants.delete(deleteId.value)
    await fetchParticipants()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error deleting participant:', error)
  }
}

onMounted(() => {
  fetchParticipants()
  fetchActivityTypes()
})

watch(searchTerm, () => {
  currentPage.value = 1
})

watch(filterRole, () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Additional styles if needed */
</style>