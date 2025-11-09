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
        <BDropdown variant="outline-secondary" class="me-2">
          <template #button-content>
            <i class="bi bi-filter"></i>
          </template>
          <BDropdownItem @click="filterActivityTypeId = ''">{{ $t('activities.allActivityTypes') }}</BDropdownItem>
          <BDropdownItem v-for="at in activityTypes" :key="at.id" @click="filterActivityTypeId = at.id">{{ at.name }}</BDropdownItem>
        </BDropdown>
        <BFormInput type="datetime-local" v-model="filterDate" :placeholder="$t('activities.filterByDate')" class="w-auto" />
        <BButton variant="primary" @click="showAddModal = true">
          <i class="bi bi-calendar-plus"></i>
        </BButton>
      </BInputGroup>
      <small class="text-muted">{{ $t('activities.filteringBy') }}: {{ filterActivityTypeId === '' ? $t('activities.allActivityTypes') : getActivityTypeName(filterActivityTypeId) }}</small>
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
          <div v-if="Object.keys(getAssigneesByType(activity)).length > 0" class="mt-1">
            <small class="text-muted">
              <span v-for="(participants, role) in getAssigneesByType(activity)" :key="role" class="me-2">
                <strong>{{ role === 'PHYSIOTHERAPIST' ? $t('common.physiotherapist') : role === 'VOLUNTEER' ? $t('common.volunteer') : $t('common.unknown') }}</strong>
                {{ participants.map(p => `${p.first_name} ${p.last_name}`).join(', ') }}
              </span>
            </small>
          </div>
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
    <BModal v-model="showAddModal" :title="$t('activities.addActivity')" @ok="addActivity" :ok-title="$t('activities.addActivity')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isAddFormValid" size="lg">
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
        <div class="mb-3">
          <label class="form-label">{{ $t('activities.assignees') }}</label>
          <div class="border rounded p-3 mb-3">
            <div v-if="newAssignees.length > 0" class="mb-3">
              <h6>{{ $t('activities.selectedAssignees') }}</h6>
              <div class="d-flex flex-wrap gap-2">
                <BBadge v-for="assignee in newAssignees" :key="assignee.participant_id" variant="primary" class="d-flex align-items-center">
                  {{ assignee.participant ? `${assignee.participant.first_name} ${assignee.participant.last_name}` : 'Unknown User' }}
                  <BButton size="sm" variant="link" class="text-white ms-1 p-0" @click="removeAssignee(assignee.participant_id, false)">
                    <i class="bi bi-x"></i>
                  </BButton>
                </BBadge>
              </div>
            </div>
            <BFormInput v-model="userSearchTerm" :placeholder="$t('activities.searchUsers')" class="mb-2" />
            <div class="list-group" style="max-height: 200px; overflow-y: auto;">
              <div
                v-for="user in paginatedUsers(false)"
                :key="user.id"
                class="list-group-item d-flex justify-content-between align-items-center"
                :class="{ 'list-group-item-secondary': isAssigneeSelected(user.id, false) }"
              >
                <span>{{ user.first_name }} {{ user.last_name }}</span>
                <BButton
                  size="sm"
                  :variant="isAssigneeSelected(user.id, false) ? 'secondary' : 'primary'"
                  @click="addAssignee(user, false)"
                  :disabled="isAssigneeSelected(user.id, false)"
                >
                  <i class="bi bi-plus"></i>
                </BButton>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <BButton size="sm" variant="outline-secondary" @click="prevPage(false)" :disabled="addCurrentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </BButton>
              <span>{{ addCurrentPage }} / {{ totalPages(false) }}</span>
              <BButton size="sm" variant="outline-secondary" @click="nextPage(false)" :disabled="addCurrentPage === totalPages(false)">
                <i class="bi bi-chevron-right"></i>
              </BButton>
            </div>
          </div>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="$t('activities.editActivity')" @ok.prevent="updateActivity" :ok-title="$t('activities.edit')" :cancel-title="$t('activities.cancel')" :ok-disabled="loading || !isEditFormValid" size="lg">
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
        <div class="mb-3">
          <label class="form-label">{{ $t('activities.assignees') }}</label>
          <div class="border rounded p-3 mb-3">
            <div v-if="editAssignees.length > 0" class="mb-3">
              <h6>{{ $t('activities.selectedAssignees') }}</h6>
              <div class="d-flex flex-wrap gap-2">
                <BBadge v-for="assignee in editAssignees" :key="assignee.participant_id" variant="primary" class="d-flex align-items-center">
                  {{ assignee.participant ? `${assignee.participant.first_name} ${assignee.participant.last_name}` : 'Unknown User' }}
                  <BButton size="sm" variant="link" class="text-white ms-1 p-0" @click="removeAssignee(assignee.participant_id, true)">
                    <i class="bi bi-x"></i>
                  </BButton>
                </BBadge>
              </div>
            </div>
            <BFormInput v-model="userSearchTerm" :placeholder="$t('activities.searchUsers')" class="mb-2" />
            <div class="list-group" style="max-height: 200px; overflow-y: auto;">
              <div
                v-for="user in paginatedUsers(true)"
                :key="user.id"
                class="list-group-item d-flex justify-content-between align-items-center"
                :class="{ 'list-group-item-secondary': isAssigneeSelected(user.id, true) }"
              >
                <span>{{ user.first_name }} {{ user.last_name }}</span>
                <BButton
                  size="sm"
                  :variant="isAssigneeSelected(user.id, true) ? 'secondary' : 'primary'"
                  @click="addAssignee(user, true)"
                  :disabled="isAssigneeSelected(user.id, true)"
                >
                  <i class="bi bi-plus"></i>
                </BButton>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <BButton size="sm" variant="outline-secondary" @click="prevPage(true)" :disabled="editCurrentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </BButton>
              <span>{{ editCurrentPage }} / {{ totalPages(true) }}</span>
              <BButton size="sm" variant="outline-secondary" @click="nextPage(true)" :disabled="editCurrentPage === totalPages(true)">
                <i class="bi bi-chevron-right"></i>
              </BButton>
            </div>
          </div>
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
import type { Activity, ActivityType, ActivityAssignee, Participant } from '../types'
import { useI18n } from 'vue-i18n'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'
import { useValidation } from '../composables/useValidation'

