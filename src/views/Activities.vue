<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('activities.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1>{{ $t('activities.title') }}</h1>
    <div class="mb-3">
      <BInputGroup class="mt-3">
        <BFormSelect v-model="filterActivityTypeId" :options="activityTypeOptions" :placeholder="$t('activities.filterByActivityType')" class="w-auto" />
        <BFormInput type="date" v-model="filterDate" :placeholder="$t('activities.filterByDate')" class="w-auto" />
        <BButton variant="primary" @click="showAddModal = true">
          <i class="bi bi-calendar-plus"></i>
        </BButton>
      </BInputGroup>
    </div>
    <div class="list-group">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="p-2 list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="p-2" style="cursor: pointer;" @click="$router.push(`/registrations/${activity.id}`)" :title="$t('activities.registrations')">
          <strong>{{ getActivityTypeName(activity.activity_type_id) }}</strong>
          <br />
          <p><i class="bi bi-calendar-event"></i> {{ formatDate(activity.date) }}</p>
        </div>
        <div class="p-2">
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
          <BFormInput type="datetime-local" id="addDate" v-model="newDate" :state="newDate ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activities.dateRequired') }}</BFormInvalidFeedback>
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
          <BFormInput type="datetime-local" id="editDate" v-model="editDate" :state="editDate ? null : false" required />
          <BFormInvalidFeedback>{{ $t('activities.dateRequired') }}</BFormInvalidFeedback>
        </div>
      </BForm>
    </BModal>

    <!-- Delete Modal -->
    <BModal v-model="showDeleteModal" :title="$t('activities.confirmDelete')" @ok="deleteActivity" :ok-title="$t('activities.delete')" :cancel-title="$t('activities.cancel')" ok-variant="danger">
      <p>{{ $t('activities.deleteMessage') }}</p>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import type { Activity, ActivityType } from '../types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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