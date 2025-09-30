<template>
  <BModal
    :model-value="modelValue"
    :title="mode === 'add' ? $t('participants.addParticipant') : $t('participants.editParticipant')"
    @ok="handleSubmit"
    :ok-title="mode === 'add' ? $t('participants.addParticipant') : $t('participants.edit')"
    :cancel-title="$t('activities.cancel')"
    :ok-disabled="loading || !isFormValid"
    @hide="$emit('update:modelValue', false)"
  >
    <BForm @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="firstName" class="form-label">{{ $t('participants.firstName') }}</label>
        <BFormInput
          type="text"
          id="firstName"
          v-model="firstName"
          :state="firstName.trim() ? null : false"
          required
        />
        <BFormInvalidFeedback>{{ $t('participants.firstNameRequired') }}</BFormInvalidFeedback>
      </div>
      <div class="mb-3">
        <label for="lastName" class="form-label">{{ $t('participants.lastName') }}</label>
        <BFormInput
          type="text"
          id="lastName"
          v-model="lastName"
          :state="lastName.trim() ? null : false"
          required
        />
        <BFormInvalidFeedback>{{ $t('participants.lastNameRequired') }}</BFormInvalidFeedback>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Participant, ActivityType } from '../types'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  participant: Participant | null
  activityTypes?: ActivityType[]
  loading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { firstName: string; lastName: string; activityTypes?: string[] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const firstName = ref('')
const lastName = ref('')
const selectedActivityTypes = ref<string[]>([])

const isFormValid = computed(() => firstName.value.trim() && lastName.value.trim())

const toggleActivityType = (activityTypeId: string) => {
  const index = selectedActivityTypes.value.indexOf(activityTypeId)
  if (index > -1) {
    selectedActivityTypes.value.splice(index, 1)
  } else {
    selectedActivityTypes.value.push(activityTypeId)
  }
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('submit', {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    activityTypes: selectedActivityTypes.value
  })
}

watch(() => props.participant, (newParticipant) => {
  if (newParticipant) {
    firstName.value = newParticipant.first_name
    lastName.value = newParticipant.last_name
    selectedActivityTypes.value = newParticipant.activity_types || []
  } else {
    firstName.value = ''
    lastName.value = ''
    selectedActivityTypes.value = []
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (props.mode === 'add') {
    firstName.value = ''
    lastName.value = ''
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