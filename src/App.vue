<template>
  <BApp>
    <head>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="MyWebSite" />
      <link rel="manifest" href="/site.webmanifest" />
    </head>
    <div v-if="isLoggingOut" class="logout-overlay">
      <div class="logout-spinner">
        <BSpinner variant="primary" />
        <p class="mt-2">{{ $t('logout.loggingOut') }}</p>
      </div>
    </div>
    <BNavbar v-if="user" toggleable="lg" type="light" variant="primary" class="mb-3">
      <BNavbarBrand to="/">
        <img
          style="max-height: 75px;"
          src="/logo.png"
          alt="Kitten"
        />
      </BNavbarBrand>
      <BNavbarToggle target="nav-collapse" />
      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav>
          <BNavItem to="/activities">{{ $t('nav.activities') }}</BNavItem>
          <BNavItem v-if="showActivityTypes" to="/activity_types">{{ $t('nav.activityTypes') }}</BNavItem>
          <BNavItem to="/participants">{{ $t('nav.participants') }}</BNavItem>
        </BNavbarNav>
        <BNavbarNav class="ms-auto">
          <BButtonGroup>
            <BDropdown>
              <template #button-content> <i class="bi bi-person-fill-check"></i><span class="visually-hidden">User</span> </template>
              <BDropdownItemButton>{{ user.email }}</BDropdownItemButton>
              <BDropdownItemButton @click="logout">{{ $t('app.logout') }}</BDropdownItemButton>
            </BDropdown>
              <BButton variant="secondary" @click="locale = locale === 'nl' ? 'en' : 'nl'">
                {{ locale === 'nl' ? $t('language.switchToEn') : $t('language.switchToNl') }}
            </BButton>
          </BButtonGroup>
        </BNavbarNav>
      </BCollapse>
    </BNavbar>
    <router-view />
  </BApp>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BApp, BSpinner } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'
import { getUser, logout as auth0Logout, isVolunteer } from './auth0'

const user = ref<any>(null)
const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const isLoggingOut = ref(false)

const showActivityTypes = computed(() => !isVolunteer())

const logout = async () => {
  isLoggingOut.value = true
  try {
    await auth0Logout()
  } finally {
    setTimeout(function () {
        isLoggingOut.value = false
    }, 2000);
  }
}

onMounted(async () => {
  user.value = await getUser()
  if (user.value && route.query.redirect) {
    router.push(route.query.redirect as string)
  }
})
</script>

<style>
/* Global styles can be added here */

.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.logout-spinner {
  text-align: center;
  color: white;
}
</style>
