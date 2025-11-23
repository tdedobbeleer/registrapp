import { createApp } from 'vue'
import 'bootswatch/dist/minty/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
//import './style.css'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import nl from './locales/nl.json'
import en from './locales/en.json'
import { handleRedirectCallback, getUser } from './auth0'
import { setRealtimeAuth } from './supabase'

const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    nl,
    en
  }
})

;(async () => {
  let redirectSuccess = false
  try {
    const result = await handleRedirectCallback()
    if (result.appState?.returnTo) {
      await setRealtimeAuth()
      router.push(result.appState.returnTo)
      redirectSuccess = true
    }
  } catch (e) {
    // Only log if it's not a "Invalid state" error which can happen on page refresh
    if (!(e instanceof Error) || !e.message.includes('Invalid state')) {
      console.error('Auth0 redirect callback failed:', e)
    }
  }

  // If redirect callback failed or no returnTo, check if user is already logged in
  if (!redirectSuccess) {
    try {
      const user = await getUser()
      if (user) {
        await setRealtimeAuth()
        router.push('/')
      } else {
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== '/login' && !currentPath.startsWith('/logout') && !currentPath.startsWith('/public')) {
          router.push({ path: '/login', query: { redirect: currentPath } })
        } else {
          router.push('/public')
        }
      }
    } catch (e) {
      console.error('Error checking user login status:', e)
      router.push('/public')
    }
  }

  createApp(App).use(router).use(i18n).mount('#app')
})()
