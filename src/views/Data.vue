<template>
  <div class="container mt-5">
    <BBreadcrumb>
      <BBreadcrumbItem to="/">{{ $t('nav.home') }}</BBreadcrumbItem>
      <BBreadcrumbItem active>{{ $t('nav.data') }}</BBreadcrumbItem>
    </BBreadcrumb>
    <div class="d-md-none mb-3">
      <BListGroup>
        <BListGroupItem :active="selectedView === 'participantData'" @click="selectedView = 'participantData'">{{ $t('data.participantData') }}</BListGroupItem>
        <BListGroupItem :active="selectedView === 'activityTypeData'" @click="selectedView = 'activityTypeData'">{{ $t('data.activityTypeData') }}</BListGroupItem>
        <BListGroupItem :active="selectedView === 'activityTypeStats'" @click="selectedView = 'activityTypeStats'">{{ $t('data.activityTypeStats') }}</BListGroupItem>
      </BListGroup>
    </div>
    <div class="row">
      <div class="col-md-3 d-none d-md-block">
        <BListGroup>
          <BListGroupItem :active="selectedView === 'participantData'" @click="selectedView = 'participantData'">{{ $t('data.participantData') }}</BListGroupItem>
          <BListGroupItem :active="selectedView === 'activityTypeData'" @click="selectedView = 'activityTypeData'">{{ $t('data.activityTypeData') }}</BListGroupItem>
          <BListGroupItem :active="selectedView === 'activityTypeStats'" @click="selectedView = 'activityTypeStats'">{{ $t('data.activityTypeStats') }}</BListGroupItem>
        </BListGroup>
      </div>
      <div class="col-md-9">
        <h1>{{ $t('data.' + selectedView) }}</h1>
        <div v-if="selectedView === 'participantData'">
          <ParticipantData />
        </div>
        <div v-if="selectedView === 'activityTypeData'">
          <ActivityTypeData />
        </div>
        <div v-if="selectedView === 'activityTypeStats'">
          <ActivityTypeStats />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BBreadcrumb, BBreadcrumbItem, BListGroup, BListGroupItem } from 'bootstrap-vue-next'
import ParticipantData from '../components/ParticipantData.vue'
import ActivityTypeData from '../components/ActivityTypeData.vue'
import ActivityTypeStats from '../components/ActivityTypeStats.vue'

const selectedView = ref('participantData')
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>