<template>
  <BModal v-model="showModal" :title="mode === 'add' ? $t('activities.addActivity') : $t('common.edit')" @ok="submit" :ok-title="mode === 'add' ? $t('activities.addActivity') : $t('common.edit')" :cancel-title="$t('common.cancel')" :ok-disabled="!isFormValid || loading" size="lg">
    <BForm @submit.prevent="submit">
      <div class="mb-3">
        <label for="activityType" class="form-label">{{ $t('activities.activityType') }}</label>
        <BFormSelect id="activityType" v-model="activityTypeId" :options="activityTypeOptions" :state="activityTypeId ? null : false" required />
        <BFormInvalidFeedback>{{ $t('activities.activityTypeRequired') }}</BFormInvalidFeedback>
      </div>
      <div class="mb-3">
        <label for="date" class="form-label">{{ $t('activities.date') }}</label>
        <BFormInput type="datetime-local" id="date" v-model="date" :state="!dateError ? null : false" required />
        <BFormInvalidFeedback>{{ dateError }}</BFormInvalidFeedback>
      </div>
      <div class="mb-3">
        <label class="form-label">{{ $t('activities.assignees') }}</label>
        <div class="border rounded p-3 mb-3">
          <div v-if="assignees.length > 0" class="mb-3">
            <h6>{{ $t('activities.selectedAssignees') }}</h6>
            <div class="d-flex flex-wrap gap-2">
              <BBadge v-for="assignee in assignees" :key="assignee.participant_id" variant="primary" class="d-flex align-items-center">
                {{ assignee.participant ? `${assignee.participant.first_name} ${assignee.participant.last_name}` : $t('common.unknownUser') }}
                <BButton size="sm" variant="link" class="text-white ms-1 p-0" @click="removeAssignee(assignee.participant_id)">
                  <i class="bi bi-x"></i>
                </BButton>
              </BBadge>
            </div>
          </div>
          <BFormInput v-model="userSearchTerm" :placeholder="$t('activities.searchUsers')" class="mb-2" />
          <div class="list-group" style="max-height: 200px; overflow-y: auto;">
            <div
              v-for="user in paginatedUsers"
              :key="user.id"
              class="list-group-item d-flex justify-content-between align-items-center"
              :class="{ 'list-group-item-secondary': isAssigneeSelected(user.id) }"
            >
              <span>{{ user.first_name }} {{ user.last_name }}</span>
              <BButton
                size="sm"
                :variant="isAssigneeSelected(user.id) ? 'secondary' : 'primary'"
                @click="addAssignee(user)"
                :disabled="isAssigneeSelected(user.id)"
              >
                <i class="bi bi-plus"></i>
              </BButton>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <BButton size="sm" variant="outline-secondary" @click="prevPage" :disabled="currentPage === 1">
              <i class="bi bi-chevron-left"></i>
            </BButton>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <BButton size="sm" variant="outline-secondary" @click="nextPage" :disabled="currentPage === totalPages">
              <i class="bi bi-chevron-right"></i>
            </BButton>
          </div>
        </div>
      </div>
    </BForm>
  </BModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BModal, BForm, BFormSelect, BFormInput, BBadge, BButton } from 'bootstrap-vue-next'
import type { Activity, ActivityType, ActivityAssignee, Participant } from '../types'
import { useI18n } from 'vue-i18n'
import { useValidation } from '../composables/useValidation'
import { useApi } from '../composables/api'

const { t } = useI18n()
const { validateDateTime } = useValidation()
const { activities: apiActivities, activityAssignees: apiActivityAssignees, registrations: apiRegistrations } = useApi()

interface Props {
  mode: 'add' | 'edit'
  show: boolean
  activityTypes: ActivityType[]
  allUsers: Participant[]
  activity?: Activity
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'added': []
  'updated': []
}>()

const showModal = ref(props.show)

watch(() => props.show, (newVal) => {
  showModal.value = newVal
})

watch(showModal, (newVal) => {
  emit('update:show', newVal)
})

const activityTypeId = ref('')
const date = ref('')
const assignees = ref<ActivityAssignee[]>([])
const userSearchTerm = ref('')
const currentPage = ref(1)
const loading = ref(false)

const activityTypeOptions = computed(() => [
  { value: '', text: t('activities.filterByActivityType') },
  ...props.activityTypes.map(at => ({ value: at.id, text: at.name }))
])

const dateError = validateDateTime(date, t('activities.date'))

const filteredUsers = computed(() => {
  return props.allUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.value.toLowerCase())
  )
})

const paginatedUsers = computed(() => {
  const users = filteredUsers.value
  const pageSize = 5
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return users.slice(start, end)
})

const totalPages = computed(() => {
  const users = filteredUsers.value
  const pageSize = 5
  return Math.ceil(users.length / pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const isFormValid = computed(() => activityTypeId.value && date.value && !dateError.value)

const addAssignee = (user: Participant) => {
  const assignee: ActivityAssignee = {
    id: '',
    activity_id: '',
    participant_id: user.id,
    created_at: '',
    participant: user
  }
  if (!assignees.value.some(a => a.participant_id === user.id)) {
    assignees.value.push(assignee)
  }
}

const removeAssignee = (participantId: string) => {
  assignees.value = assignees.value.filter(a => a.participant_id !== participantId)
}

const isAssigneeSelected = (participantId: string) => {
  return assignees.value.some(a => a.participant_id === participantId)
}

const submit = async () => {
  if (!isFormValid.value) return
  loading.value = true
  try {
    if (props.mode === 'add') {
      const activity = await apiActivities.add(activityTypeId.value, date.value)
      for (const assignee of assignees.value) {
        await apiActivityAssignees.add(assignee.participant_id, activity.id)
        await apiRegistrations.add(assignee.participant_id, activity.id)
      }
      emit('added')
    } else {
      await apiActivities.update(props.activity!.id, activityTypeId.value, date.value)
      const currentAssignees = await apiActivityAssignees.fetch(props.activity!.id)
      const currentIds = currentAssignees.map(a => a.participant_id)
      const newIds = assignees.value.map(a => a.participant_id)

      for (const assignee of currentAssignees) {
        if (!newIds.includes(assignee.participant_id)) {
          await apiActivityAssignees.delete(assignee.participant_id, props.activity!.id)
          await apiRegistrations.delete(assignee.participant_id, props.activity!.id)
        }
      }

      for (const assignee of assignees.value) {
        if (!currentIds.includes(assignee.participant_id)) {
          await apiActivityAssignees.add(assignee.participant_id, props.activity!.id)
          await apiRegistrations.add(assignee.participant_id, props.activity!.id)
        }
      }
      emit('updated')
    }
    // Reset form and close modal
    activityTypeId.value = ''
    date.value = ''
    assignees.value = []
    currentPage.value = 1
    userSearchTerm.value = ''
    showModal.value = false
  } catch (error) {
    console.error('Failed to submit activity:', error)
  } finally {
    loading.value = false
  }
}

watch([() => props.show, () => props.mode], async () => {
  if (props.show) {
    if (props.mode === 'edit' && props.activity) {
      activityTypeId.value = props.activity.activity_type_id
      date.value = props.activity.date.slice(0, 16)
      try {
        assignees.value = await apiActivityAssignees.fetch(props.activity.id)
      } catch (error) {
        console.error('Error fetching assignees:', error)
        assignees.value = []
      }
    } else {
      // add mode
      activityTypeId.value = ''
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      date.value = `${year}-${month}-${day}T15:00`
      assignees.value = []
      currentPage.value = 1
      userSearchTerm.value = ''
    }
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>