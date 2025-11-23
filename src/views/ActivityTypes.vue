<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('activityTypes.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('activityTypes.title') }}</h1>
    <div v-if="loading" class="text-center">
      <BSpinner />
    </div>
    <div v-else>
    <div class="mb-3">
      <BInputGroup class="mt-3">
          <BFormInput type="text" v-model="searchTerm" :placeholder="$t('activityTypes.searchPlaceholder')" class="w-auto" />
          <BInputGroupText v-if="searchTerm" @click="searchTerm = ''" style="cursor: pointer;"><i class="bi bi-x"></i></BInputGroupText>
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
            :title="$t('common.edit')"
            @click="openEditModal(activityType)"
          >
            <i class="bi bi-pen"></i>
          </BButton>
          <BButton
            size="md"
            variant="outline-danger"
            :title="$t('common.delete')"
            @click="openDeleteModal(activityType.id)"
          >
            <i class="bi bi-trash"></i>
          </BButton>
          </BButtonGroup>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <BModal v-model="showAddModal" :title="$t('activityTypes.addActivityType')" @ok="addActivity" :ok-title="$t('activityTypes.addActivityType')" :cancel-title="$t('common.cancel')" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addActivity">
        <div class="mb-3">
          <label for="addName" class="form-label">{{ $t('activityTypes.name') }}</label>
          <BFormInput type="text" id="addName" v-model="newName" :state="!newNameError ? null : false" required />
          <BFormInvalidFeedback>{{ newNameError || $t('activityTypes.nameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addDescription" class="form-label">{{ $t('activityTypes.description') }}</label>
          <BFormTextarea id="addDescription" rows="3" v-model="newDescription" :state="!newDescriptionError ? null : false" required />
          <BFormInvalidFeedback>{{ newDescriptionError || $t('activityTypes.descriptionRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="$t('common.edit')" @ok.prevent="updateActivity" :ok-title="$t('common.edit')" :cancel-title="$t('common.cancel')" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateActivity">
        <div class="mb-3">
          <label for="editName" class="form-label">{{ $t('activityTypes.name') }}</label>
          <BFormInput type="text" id="editName" v-model="editName" :state="!editNameError ? null : false" required />
          <BFormInvalidFeedback>{{ editNameError || $t('activityTypes.nameRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editDescription" class="form-label">{{ $t('activityTypes.description') }}</label>
          <BFormTextarea type="text" id="editDescription" v-model="editDescription" :state="!editDescriptionError ? null : false" required />
          <BFormInvalidFeedback>{{ editDescriptionError || $t('activityTypes.descriptionRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('common.confirmDelete')" @ok="deleteActivity" :ok-title="$t('common.delete')" :cancel-title="$t('common.cancel')" ok-variant="danger">
      <p>{{ $t('activityTypes.deleteMessage') }}</p>
    </BModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ActivityType } from '../types'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'
import { useValidation } from '../composables/useValidation'

const { validateRequired, validateDescription } = useValidation()

const { activityTypes: apiActivityTypes } = useApi()

const activityTypes = ref<ActivityType[]>([])
const searchTerm = ref('')
const newName = ref('')
const newDescription = ref('')
const editName = ref('')
const editDescription = ref('')
const editingId = ref('')
const loading = ref(true)
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

const newNameError = validateRequired(newName, 'Name')
const newDescriptionError = validateDescription(newDescription)
const editNameError = validateRequired(editName, 'Name')
const editDescriptionError = validateDescription(editDescription)

const isAddFormValid = computed(() => !newNameError.value && !newDescriptionError.value)
const isEditFormValid = computed(() => !editNameError.value && !editDescriptionError.value)


const fetchActivityTypes = async () => {
  try {
    activityTypes.value = await apiActivityTypes.fetch()
    loading.value = false
  } catch (error) {
    console.error('Failed to fetch activity types:', error)
  }
}

const addActivity = async () => {
  if (!newName.value.trim() || !newDescription.value.trim()) return
  loading.value = true
  try {
    await apiActivityTypes.add(newName.value, newDescription.value)
    newName.value = ''
    newDescription.value = ''
    await fetchActivityTypes()
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to add activity type:', error)
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

/**
 * Updates the selected activity type with new name and description.
 * Performs validation, sets loading state, calls the API, refreshes the list on success,
 * and handles errors via global toast notifications.
 */
const updateActivity = async (): Promise<void> => {
  // Validate inputs to prevent invalid API calls
  if (!editName.value.trim() || !editDescription.value.trim() || !editingId.value.trim()) {
    return
  }

  loading.value = true
  try {
    // Perform the update operation
    await apiActivityTypes.update(editingId.value, editName.value, editDescription.value)

    // Refresh the activity types list to reflect changes
    await fetchActivityTypes()

    // Close the edit modal on successful update
    showEditModal.value = false
  } catch (error) {
    // Log error for debugging; global toast handling assumed
    console.error('Failed to update activity type:', error)
  } finally {
    // Ensure loading state is always reset
    loading.value = false
  }
}

const deleteActivity = async () => {
  try {
    await apiActivityTypes.delete(deleteId.value)
    await fetchActivityTypes()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to delete activity type:', error)
  }
}

onMounted(() => {
  fetchActivityTypes()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>