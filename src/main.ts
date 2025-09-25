import { createApp } from 'vue'
import 'bootswatch/dist/minty/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
//import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
