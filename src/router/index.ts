import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'
import Home from '../views/Home.vue'
import AuthenticationError from '../views/AuthenticationError.vue'
import ActivityTypes from '../views/ActivityTypes.vue'
import Activities from '../views/Activities.vue'
import Participants from '../views/Participants.vue'
import Registrations from '../views/Registrations.vue'
import Data from '../views/Data.vue'
import NotFound from '../views/NotFound.vue'
import { getUser } from '../auth0'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
    meta: { requiresAuth: false },
  },
  {
    path: '/public',
    name: 'AuthenticationError',
    component: AuthenticationError,
    meta: { requiresAuth: false },
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
  const user = await getUser()
  if (to.meta.requiresAuth && !user) {
    next({ path: '/login', query: { redirect: to.path } })
  } else {
    next()
  }
})

export default router