const { t } = useI18n()
const { validateDateTime } = useValidation()

const { activities: apiActivities, activityTypes: apiActivityTypes, activityAssignees: apiActivityAssignees, registrations: apiRegistrations } = useApi()

const activities = ref<Activity[]>([])
const activityTypes = ref<ActivityType[]>([])
const filterActivityTypeId = ref('')
const filterDate = ref('')
const newActivityTypeId = ref('')
const newDate = ref('')
const newAssignees = ref<ActivityAssignee[]>([])
const editActivityTypeId = ref('')
const editDate = ref('')
const editAssignees = ref<ActivityAssignee[]>([])
const editingId = ref('')
const loading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')
const allUsers = ref<Participant[]>([])
const userSearchTerm = ref('')
const addCurrentPage = ref(1)
const editCurrentPage = ref(1)

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

const filteredUsers = computed(() => {
  return allUsers.value.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.value.toLowerCase())
  )
})

const paginatedUsers = (isEdit: boolean) => {
  const users = filteredUsers.value
  const page = isEdit ? editCurrentPage.value : addCurrentPage.value
  const pageSize = 5
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return users.slice(start, end)
}

const totalPages = (isEdit: boolean) => {
  const users = filteredUsers.value
  const pageSize = 5
  return Math.ceil(users.length / pageSize)
}

const nextPage = (isEdit: boolean) => {
  if (isEdit) {
    if (editCurrentPage.value < totalPages(true)) {
      editCurrentPage.value++
    }
  } else {
    if (addCurrentPage.value < totalPages(false)) {
      addCurrentPage.value++
    }
  }
}

const prevPage = (isEdit: boolean) => {
  if (isEdit) {
    if (editCurrentPage.value > 1) {
      editCurrentPage.value--
    }
  } else {
    if (addCurrentPage.value > 1) {
      addCurrentPage.value--
    }
  }
}

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

