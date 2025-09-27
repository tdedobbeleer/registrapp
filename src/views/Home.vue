<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12 text-center mb-5">
        <h1>{{ $t('home.welcome') }}</h1>
        <p class="lead">{{ $t('home.description') }}</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 col-lg-3 mb-4">
        <BCard img-src="https://images.unsplash.com/photo-1614667288602-9ac6e37318a7?w=400&h=250&fit=crop" :img-alt="$t('home.activityTypesAlt')" img-top class="h-100">
          <BCardTitle>{{ $t('nav.activityTypes') }}</BCardTitle>
          <BCardText>{{ $t('home.activityTypesDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activity_types'">{{ $t('home.viewActivityTypes') }}</BButton>
          </template>
        </BCard>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <BCard img-src="https://images.unsplash.com/photo-1585757318177-0570a997dc3a?w=400&h=250&fit=crop" :img-alt="$t('home.activitiesAlt')" img-top class="h-100">
          <BCardTitle>{{ $t('nav.activities') }}</BCardTitle>
          <BCardText>{{ $t('home.activitiesDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activities'">{{ $t('home.viewActivities') }}</BButton>
          </template>
        </BCard>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <BCard img-src="https://images.unsplash.com/vector-1741203969096-deda346274e8?w=400&h=250&fit=crop" :img-alt="$t('home.registrationsAlt')" img-top class="h-100">
          <BCardTitle>{{ $t('nav.registrations') }}</BCardTitle>
          <BCardText>{{ $t('home.registrationsDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/activities'">{{ $t('home.viewRegistrations') }}</BButton>
          </template>
        </BCard>
      </div>
            <div class="col-md-6 col-lg-3 mb-4">
        <BCard img-src="https://images.unsplash.com/photo-1548705085-101177834f47?w=400&h=250&fit=crop" :img-alt="$t('home.participantsAlt')" img-top class="h-100">
          <BCardTitle>{{ $t('nav.participants') }}</BCardTitle>
          <BCardText>{{ $t('home.participantsDescription') }}</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/participants'">{{ $t('home.viewParticipants') }}</BButton>
          </template>
        </BCard>
      </div>
      <div class="col-md-6 col-lg-3 mb-4">
        <BCard img-src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop" :img-alt="$t('nav.data')" img-top class="h-100">
          <BCardTitle>{{ $t('nav.data') }}</BCardTitle>
          <BCardText>View and export registration data with filters.</BCardText>
          <template #footer>
            <BButton variant="primary" :to="'/data'">View Data</BButton>
          </template>
        </BCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed
</script>

<style scoped>
/* Additional styles if needed */
</style>