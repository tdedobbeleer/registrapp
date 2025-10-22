<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('activities.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('activities.title') }}</h1>
    <div v-if="loading" class="text-center">
      <BSpinner />
    </div>
    <div v-else>
    <div class="mb-3">
      <BInputGroup class="mt-3">
        <BFormSelect v-model="filterActivityTypeId" :options="activityTypeOptions" :placeholder="$t('activities.filterByActivityType')" class="w-auto" />
        <BFormInput type="datetime-local" v-model="filterDate" :placeholder="$t('activities.filterByDate')" class="w-auto" />
        <BButton variant="primary" @click="showAddModal = true">
          <i class="bi bi-calendar-plus"></i>
        </BButton>
      </BInputGroup>
    </div>
    <div class="list-group">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="m-1 p-2 list-group-item d-flex justify-content-between align-items-center"
        :class="getActivityClass(activity)"
      >
        <div style="cursor: pointer;" @click="$router.push(`/registrations/${activity.id}`)" :title="$t('activities.registrations')">
          <strong>{{ getActivityTypeName(activity.activity_type_id) }}</strong>
          <br />
          <p><i class="bi bi-calendar-event"></i> {{ formatDate(activity.date) }}</p>
        </div>
        <div>
          <BButtonGroup>
            <BButton size="md" :title="$t('activities.registrations')" variant="outline-info" @click="$router.push(`/registrations/${activity.id}`)">
              <i class="bi bi-list-check"></i>
            </BButton>
            <BButton :title="$t('activities.edit')" size="md" variant="outline-secondary" @click="openEditModal(activity)">
              <i class="bi bi-pen"></i>
            </BButton>
            <BButton :title="$t('activities.delete')" size="md" variant="outline-danger" @click="openDeleteModal(activity.id)">
              <i class="bi bi-trash"></i>
            </BButton>
          </BButtonGroup>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <BModal v-model="showAddModal" :title="$t('activities.addActivity')" @ok="addActivity" :ok-title="$t('activities.addActivity')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addActivity">
        <div class="mb-3">
          <label for="addActivityType" class="form-label">{{ $t('activities.activityType') }}</label>
          <BFormSelect id="addActivityType" v-model="newActivityTypeId" :options="activityTypeOptions" :state="newActivityTypeId ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activities.activityTypeRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addDate" class="form-label">{{ $t('activities.date') }}</label>
          <BFormInput type="datetime-local" id="addDate" v-model="newDate" :state="!newDateError ? null : false" required />
          <BFormInvalidFeedback>{{ newDateError || $t('activities.dateRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="$t('activities.editActivity')" @ok.prevent="updateActivity" :ok-title="$t('activities.edit')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateActivity">
        <div class="mb-3">
          <label for="editActivityType" class="form-label">{{ $t('activities.activityType') }}</label>
          <BFormSelect id="editActivityType" v-model="editActivityTypeId" :options="activityTypeOptions" :state="editActivityTypeId ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activities.activityTypeRequired') }}</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editDate" class="form-label">{{ $t('activities.date') }}</label>
          <BFormInput type="datetime-local" id="editDate" v-model="editDate" :state="!editDateError ? null : false" required />
          <BFormInvalidFeedback>{{ editDateError || $t('activities.dateRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('activities.confirmDelete')" @ok="deleteActivity" :ok-title="$t('activities.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('activities.deleteMessage') }}</p>
    </BModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Activity, ActivityType } from '../types'
import { useI18n } from 'vue-i18n'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'
import { useValidation } from '../composables/useValidation'

const { t } = useI18n()
const { validateDateTime } = useValidation()

const { activities: apiActivities, activityTypes: apiActivityTypes } = useApi()

const activities = ref<Activity[]>([])
const activityTypes = ref<ActivityType[]>([])
const filterActivityTypeId = ref('')
const filterDate = ref('')
const newActivityTypeId = ref('')
const newDate = ref('')
const editActivityTypeId = ref('')
const editDate = ref('')
const editingId = ref('')
const loading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')

const activityTypeOptions = computed(() => [
  { value: '', text: t('activities.filterByActivityType') },
  ...activityTypes.value.map(at => ({ value: at.id, text: at.name }))
])

const filteredActivities = computed(() => {
  let filtered = activities.value
  if (filterActivityTypeId.value) {
    filtered = filtered.filter(a => a.activity_type_id === filterActivityTypeId.value)
  }
  if (filterDate.value) {
    filtered = filtered.filter(a => a.date.startsWith(filterDate.value))
  }
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const newDateError = validateDateTime(newDate)
const editDateError = validateDateTime(editDate)

const isAddFormValid = computed(() => newActivityTypeId.value && newDate.value && !newDateError.value)
const isEditFormValid = computed(() => editActivityTypeId.value && editDate.value && !editDateError.value)


const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
}

const getActivityClass = (activity: Activity): string => {
  const now = new Date()
  const activityDate = new Date(activity.date)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (activityDate.toDateString() === now.toDateString()) {
    return 'border border-primary'
  } else if (activityDate < twentyFourHoursAgo) {
    return 'border border-success'
  } else {
    return ''
  }
}

const fetchActivities = async () => {
  try {
    activities.value = await apiActivities.fetch()
    loading.value = false
  } catch (error) {
    console.error('Error fetching activities:', error)
  }
}

const fetchActivityTypes = async () => {
  try {
    activityTypes.value = await apiActivityTypes.fetch()
  } catch (error) {
    console.error('Error fetching activity types:', error)
  }
}

const addActivity = async () => {
  if (!newActivityTypeId.value || !newDate.value) return
  loading.value = true
  try {
    await apiActivities.add(newActivityTypeId.value, newDate.value)
    newActivityTypeId.value = ''
    newDate.value = ''
    await fetchActivities()
    showAddModal.value = false
  } catch (error) {
    console.error('Error adding activity:', error)
  }
  loading.value = false
}

const openEditModal = (activity: Activity) => {
  editingId.value = activity.id
  editActivityTypeId.value = activity.activity_type_id
  editDate.value = activity.date.slice(0, 16) // for datetime-local
  showEditModal.value = true
}

const openDeleteModal = (id: string) => {
  deleteId.value = id
  showDeleteModal.value = true
}

const updateActivity = async () => {
  if (!editActivityTypeId.value || !editDate.value) return
  loading.value = true
  try {
    await apiActivities.update(editingId.value, editActivityTypeId.value, editDate.value)
    await fetchActivities()
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating activity:', error)
  }
  loading.value = false
}

const deleteActivity = async () => {
  try {
    await apiActivities.delete(deleteId.value)
    await fetchActivities()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error deleting activity:', error)
  }
}

onMounted(() => {
  fetchActivities()
  fetchActivityTypes()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>