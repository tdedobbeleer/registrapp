<template>
  <BModal
    :model-value="modelValue"
    :title="mode === 'add' ? $t('participants.addParticipant') : $t('participants.editParticipant')"
    @ok="handleSubmit"
    :ok-title="mode === 'add' ? $t('participants.addParticipant') : $t('participants.edit')"
    :cancel-title="$t('activities.cancel')"
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

    <!-- Duplicate Warning Modal -->
    <BModal
      v-model="showDuplicateWarning"
      :title="$t('participants.duplicateWarningTitle')"
      @ok="confirmSubmit"
      @cancel="cancelSubmit"
      :ok-title="$t('participants.confirmCreate')"
      :cancel-title="$t('activities.cancel')"
    >
      <p>{{ $t('participants.duplicateWarningMessage') }}</p>
      <ul>
        <li v-for="participant in similarParticipants" :key="participant.id">
          {{ participant.first_name }} {{ participant.last_name }}
        </li>
      </ul>
      <p>{{ $t('participants.duplicateWarningConfirm') }}</p>
    </BModal>
  </BModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Participant, ActivityType } from '../types'
import { useValidation } from '../composables/useValidation'
import { findSimilarParticipants } from '../api/participants'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  participant: Participant | null
  activityTypes?: ActivityType[]
  loading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { firstName: string; lastName: string; activityTypes?: string[]; participantRole?: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { validateRequired } = useValidation()
const { t } = useI18n()

const firstName = ref('')
const lastName = ref('')
const selectedRole = ref<'PHYSIOTHERAPIST' | 'VOLUNTEER' | null>(null)
const selectedActivityTypes = ref<string[]>([])
const similarParticipants = ref<Participant[]>([])
const showDuplicateWarning = ref(false)
const checkingDuplicates = ref(false)

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

  emit('submit', {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    activityTypes: selectedActivityTypes.value,
    participantRole: selectedRole.value
  })
}

const confirmSubmit = () => {
  showDuplicateWarning.value = false
  emit('submit', {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    activityTypes: selectedActivityTypes.value,
    participantRole: selectedRole.value
  })
}

const cancelSubmit = () => {
  showDuplicateWarning.value = false
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
    selectedActivityTypes.value = []
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (props.mode === 'add') {
    firstName.value = ''
    lastName.value = ''
    selectedRole.value = null
    selectedActivityTypes.value = []
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