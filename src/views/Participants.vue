<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('participants.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('participants.title') }}</h1>
    <div class="mb-3">
      <BInputGroup class="mt-3">
      <BFormInput type="text" v-model="searchTerm" :placeholder="$t('participants.searchPlaceholder')" class="w-auto" />
      <BButton
          variant="primary"
          @click="openAddModal"
        >
          <i class="bi bi-person-fill-add"></i>
        </BButton>
      </BInputGroup>
      
    </div>
    <div class="list-group">
      <div
        v-for="participant in paginatedParticipants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-1">
          <strong>{{ participant.first_name }} {{ participant.last_name }}</strong>
          <br />
          <small class="text-muted">{{ $t('common.changed') }}: {{ formatDate(participant.created_at) }}</small>
        </div>
        <div>
          <BButtonGroup>
            <BButton
              size="sm"
              :title="$t('participants.edit')"
              variant="outline-secondary"
              @click="openEditModal(participant)"
            >
              <i class="bi bi-pen"></i>
            </BButton>
            <BButton
              :title="$t('participants.delete')"
              size="sm"
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
      :loading="loading"
      @submit="handleModalSubmit"
    />

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('participants.confirmDelete')" @ok="deleteParticipant" :ok-title="$t('participants.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('participants.deleteMessage') }}</p>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import type { Participant } from '../types'
import ParticipantModal from '../components/ParticipantModal.vue'

const participants = ref<Participant[]>([])
const searchTerm = ref('')
const editingId = ref('')
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingParticipant = ref<Participant | null>(null)
const showDeleteModal = ref(false)
const deleteId = ref('')
const currentPage = ref(1)
const perPage = 10

const filteredParticipants = computed(() =>
  participants.value.filter(participant =>
    `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.value.toLowerCase())
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

const handleModalSubmit = async (data: { firstName: string; lastName: string }) => {
  if (modalMode.value === 'add') {
    await addParticipant(data.firstName, data.lastName)
  } else {
    await updateParticipant(data.firstName, data.lastName)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const fetchParticipants = async () => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('first_name', { ascending: true })
  if (error) {
    console.error('Error fetching participants:', error)
  } else {
    participants.value = data || []
  }
}

const addParticipant = async (firstName: string, lastName: string) => {
  loading.value = true
  const { error } = await supabase
    .from('participants')
    .insert([{ first_name: firstName, last_name: lastName }])
  if (error) {
    console.error('Error adding participant:', error)
  } else {
    fetchParticipants()
    showModal.value = false
  }
  loading.value = false
}

const openDeleteModal = (id: string) => {
  deleteId.value = id
  showDeleteModal.value = true
}

const updateParticipant = async (firstName: string, lastName: string) => {
  loading.value = true
  const { error } = await supabase
    .from('participants')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', editingId.value)
  if (error) {
    console.error('Error updating participant:', error)
  } else {
    fetchParticipants()
    showModal.value = false
  }
  loading.value = false
}

const deleteParticipant = async () => {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', deleteId.value)
  if (error) {
    console.error('Error deleting participant:', error)
  } else {
    fetchParticipants()
    showDeleteModal.value = false
  }
}

onMounted(() => {
  fetchParticipants()
})

watch(searchTerm, () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Additional styles if needed */
</style>