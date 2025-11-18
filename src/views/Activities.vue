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

    <ActivityModal mode="add" v-model:show="showAddModal" @added="handleActivityChange" :activity-types="activityTypes" :all-users="allUsers" />

    <ActivityModal mode="edit" v-model:show="showEditModal" @updated="handleActivityChange" :activity="editingActivity" :activity-types="activityTypes" :all-users="allUsers" />

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('activities.confirmDelete')" @ok="deleteActivity" :ok-title="$t('activities.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('activities.deleteMessage') }}</p>
    </BModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Activity, ActivityType, Participant } from '../types'
import { useApi } from '../composables/api'
import { formatDate } from '../composables/useDate'
import ActivityModal from '../components/ActivityModal.vue'

const { activities: apiActivities, activityTypes: apiActivityTypes, activityAssignees: apiActivityAssignees, registrations: apiRegistrations } = useApi()

const activities = ref<Activity[]>([])
const activityTypes = ref<ActivityType[]>([])
const filterActivityTypeId = ref('')
const filterDate = ref('')
const loading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')
const allUsers = ref<Participant[]>([])
const editingActivity = ref<Activity>()

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


const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
}

const getActivityClass = (activity: Activity): string => {
  const now = new Date()
  const activityDate = new Date(activity.date)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (activityDate.toDateString() === now.toDateString()) {
    return 'border-5 border-primary'
  } else if (activityDate < twentyFourHoursAgo) {
    return 'border-2 border-success'
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


const openEditModal = (activity: Activity) => {
  editingActivity.value = activity
  showEditModal.value = true
}

const openDeleteModal = (id: string) => {
  deleteId.value = id
  showDeleteModal.value = true
}

const handleActivityChange = () => {
  fetchActivities()
}

const deleteActivity = async () => {
  try {
    // Delete assignees and registrations first
    const assignees = await apiActivityAssignees.fetch(deleteId.value)
    for (const assignee of assignees) {
      await apiActivityAssignees.delete(assignee.participant_id, deleteId.value)
      await apiRegistrations.delete(assignee.participant_id, deleteId.value)
    }
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
  fetchUsers()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>