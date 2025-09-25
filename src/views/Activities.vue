<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">Home</BBreadcrumbItem>
      <BBreadcrumbItem active>Activities</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>Activities</h1>
    <div class="row d-flex justify-content-between align-items-center mb-3">
      <div class="col d-flex p-1 align-items-center">
        <BFormSelect v-model="filterActivityTypeId" :options="activityTypeOptions" placeholder="Filter by Activity Type" class="w-auto" />
      </div>
      <div class="col d-flex p-1 align-items-center">
        <BFormInput type="date" v-model="filterDate" placeholder="Filter by Date" class="w-auto" />
      </div>
    <div class="col">
      <BButton variant="primary" @click="showAddModal = true">
        <i class="bi bi-calendar-plus"></i>
      </BButton>
    </div>
    </div>
    <div class="list-group">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="p-2 list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-2">
          <strong>{{ getActivityTypeName(activity.activity_type_id) }}</strong>
          <br />
          <small class="text-muted">{{ formatDate(activity.date) }}</small>
        </div>
        <div class="p-2">
          <BButtonGroup>
            <BButton size="sm" title="registrations" variant="outline-info" @click="$router.push(`/registrations/${activity.id}`)">
              <i class="bi bi-list-check"></i>
            </BButton>
            <BButton title="Edit" size="sm" variant="outline-secondary" @click="openEditModal(activity)">
              <i class="bi bi-pen"></i>
            </BButton>
            <BButton title="Delete" size="sm" variant="outline-danger" @click="openDeleteModal(activity.id)">
              <i class="bi bi-trash"></i>
            </BButton>
          </BButtonGroup>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <BModal v-model="showAddModal" title="Add Activity" @ok="addActivity" ok-title="Add" cancel-title="Cancel" :ok-disabled="loading || !isAddFormValid">
      <BForm @submit.prevent="addActivity">
        <div class="mb-3">
          <label for="addActivityType" class="form-label">Activity Type</label>
          <BFormSelect id="addActivityType" v-model="newActivityTypeId" :options="activityTypeOptions" :state="newActivityTypeId ? null : false" required />
          <BFormInvalidFeedback>Activity type is required</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="addDate" class="form-label">Date</label>
          <BFormInput type="datetime-local" id="addDate" v-model="newDate" :state="newDate ? null : false" required />
          <BFormInvalidFeedback>Date is required</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" title="Edit Activity" @ok.prevent="updateActivity" ok-title="Update" cancel-title="Cancel" :ok-disabled="loading || !isEditFormValid">
      <BForm @submit.prevent="updateActivity">
        <div class="mb-3">
          <label for="editActivityType" class="form-label">Activity Type</label>
          <BFormSelect id="editActivityType" v-model="editActivityTypeId" :options="activityTypeOptions" :state="editActivityTypeId ? null : false" required />
          <BFormInvalidFeedback>Activity type is required</BFormInvalidFeedback>
        </div>
        <div class="mb-3">
          <label for="editDate" class="form-label">Date</label>
          <BFormInput type="datetime-local" id="editDate" v-model="editDate" :state="editDate ? null : false" required />
          <BFormInvalidFeedback>Date is required</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" title="Confirm Delete" @ok="deleteActivity" ok-title="Delete" cancel-title="Cancel" ok-variant="danger">
      <p>Do you want to remove the activity?</p>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { Activity, ActivityType } from '../types'

const activities = ref<Activity[]>([])
const activityTypes = ref<ActivityType[]>([])
const filterActivityTypeId = ref('')
const filterDate = ref('')
const newActivityTypeId = ref('')
const newDate = ref('')
const editActivityTypeId = ref('')
const editDate = ref('')
const editingId = ref('')
const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteId = ref('')

const activityTypeOptions = computed(() => [
  { value: '', text: 'All Activity Types' },
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

const isAddFormValid = computed(() => newActivityTypeId.value && newDate.value)
const isEditFormValid = computed(() => editActivityTypeId.value && editDate.value)

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const getActivityTypeName = (id: string) => {
  const at = activityTypes.value.find(at => at.id === id)
  return at ? at.name : 'Unknown'
}

const fetchActivities = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
  if (error) {
    console.error('Error fetching activities:', error)
  } else {
    activities.value = data || []
  }
}

const fetchActivityTypes = async () => {
  const { data, error } = await supabase
    .from('activity_types')
    .select('*')
  if (error) {
    console.error('Error fetching activity types:', error)
  } else {
    activityTypes.value = data || []
  }
}

const addActivity = async () => {
  if (!newActivityTypeId.value || !newDate.value) return
  loading.value = true
  const { error } = await supabase
    .from('activities')
    .insert([{ activity_type_id: newActivityTypeId.value, date: newDate.value }])
  if (error) {
    console.error('Error adding activity:', error)
  } else {
    newActivityTypeId.value = ''
    newDate.value = ''
    fetchActivities()
    showAddModal.value = false
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
  const { error } = await supabase
    .from('activities')
    .update({ activity_type_id: editActivityTypeId.value, date: editDate.value })
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
    .from('activities')
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
  fetchActivityTypes()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>