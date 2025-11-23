<template>
  <BModal
    :model-value="modelValue"
    :title="mode === 'add' ? $t('participants.addParticipant') : $t('common.edit')"
    @ok="handleSubmit"
    :ok-title="mode === 'add' ? $t('participants.addParticipant') : $t('common.edit')"
    :cancel-title="$t('common.cancel')"
    :ok-disabled="loading || !formValid"
    @hide="$emit('update:modelValue', false)"
  >
    <BForm @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="firstName" class="form-label">{{ $t('participants.firstName') }}</label>
        <BFormInput
          type="text"
          id="firstName"
          v-model="firstName"
          :state="!firstNameError ? null : false"
          required
        />
        <BFormInvalidFeedback>{{ firstNameError || $t('participants.firstNameRequired') }}</BFormInvalidFeedback>
      </div>
      <div class="mb-3">
        <label for="lastName" class="form-label">{{ $t('participants.lastName') }}</label>
        <BFormInput
          type="text"
          id="lastName"
          v-model="lastName"
          :state="!lastNameError ? null : false"
          required
        />
        <BFormInvalidFeedback>{{ lastNameError || $t('participants.lastNameRequired') }}</BFormInvalidFeedback>
      </div>
      <div class="mb-3">
        <label for="role" class="form-label">{{ $t('participants.role') }}</label>
        <BFormSelect
          id="role"
          v-model="selectedRole"
          :options="roleOptions"
        />
      </div>
      <div v-if="props.activityTypes" class="mb-3">
        <label class="form-label">{{ $t('participants.activityTypes') }}</label>
        <div class="activity-types-container">
          <BFormCheckbox
            v-for="activityType in props.activityTypes"
            :key="activityType.id"
            :model-value="selectedActivityTypes.includes(activityType.id)"
            @change="toggleActivityType(activityType.id)"
            class="mb-2"
          >
            {{ activityType.name }}
          </BFormCheckbox>
        </div>
      </div>
    </BForm>
  </BModal>

  <!-- Duplicate Warning Modal -->
  <BModal
    v-model="showDuplicateWarning"
    :title="$t('participants.duplicateWarningTitle')"
    @ok="confirmSubmit"
    @cancel="cancelSubmit"
    :ok-title="$t('participants.confirmCreate')"
    :cancel-title="$t('common.cancel')"
  >
    <p>{{ $t('participants.duplicateWarningMessage') }}</p>
    <ul class="list-unstyled">
      <li v-for="participant in similarParticipants" :key="participant.id" class="d-flex justify-content-between align-items-center mb-2">
        <span>{{ participant.first_name }} {{ participant.last_name }}</span>
        <BButton
          v-if="activityTypeId && !participant.activity_types?.includes(activityTypeId)"
          size="sm"
          variant="outline-primary"
          :disabled="addingActivityType.has(participant.id)"
          @click="addActivityType(participant)"
        >
          <i v-if="addingActivityType.has(participant.id)" class="bi bi-hourglass-split"></i>
          <i v-else class="bi bi-plus"></i>
          {{ $t('participants.addActivityType') }}
        </BButton>
      </li>
    </ul>
    <p v-if="activityTypeId && similarParticipants.some(p => !p.activity_types?.includes(activityTypeId!))" class="text-info mb-3">
      <i class="bi bi-info-circle"></i> {{ $t('participants.duplicateWarningActivityType') }}
    </p>
    <p>{{ $t('participants.duplicateWarningConfirm') }}</p>
  </BModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Participant, ActivityType } from '../types'
