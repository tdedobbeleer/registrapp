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
import { handleRedirectCallback } from './auth0'
import { handleRedirectCallback } from './auth0'

const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
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
      router.push(result.appState.returnTo)
      redirectSuccess = true
    }
  } catch (e) {
    // Only log if it's not a "Invalid state" error which can happen on page refresh
    if (!(e instanceof Error) || !e.message.includes('Invalid state')) {
      console.error('Auth0 redirect callback failed:', e)
    }
  }

  // If redirect callback failed or no returnTo, redirect to public page
  if (!redirectSuccess) {
    router.push('/autherror')
  }

createApp(App).use(router).use(i18n).mount('#app')
