<template>
  <BApp>
    <BNavbar v-if="user" toggleable="lg" type="light" variant="primary" class="mb-3">
      <BNavbarBrand to="/">{{ $t('app.brand') }}</BNavbarBrand>
      <BNavbarToggle target="nav-collapse" />
      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav>
          <BNavItem to="/activities">{{ $t('nav.activities') }}</BNavItem>
          <BNavItem to="/activity_types">{{ $t('nav.activityTypes') }}</BNavItem>
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
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'
import { useRouter } from 'vue-router'
import { BApp } from 'bootstrap-vue-next'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useI18n } from 'vue-i18n'

const user = ref<User | null>(null)
const router = useRouter()
const { locale } = useI18n()

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
})

supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
  user.value = session?.user || null
})
</script>

<style>
/* Global styles can be added here */
</style>