import { useValidation } from '../composables/useValidation'
import { findSimilarParticipants, addActivityTypeToParticipant } from '../api/participants'
import { useI18n } from 'vue-i18n'
import { useApi } from '../composables/api'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  participant: Participant | null
  activityTypes?: ActivityType[]
  activityTypeId?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'added'): void
  (e: 'updated'): void
  (e: 'activityTypeAdded'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { validateRequired } = useValidation()
const { t } = useI18n()
const { participants: apiParticipants } = useApi()

const firstName = ref('')
const lastName = ref('')
const selectedRole = ref<'PHYSIOTHERAPIST' | 'VOLUNTEER' | null>(null)
const selectedActivityTypes = ref<string[]>([])
const similarParticipants = ref<Participant[]>([])
const showDuplicateWarning = ref(false)
const checkingDuplicates = ref(false)
const loading = ref(false)
const addingActivityType = ref<Set<string>>(new Set())

const firstNameError = validateRequired(firstName, 'First name')
const lastNameError = validateRequired(lastName, 'Last name')

const formValid = computed(() => !firstNameError.value && !lastNameError.value)

const roleOptions = computed(() => [
  { value: null, text: t('participants.noRole') },
  { value: 'PHYSIOTHERAPIST', text: t('participants.physiotherapist') },
  { value: 'VOLUNTEER', text: t('participants.volunteer') }
])

const toggleActivityType = (activityTypeId: string) => {
  const index = selectedActivityTypes.value.indexOf(activityTypeId)
  if (index > -1) {
    selectedActivityTypes.value.splice(index, 1)
  } else {
    selectedActivityTypes.value.push(activityTypeId)
  }
}

const checkForDuplicates = async () => {
  if (props.mode !== 'add') return true

  checkingDuplicates.value = true
  try {
    const similar = await findSimilarParticipants(firstName.value.trim(), lastName.value.trim())
    if (similar.length > 0) {
      similarParticipants.value = similar
      showDuplicateWarning.value = true
      return false
    }
    return true
  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return true // Allow submission if check fails
  } finally {
    checkingDuplicates.value = false
  }
}

const handleSubmit = async () => {
  if (!formValid.value) return

  const canProceed = await checkForDuplicates()
  if (!canProceed) return

  loading.value = true
  try {
    if (props.mode === 'add') {
      await apiParticipants.add(firstName.value.trim(), lastName.value.trim(), selectedActivityTypes.value, selectedRole.value)
      emit('added')
    } else {
      await apiParticipants.update(props.participant!.id, firstName.value.trim(), lastName.value.trim(), selectedActivityTypes.value, selectedRole.value)
      emit('updated')
    }
    // Reset form and close modal
    firstName.value = ''
    lastName.value = ''
    selectedRole.value = null
    selectedActivityTypes.value = []
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error submitting participant:', error)
  } finally {
    loading.value = false
  }
}

const confirmSubmit = async () => {
  showDuplicateWarning.value = false
  loading.value = true
  try {
    await apiParticipants.add(firstName.value.trim(), lastName.value.trim(), selectedActivityTypes.value, selectedRole.value)
    emit('added')
    // Reset form and close modal
    firstName.value = ''
    lastName.value = ''
    selectedRole.value = null
    selectedActivityTypes.value = []
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error adding participant:', error)
  } finally {
    loading.value = false
  }
}

const cancelSubmit = () => {
  showDuplicateWarning.value = false
}

const addActivityType = async (participant: Participant) => {
  if (!props.activityTypeId || addingActivityType.value.has(participant.id)) return

  addingActivityType.value.add(participant.id)
  try {
    await addActivityTypeToParticipant(participant.id, props.activityTypeId)
    // Update the participant's activity_types
    participant.activity_types = [...(participant.activity_types || []), props.activityTypeId]
    // Close the modal and emit event
    emit('activityTypeAdded')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error adding activity type:', error)
  } finally {
    addingActivityType.value.delete(participant.id)
  }
}

watch(() => props.participant, (newParticipant) => {
  if (newParticipant) {
    firstName.value = newParticipant.first_name
    lastName.value = newParticipant.last_name
    selectedRole.value = newParticipant.participant_role
    selectedActivityTypes.value = newParticipant.activity_types || []
  } else {
    firstName.value = ''
    lastName.value = ''
    selectedRole.value = null
    selectedActivityTypes.value = props.activityTypeId && props.mode === 'add' ? [props.activityTypeId] : []
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (props.mode === 'add') {
    firstName.value = ''
    lastName.value = ''
    selectedRole.value = null
    selectedActivityTypes.value = props.activityTypeId ? [props.activityTypeId] : []
  }
})
</script>

<style scoped>
.activity-types-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: #fff;
}
</style>