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
    </BForm>
  </BModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Participant } from '../types'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  participant: Participant | null
  loading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { firstName: string; lastName: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const firstName = ref('')
const lastName = ref('')

const isFormValid = computed(() => firstName.value.trim() && lastName.value.trim())

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('submit', {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim()
  })
}

watch(() => props.participant, (newParticipant) => {
  if (newParticipant) {
    firstName.value = newParticipant.first_name
    lastName.value = newParticipant.last_name
  } else {
    firstName.value = ''
    lastName.value = ''
  }
}, { immediate: true })

watch(() => props.mode, () => {
  if (props.mode === 'add') {
    firstName.value = ''
    lastName.value = ''
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>