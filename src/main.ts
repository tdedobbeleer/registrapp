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

const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
  messages: {
    nl,
    en
  }
})

createApp(App).use(router).use(i18n).mount('#app')
