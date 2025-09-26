<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('activityTypes.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('activityTypes.title') }}</h1>
    <div class="mb-3">
      <BInputGroup class="mt-3">
          <BFormInput type="text" v-model="searchTerm" :placeholder="$t('activityTypes.searchPlaceholder')" class="w-auto" />
          <BButton
          variant="primary"
          @click="showAddModal = true"
        >
          <i class="bi bi-patch-plus"></i>
        </BButton>
      </BInputGroup>
    </div>
    <div class="list-group">
      <div
        v-for="activityType in filteredActivityTypes"
        :key="activityType.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-2">
          <strong>{{ activityType.name }}</strong>
          <br />
          <small class="text-muted">{{ $t('common.changed') }}: {{ formatDate(activityType.created_at) }}</small>
        </div>
        <div class="p-2">
          <p>{{ activityType.description }}</p>
        </div>
        <div class="p-2">
          <BButtonGroup>
          <BButton
            size="md"
            variant="outline-secondary"
            :title="$t('activityTypes.edit')"
            @click="openEditModal(activityType)"
          >
            <i class="bi bi-pen"></i>
          </BButton>
          <BButton
            size="md"
            variant="outline-danger"
            :title="$t('activityTypes.remove')"
            @click="openDeleteModal(activityType.id)"
          >
            <i class="bi bi-trash"></i>
          </BButton>
          </BButtonGroup>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <BModal v-model="showAddModal" :title="$t('activityTypes.addActivityType')" @ok="addActivity" :ok-title="$t('activityTypes.addActivityType')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addActivity">
        <div class="mb-3">
          <label for="addName" class="form-label">{{ $t('activityTypes.name') }}</label>
          <BFormInput type="text" id="addName" v-model="newName" :state="newName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activityTypes.nameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addDescription" class="form-label">{{ $t('activityTypes.description') }}</label>
          <BFormTextarea id="addDescription" rows="3" v-model="newDescription" :state="newDescription.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activityTypes.descriptionRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="$t('activityTypes.editActivityType')" @ok.prevent="updateActivity" :ok-title="$t('activityTypes.edit')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateActivity">
        <div class="mb-3">
          <label for="editName" class="form-label">{{ $t('activityTypes.name') }}</label>
          <BFormInput type="text" id="editName" v-model="editName" :state="editName.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activityTypes.nameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editDescription" class="form-label">{{ $t('activityTypes.description') }}</label>
          <BFormTextarea type="text" id="editDescription" v-model="editDescription" :state="editDescription.trim() ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activityTypes.descriptionRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('activityTypes.confirmDelete')" @ok="deleteActivity" :ok-title="$t('activityTypes.remove')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('activityTypes.deleteMessage') }}</p>
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