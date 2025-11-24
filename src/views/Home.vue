<template>
  <div class="container mt-3">
    <BRow>
      <BCol cols="12" class="text-center mb-2">
        <h1>{{ $t('home.welcome') }}</h1>
        <p class="lead">{{ $t('home.description') }}</p>
      </BCol>
    </BRow>

    <!-- Flow Chart Layout -->
    <div class="flow-chart">
      <!-- Activity Types Card (conditionally shown) -->
      <div v-if="showActivityTypes" class="flow-step">
        <BCard class="flow-card" :img-src="'https://images.unsplash.com/photo-1614667288602-9ac6e37318a7?w=300&h=150&fit=crop'" :img-alt="$t('home.activityTypesAlt')" lazy>
          <BCardTitle>{{ $t('nav.activityTypes') }}</BCardTitle>
          <BCardText>{{ $t('home.activityTypesDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activity_types'">{{ $t('home.viewActivityTypes') }}</BButton>
          </template>
        </BCard>
        <h1 class="bi bi-arrow-down-square"></h1>
      </div>

      <!-- Activities Card -->
      <div class="flow-step">
        <BCard class="flow-card" :img-src="'https://images.unsplash.com/photo-1585757318177-0570a997dc3a?w=300&h=150&fit=crop'" :img-alt="$t('home.activitiesAlt')" lazy>
          <BCardTitle>{{ $t('nav.activities') }}</BCardTitle>
          <BCardText>
            <I18nT keypath="home.activitiesDescription">
              <!-- enter various i18n slots -->
              <template #addIcon>
                <BButton disabled size="sm"><i class="bi bi-calendar-plus"></i></BButton>
              </template>
            </I18nT>
            </BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activities'">{{ $t('home.viewActivities') }}</BButton>
          </template>
        </BCard>
        <h1 class="bi bi-arrow-down-square"></h1>
      </div>

      <!-- Registrations Card -->
      <div class="flow-step">
        <BCard class="flow-card" :img-src="'https://images.unsplash.com/vector-1741203969096-deda346274e8?w=300&h=150&fit=crop'" :img-alt="$t('home.registrationsAlt')" lazy>
          <BCardTitle>{{ $t('nav.registrations') }}</BCardTitle>
          <BCardText>
            <I18nT keypath="home.registrationsDescription">
              <template #registrationsIcon>
                <BButton variant="outline-info" disabled size="sm"><i class="bi bi-list-check"></i></BButton>
              </template>
            </I18nT>
          </BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activities'">{{ $t('home.viewRegistrations') }}</BButton>
          </template>
        </BCard>
        <h1 class="bi bi-arrow-down-square"></h1>
      </div>

      <!-- Participants Card -->
      <div class="flow-step">
        <BCard class="flow-card" :img-src="'https://images.unsplash.com/photo-1548705085-101177834f47?w=300&h=150&fit=crop'" :img-alt="$t('home.participantsAlt')" lazy>
          <BCardTitle>{{ $t('nav.participants') }}</BCardTitle>
          <BCardText>{{ $t('home.participantsDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/participants'">{{ $t('home.viewParticipants') }}</BButton>
          </template>
        </BCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BRow, BCol, BCard, BCardTitle, BCardText, BButton } from 'bootstrap-vue-next'
import { I18nT } from 'vue-i18n'
import { getUser, hasPermission, PERMISSIONS } from '../auth0'

const user = ref<any>(null)
const showActivityTypes = ref(false)

onMounted(async () => {
  user.value = await getUser()
  showActivityTypes.value = await hasPermission(PERMISSIONS.CRUD_ACTIVITY_TYPES)
})
</script>

<style scoped>
.flow-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.flow-card {
  width: 100%;
  max-width: 400px;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 576px) {
  .flow-card {
    max-width: 350px;
  }

  .arrow-icon {
    font-size: 2.5rem;
  }
}
</style>