import {
    addParticipant,
    updateParticipant,
    deleteParticipant,
    fetchParticipants
} from '../api/participants'

import {
    fetchActivities,
    fetchActivity,
    addActivity,
    updateActivity,
    updateActivityComment,
    deleteActivity
} from '../api/activities'

import {
    fetchActivityTypes,
    addActivityType,
    updateActivityType,
    deleteActivityType
} from '../api/activityTypes'

import {
    fetchRegistrations,
    addRegistration,
    deleteRegistration,
    fetchRegistrationsByParticipant,
    getActivityTypeStats
} from '../api/registrations'

import {
  fetchActivityAssignees,
  addActivityAssignee,
  deleteActivityAssignee,
  fetchUsers
} from '../api/activityAssignees'

import { supabase } from '../supabase'
import { useToast } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const fetchData = async () => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, activities(*, activity_types(*)), participants(*)')
  if (error) throw error
  return data || []
}

export const useApi = () => {
  const toast = useToast()
  const { t } = useI18n()
  const isErrorToastActive = ref(false)

  const withToast = <T>(promise: Promise<T>): Promise<T> => {
    const timer = setTimeout(() => {
      toast.create({
        title: t('toast.slowNetwork.title'),
        body: t('toast.slowNetwork.body'),
        variant: 'warning',
        position: 'bottom-center'
      })
    }, 3000)
    return promise.finally(() => clearTimeout(timer)).catch((error) => {
      if (!isErrorToastActive.value) {
        isErrorToastActive.value = true
        toast.create({
          title: t('toast.error.title'),
          body: t('toast.error.body'),
          variant: 'danger',
          position: 'bottom-center'
        })
        // Reset the flag after a short delay to allow subsequent errors if needed
        setTimeout(() => {
          isErrorToastActive.value = false
        }, 3000) // Adjust delay as needed
      }
      throw error
    })
  }
  return {
        withToast,
        participants: {
            add: (firstName: string, lastName: string, activityTypes?: string[], participantRole?: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null) => withToast(addParticipant(firstName, lastName, activityTypes, participantRole)),
            update: (id: string, firstName: string, lastName: string, activityTypes?: string[], participantRole?: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null) => withToast(updateParticipant(id, firstName, lastName, activityTypes, participantRole)),
            delete: (id: string) => withToast(deleteParticipant(id)),
            fetch: (activityTypeId?: string) => withToast(fetchParticipants(activityTypeId)),
            fetchAll: () => withToast(fetchParticipants())
        },
        activities: {
            fetch: () => withToast(fetchActivities()),
            fetchOne: (id: string) => withToast(fetchActivity(id)),
            add: (activityTypeId: string, date: string) => withToast(addActivity(activityTypeId, date)),
            update: (id: string, activityTypeId: string, date: string) => withToast(updateActivity(id, activityTypeId, date)),
            updateComment: (id: string, comment: string) => withToast(updateActivityComment(id, comment)),
            delete: (id: string) => withToast(deleteActivity(id))
        },
        activityTypes: {
            fetch: () => withToast(fetchActivityTypes()),
            add: (name: string, description: string) => withToast(addActivityType(name, description)),
            update: (id: string, name: string, description: string) => withToast(updateActivityType(id, name, description)),
            delete: (id: string) => withToast(deleteActivityType(id))
        },
        registrations: {
            fetch: (activityId: string) => withToast(fetchRegistrations(activityId)),
            add: (participantId: string, activityId: string) => withToast(addRegistration(participantId, activityId)),
            delete: (participantId: string, activityId: string) => withToast(deleteRegistration(participantId, activityId)),
            fetchByParticipant: (participantId: string) => withToast(fetchRegistrationsByParticipant(participantId)),
            getActivityTypeStats: (startDate?: string, endDate?: string) => withToast(getActivityTypeStats(startDate, endDate))
        },
        activityAssignees: {
            fetch: (activityId: string) => withToast(fetchActivityAssignees(activityId)),
            add: (participantId: string, activityId: string) => withToast(addActivityAssignee(participantId, activityId)),
            delete: (participantId: string, activityId: string) => withToast(deleteActivityAssignee(participantId, activityId)),
            fetchUsers: () => withToast(fetchUsers())
        },
        data: {
            fetch: () => withToast(fetchData())
        }
    }
}