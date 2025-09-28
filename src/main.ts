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

const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
  messages: {
    nl,
    en
  }
})

;(async () => {
  try {
    await handleRedirectCallback()
  } catch (e) {
    console.error('Auth0 redirect callback failed:', e)
  }
  createApp(App).use(router).use(i18n).mount('#app')
})()
