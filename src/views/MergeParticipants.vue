<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem to="/" @click="$router.back()">{{ $t('dashboard.warnings') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('mergeParticipants.title') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <h1 class="text-center">{{ $t('mergeParticipants.title') }}</h1>
    
    <div v-if="loading" class="text-center">
      <BSpinner />
    </div>
    
    <div v-else>
      <BRow>
        <BCol md="6" class="mb-3 mb-md-0">
          <BCard class="h-100">
            <BCardTitle>{{ $t('mergeParticipants.selectPrimary') }}</BCardTitle>
            <BCardText>{{ $t('mergeParticipants.selectPrimaryDescription') }}</BCardText>
            <div class="list-group participant-list">
              <div
                v-for="participant in participants"
                :key="participant.id"
                class="list-group-item participant-item"
                :class="{ 'selected-primary': primaryParticipant?.id === participant.id }"
                @click="selectPrimary(participant)"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ participant.first_name }} {{ participant.last_name }}</strong>
                    <br />
                    <small v-if="participant.created_at" class="text-muted fst-italic">
                      {{ $t('common.created') }}: {{ new Date(participant.created_at).toLocaleDateString() }}
                    </small>
                    <br />
                    <small class="text-muted">
                      {{ participant.registrationCount || 0 }} {{ $t('data.registrations') }}
                    </small>
                    <br />
                    <small v-if="participant.influx" class="text-muted">
                      {{ $t('participants.influx') }}: {{ $t('participants.' + participant.influx.toLowerCase()) }}<br />
                    </small>
                    <small v-if="participant.participant_role" class="text-muted">
                      {{ $t('participants.role') }}: {{ $t('participants.' + (participant.participant_role === 'PHYSIOTHERAPIST' ? 'physiotherapist' : 'volunteer')) }}<br />
                    </small>
                    <small v-if="participant.activity_type_names?.length" class="text-muted activity-types">
                      {{ $t('mergeParticipants.registeredFor') }}: {{ participant.activity_type_names.join(', ') }}<br />
                    </small>
                  </div>
                  <i v-if="primaryParticipant?.id === participant.id" class="bi bi-check-circle-fill text-success h4"></i>
                </div>
              </div>
            </div>
          </BCard>
        </BCol>
        
        <BCol md="6">
          <BCard class="h-100">
            <BCardTitle>{{ $t('mergeParticipants.selectToMerge') }}</BCardTitle>
            <BCardText>{{ $t('mergeParticipants.selectToMergeDescription') }}</BCardText>
            <div class="list-group participant-list">
              <div
                v-for="participant in nonPrimaryParticipants"
                :key="participant.id"
                class="list-group-item participant-item"
                :class="{ 'selected-merge': selectedToMerge.includes(participant.id) }"
                @click="toggleMerge(participant)"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ participant.first_name }} {{ participant.last_name }}</strong>
                    <br />
                    <small v-if="participant.created_at" class="text-muted fst-italic">
                      {{ $t('common.created') }}: {{ new Date(participant.created_at).toLocaleDateString() }}
                    </small>
                    <br />
                    <small class="text-muted">
                      {{ participant.registrationCount || 0 }} {{ $t('data.registrations') }}
                    </small>
                    <br />
                    <small v-if="participant.influx" class="text-muted">
                      {{ $t('participants.influx') }}: {{ $t('participants.' + participant.influx.toLowerCase()) }}<br />
                    </small>
                    <small v-if="participant.participant_role" class="text-muted">
                      {{ $t('participants.role') }}: {{ $t('participants.' + (participant.participant_role === 'PHYSIOTHERAPIST' ? 'physiotherapist' : 'volunteer')) }}<br />
                    </small>
                    <small v-if="participant.activity_type_names?.length" class="text-muted activity-types">
                      {{ $t('mergeParticipants.registeredFor') }}: {{ participant.activity_type_names.join(', ') }}<br />
                    </small>
                  </div>
                  <div v-if="selectedToMerge.includes(participant.id)" class="d-flex align-items-center gap-2">
                    <i class="bi bi-check-circle-fill text-primary h4"></i>
                  </div>
                </div>
              </div>
            </div>
          </BCard>
        </BCol>
      </BRow>
      
      <div class="text-center mt-4 mb-4">
        <BButton
          variant="primary"
          size="lg"
          :disabled="!canMerge"
          @click="executeMerge"
        >
          <i class="bi bi-union"></i>
          {{ $t('mergeParticipants.mergeButton') }}
        </BButton>
      </div>

      <!-- Confirmation Modal -->
      <BModal v-model="showConfirmModal" :title="$t('mergeParticipants.confirmTitle')" :ok-title="$t('mergeParticipants.confirmOk')" :cancel-title="$t('common.cancel')" @ok="confirmMerge">
        <p>{{ $t('mergeParticipants.confirmMessage', { 
          primary: primaryParticipant ? `${primaryParticipant.first_name} ${primaryParticipant.last_name}` : '',
          count: selectedToMerge.length
        }) }}</p>
      </BModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BBreadcrumb, BBreadcrumbItem, BCard, BCardTitle, BCardText, BSpinner, BRow, BCol, BButton, BModal } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'
import type { Participant } from '../types'
import { useApi } from '../composables/api'

useI18n()
const route = useRoute()
const router = useRouter()
const { participants: apiParticipants } = useApi()

const loading = ref(true)
const participants = ref<Participant[]>([])
const primaryParticipant = ref<Participant | null>(null)
const selectedToMerge = ref<string[]>([])
const showConfirmModal = ref(false)

const nonPrimaryParticipants = computed(() => {
  return participants.value.filter(p => p.id !== primaryParticipant.value?.id)
})

const canMerge = computed(() => {
  return primaryParticipant.value !== null && selectedToMerge.value.length > 0
})

const selectPrimary = (participant: Participant) => {
  primaryParticipant.value = participant
  // Remove the newly selected primary from the merge list if it was there
  selectedToMerge.value = selectedToMerge.value.filter(id => id !== participant.id)
}

const toggleMerge = (participant: Participant) => {
  const index = selectedToMerge.value.indexOf(participant.id)
  if (index > -1) {
    selectedToMerge.value.splice(index, 1)
  } else {
    selectedToMerge.value.push(participant.id)
  }
}


const executeMerge = () => {
  if (!primaryParticipant.value || selectedToMerge.value.length === 0) return
  showConfirmModal.value = true
}

const confirmMerge = async () => {
  if (!primaryParticipant.value || selectedToMerge.value.length === 0) return
  
  try {
    await apiParticipants.merge(primaryParticipant.value.id, selectedToMerge.value)
    // Navigate back to home page after successful merge
    router.push('/')
  } catch (error) {
    console.error('Error merging participants:', error)
  }
}

const fetchParticipants = async () => {
  const idsParam = route.query.ids as string
  if (idsParam) {
    const ids = idsParam.split(',')
    participants.value = await apiParticipants.fetchForMergeByIds(ids)
  }
  loading.value = false
}

onMounted(() => {
  fetchParticipants()
})
</script>

<style scoped>
.participant-list {
  max-height: 400px;
  overflow-y: auto;
}

.participant-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.participant-item:hover {
  background-color: #f8f9fa;
  border-left-color: #0d6efd;
}

.participant-item.selected-primary {
  background-color: #d1e7dd;
  border-left-color: #198754;
}

.participant-item.selected-merge {
  background-color: #cfe2ff;
  border-left-color: #0d6efd;
}

.activity-types {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
