<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">Home</BBreadcrumbItem>
      <BBreadcrumbItem active>Activity Types</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>Activity Types</h1>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-3 align-items-center">
        <input
          type="text"
          class="form-control w-50"
          placeholder="Search activity types..."
          v-model="searchTerm"
        />
      </div>
      <BButton
        variant="primary"
        @click="showAddModal = true"
      >
        Add Activity Type
      </BButton>
    </div>
    <div class="list-group">
      <div
        v-for="activityType in filteredActivityTypes"
        :key="activityType.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ activityType.name }}</strong>
          <br />
          <small class="text-muted">{{ formatDate(activityType.created_at) }}</small>
        </div>
        <div>
          <p>{{ activityType.description }}</p>
        </div>
        <div>
          <BButton
            size="sm"
            variant="outline-secondary"
            class="me-2"
            @click="openEditModal(activityType)"
          >
            Edit
          </BButton>
          <BButton
            size="sm"
            variant="outline-danger"
            @click="openDeleteModal(activityType.id)"
          >
            Delete
          </BButton>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <BModal v-model="showAddModal" title="Add Activity Type" @ok="addActivity" ok-title="Add" cancel-title="Cancel" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addActivity">
        <div class="mb-3">
          <label for="addName" class="form-label">Name</label>
          <BFormInput type="text" id="addName" v-model="newName" :state="newName.trim() ? null : false" required />
          <BFormInvalidFeedback>Name is required</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addDescription" class="form-label">Description</label>
          <BFormInput type="text" id="addDescription" rows="3" v-model="newDescription" :state="newDescription.trim() ? null : false" required />
          <BFormInvalidFeedback>Description is required</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" title="Edit Activity Type" @ok.prevent="updateActivity" ok-title="Update" cancel-title="Cancel" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateActivity">
        <div class="mb-3">
          <label for="editName" class="form-label">Name</label>
          <BFormInput type="text" id="editName" v-model="editName" :state="editName.trim() ? null : false" required />
          <BFormInvalidFeedback>Name is required</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editDescription" class="form-label">Description</label>
          <BFormInput type="text" id="editDescription" v-model="editDescription" :state="editDescription.trim() ? null : false" required />
          <BFormInvalidFeedback>Description is required</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" title="Confirm Delete" @ok="deleteActivity" ok-title="Delete" cancel-title="Cancel" ok-variant="danger">
      <p>Do you want to remove the activity type?</p>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { ActivityType } from '../types'

const activityTypes = ref<ActivityType[]>([])
const searchTerm = ref('')
const newName = ref('')
const newDescription = ref('')
const editName = ref('')
const editDescription = ref('')
const editingId = ref('')
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')

const filteredActivityTypes = computed(() =>
  activityTypes.value.filter(activityType =>
    activityType.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    activityType.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

const isAddFormValid = computed(() => newName.value.trim() && newDescription.value.trim())
const isEditFormValid = computed(() => editName.value.trim() && editDescription.value.trim())

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const fetchActivities = async () => {
  const { data, error } = await supabase
    .from('activity_types')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching activity types:', error)
  } else {
    activityTypes.value = data || []
  }
}

const addActivity = async () => {
  if (!newName.value.trim() || !newDescription.value.trim()) return
  loading.value = true
  const { error } = await supabase
    .from('activity_types')
    .insert([{ name: newName.value, description: newDescription.value }])
  if (error) {
    console.error('Error adding activity:', error)
  } else {
    newName.value = ''
    newDescription.value = ''
    fetchActivities()
    showAddModal.value = false
  }
  loading.value = false
}

const openEditModal = (activityType: ActivityType) => {
  editingId.value = activityType.id
  editName.value = activityType.name
  editDescription.value = activityType.description
  showEditModal.value = true
}

const openDeleteModal = (id: string) => {
  deleteId.value = id
  showDeleteModal.value = true
}

const updateActivity = async () => {
  if (!editName.value.trim() || !editDescription.value.trim()) return
  loading.value = true
  const { error } = await supabase
    .from('activity_types')
    .update({ name: editName.value, description: editDescription.value })
    .eq('id', editingId.value)
  if (error) {
    console.error('Error updating activity:', error)
  } else {
    fetchActivities()
    showEditModal.value = false
  }
  loading.value = false
}

const deleteActivity = async () => {
  const { error } = await supabase
    .from('activity_types')
    .delete()
    .eq('id', deleteId.value)
  if (error) {
    console.error('Error deleting activity:', error)
  } else {
    fetchActivities()
    showDeleteModal.value = false
  }
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>