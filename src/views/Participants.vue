<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('participants.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('participants.title') }}</h1>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="col d-flex p-1 align-items-center">
        <BFormInput type="text" v-model="searchTerm" :placeholder="$t('participants.searchPlaceholder')" class="w-auto" />
      </div>
      <div class="col">
        <BButton
          variant="primary"
          @click="showAddModal = true"
        >
          <i class="bi bi-person-fill-add"></i>
        </BButton>
      </div>
    </div>
    <div class="list-group">
      <div
        v-for="participant in filteredParticipants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-1">
          <strong>{{ participant.first_name }} {{ participant.last_name }}</strong>
          <br />
          <small class="text-muted">{{ formatDate(participant.created_at) }}</small>
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

    <!-- Add Modal -->
    <BModal v-model="showAddModal" :title="$t('participants.addParticipant')" @ok="addParticipant" :ok-title="$t('participants.addParticipant')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addParticipant">
        <div class="mb-3">
          <label for="addFirstName" class="form-label">{{ $t('participants.firstName') }}</label>
          <BFormInput type="text" id="addFirstName" v-model="newFirstName" :state="newFirstName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('participants.firstNameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addLastName" class="form-label">{{ $t('participants.lastName') }}</label>
          <BFormInput type="text" id="addLastName" v-model="newLastName" :state="newLastName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('participants.lastNameRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="$t('participants.editParticipant')" @ok.prevent="updateParticipant" :ok-title="$t('participants.edit')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateParticipant">
        <div class="mb-3">
          <label for="editFirstName" class="form-label">{{ $t('participants.firstName') }}</label>
          <BFormInput type="text" id="editFirstName" v-model="editFirstName" :state="editFirstName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('participants.firstNameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editLastName" class="form-label">{{ $t('participants.lastName') }}</label>
          <BFormInput type="text" id="editLastName" v-model="editLastName" :state="editLastName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('participants.lastNameRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('participants.confirmDelete')" @ok="deleteParticipant" :ok-title="$t('participants.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('participants.deleteMessage') }}</p>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { Participant } from '../types'

const participants = ref<Participant[]>([])
const searchTerm = ref('')
const newFirstName = ref('')
const newLastName = ref('')
const editFirstName = ref('')
const editLastName = ref('')
const editingId = ref('')
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')

const filteredParticipants = computed(() =>
  participants.value.filter(participant =>
    `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

const isAddFormValid = computed(() => newFirstName.value.trim() && newLastName.value.trim())
const isEditFormValid = computed(() => editFirstName.value.trim() && editLastName.value.trim())

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const fetchParticipants = async () => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching participants:', error)
  } else {
    participants.value = data || []
  }
}

const addParticipant = async () => {
  if (!newFirstName.value.trim() || !newLastName.value.trim()) return
  loading.value = true
  const { error } = await supabase
    .from('participants')
    .insert([{ first_name: newFirstName.value, last_name: newLastName.value }])
  if (error) {
    console.error('Error adding participant:', error)
  } else {
    newFirstName.value = ''
    newLastName.value = ''
    fetchParticipants()
    showAddModal.value = false
  }
  loading.value = false
}

const openEditModal = (participant: Participant) => {
  editingId.value = participant.id
  editFirstName.value = participant.first_name
  editLastName.value = participant.last_name
  showEditModal.value = true
}

const openDeleteModal = (id: string) => {
  deleteId.value = id
  showDeleteModal.value = true
}

const updateParticipant = async () => {
  if (!editFirstName.value.trim() || !editLastName.value.trim()) return
  loading.value = true
  const { error } = await supabase
    .from('participants')
    .update({ first_name: editFirstName.value, last_name: editLastName.value })
    .eq('id', editingId.value)
  if (error) {
    console.error('Error updating participant:', error)
  } else {
    fetchParticipants()
    showEditModal.value = false
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
</script>

<style scoped>
/* Additional styles if needed */
</style>