const getAssigneesByType = (activity: Activity) => {
  const assignees = activity.activity_assignees || []
  const grouped = assignees.reduce((acc, assignee) => {
    const role = assignee.participant?.participant_role || 'UNKNOWN'
    if (!acc[role]) acc[role] = []
    acc[role].push(assignee.participant)
    return acc
  }, {} as Record<string, Participant[]>)
  return grouped
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

const fetchUsers = async () => {
  try {
    allUsers.value = await apiActivityAssignees.fetchUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}


const addActivity = async () => {
  if (!newActivityTypeId.value || !newDate.value) return
  loading.value = true
  try {
    const activity = await apiActivities.add(newActivityTypeId.value, newDate.value)
    // Add assignees
    for (const assignee of newAssignees.value) {
      await apiActivityAssignees.add(assignee.participant_id, activity.id)
    }
    newActivityTypeId.value = ''
    newDate.value = ''
    newAssignees.value = []
    addCurrentPage.value = 1
    await fetchActivities()
    showAddModal.value = false
  } catch (error) {
    console.error('Error adding activity:', error)
  }
  loading.value = false
}

const openEditModal = async (activity: Activity) => {
  editingId.value = activity.id
  editActivityTypeId.value = activity.activity_type_id
  editDate.value = activity.date.slice(0, 16) // for datetime-local
  // Fetch current assignees
  try {
    editAssignees.value = await apiActivityAssignees.fetch(activity.id)
  } catch (error) {
    console.error('Error fetching assignees:', error)
    editAssignees.value = []
  }
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
    // Update assignees - remove old ones and add new ones
    const currentAssignees = await apiActivityAssignees.fetch(editingId.value)
    const currentAssigneeIds = currentAssignees.map(a => a.participant_id)
    const newAssigneeIds = editAssignees.value.map(a => a.participant_id)

    // Remove assignees not in new list
    for (const assignee of currentAssignees) {
      if (!newAssigneeIds.includes(assignee.participant_id)) {
        await apiActivityAssignees.delete(assignee.participant_id, editingId.value)
      }
    }

    // Add new assignees
    for (const assignee of editAssignees.value) {
      if (!currentAssigneeIds.includes(assignee.participant_id)) {
        await apiActivityAssignees.add(assignee.participant_id, editingId.value)
      }
    }

    await fetchActivities()
    showEditModal.value = false
    editCurrentPage.value = 1
  } catch (error) {
    console.error('Error updating activity:', error)
  }
  loading.value = false
}

const deleteActivity = async () => {
  try {
    // Delete assignees first
    const assignees = await apiActivityAssignees.fetch(deleteId.value)
    for (const assignee of assignees) {
      await apiActivityAssignees.delete(assignee.participant_id, deleteId.value)
    }
    await apiActivities.delete(deleteId.value)
    await fetchActivities()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error deleting activity:', error)
  }
}

const addAssignee = (user: Participant, isEdit: boolean) => {
  const assignee: ActivityAssignee = {
    id: '',
    activity_id: '',
    participant_id: user.id,
    created_at: '',
    participant: user
  }
  if (isEdit) {
    if (!editAssignees.value.some(a => a.participant_id === user.id)) {
      editAssignees.value.push(assignee)
    }
  } else {
    if (!newAssignees.value.some(a => a.participant_id === user.id)) {
      newAssignees.value.push(assignee)
    }
  }
}

const removeAssignee = (participantId: string, isEdit: boolean) => {
  if (isEdit) {
    editAssignees.value = editAssignees.value.filter(a => a.participant_id !== participantId)
  } else {
    newAssignees.value = newAssignees.value.filter(a => a.participant_id !== participantId)
  }
}

const isAssigneeSelected = (participantId: string, isEdit: boolean) => {
  if (isEdit) {
    return editAssignees.value.some(a => a.participant_id === participantId)
  } else {
    return newAssignees.value.some(a => a.participant_id === participantId)
  }
}

onMounted(() => {
  fetchActivities()
  fetchActivityTypes()
  fetchUsers()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>