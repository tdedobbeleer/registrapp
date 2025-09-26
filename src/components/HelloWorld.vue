<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{ msg: string }>()

const count = ref(0)
const { t } = useI18n()
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">{{ $t('helloWorld.count') }} {{ count }}</button>
    <p>
      {{ $t('helloWorld.edit') }}
      <code>{{ $t('helloWorld.components') }}</code> {{ $t('helloWorld.hmr') }}
    </p>
  </div>

  <p>
    {{ $t('helloWorld.checkOut') }}
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >{{ $t('helloWorld.createVue') }}</a
    >, {{ $t('helloWorld.starter') }}
  </p>
  <p>
    {{ $t('helloWorld.learnMore') }}
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >{{ $t('helloWorld.vueDocs') }}</a
    >.
  </p>
  <p class="read-the-docs">{{ $t('helloWorld.clickLogos') }}</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
