import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import PasswordRecovery from '../views/PasswordRecovery.vue'
import Home from '../views/Home.vue'
import ActivityTypes from '../views/ActivityTypes.vue'
import Activities from '../views/Activities.vue'
import Participants from '../views/Participants.vue'
import Registrations from '../views/Registrations.vue'
import Data from '../views/Data.vue'
import NotFound from '../views/NotFound.vue'
import { supabase } from '../supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/password-recovery',
    name: 'PasswordRecovery',
    component: PasswordRecovery
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/activity_types',
    name: 'ActivityTypes',
    component: ActivityTypes,
    meta: { requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { requiresAuth: true }
  },
  {
    path: '/participants',
    name: 'Participants',
    component: Participants,
    meta: { requiresAuth: true }
  },
  {
    path: '/registrations/:activityId',
    name: 'Registrations',
    component: Registrations,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/data',
    name: 'Data',
    component: Data,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router