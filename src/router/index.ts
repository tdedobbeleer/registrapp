import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'
import Home from '../views/Home.vue'
import AuthenticationError from '../views/AuthenticationError.vue'
import NotFound from '../views/NotFound.vue'
import Unauthorized from '../views/Unauthorized.vue'
import { getUser, hasPermission, PERMISSIONS } from '../auth0'

// Lazy-loaded components for better performance
const ActivityTypes = () => import('../views/ActivityTypes.vue')
const Activities = () => import('../views/Activities.vue')
const Participants = () => import('../views/Participants.vue')
const Registrations = () => import('../views/Registrations.vue')
const Data = () => import('../views/Data.vue')

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
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { requiresAuth: true },
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
  try {
    const user = await getUser()
    if (to.meta.requiresAuth && !user) {
      next({ path: '/login', query: { redirect: to.path, expired: 'true' } })
    } else if (to.path === '/activity_types' && !(await hasPermission(PERMISSIONS.CRUD_ACTIVITY_TYPES))) {
      next({ path: '/unauthorized' })
    } else if (to.path === '/data' && !(await hasPermission(PERMISSIONS.READ_DATA))) {
      next({ path: '/unauthorized' })
    } else {
      next()
    }
  } catch (e) {
    console.error('Authentication check failed:', e)
    // If authentication check fails, redirect to login
    next({ path: '/login', query: { redirect: to.path, expired: 'true' } })
  }
})

export default router