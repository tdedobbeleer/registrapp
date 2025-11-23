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
    fetchRegistrationsByParticipant
} from '../api/registrations'

import {
  fetchActivityAssignees,
  addActivityAssignee,
  deleteActivityAssignee,
  fetchUsers
} from '../api/activityAssignees'

import { useToast } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'

export const useApi = () => {
  const toast = useToast()
  const { t } = useI18n()

  const withSlowToast = <T>(promise: Promise<T>): Promise<T> => {
    const timer = setTimeout(() => {
      toast.show({
        title: t('toast.slowNetwork.title'),
        body: t('toast.slowNetwork.body'),
        position: "bottom-center",
        variant: 'warning'
      })
    }, 3000)
    return promise.finally(() => clearTimeout(timer))
  }
  return {
        participants: {
            add: (firstName: string, lastName: string, activityTypes?: string[], participantRole?: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null) => withSlowToast(addParticipant(firstName, lastName, activityTypes, participantRole)),
            update: (id: string, firstName: string, lastName: string, activityTypes?: string[], participantRole?: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null) => withSlowToast(updateParticipant(id, firstName, lastName, activityTypes, participantRole)),
            delete: (id: string) => withSlowToast(deleteParticipant(id)),
            fetch: (activityTypeId?: string) => withSlowToast(fetchParticipants(activityTypeId))
        },
        activities: {
            fetch: () => withSlowToast(fetchActivities()),
            fetchOne: (id: string) => withSlowToast(fetchActivity(id)),
            add: (activityTypeId: string, date: string) => withSlowToast(addActivity(activityTypeId, date)),
            update: (id: string, activityTypeId: string, date: string) => withSlowToast(updateActivity(id, activityTypeId, date)),
            updateComment: (id: string, comment: string) => withSlowToast(updateActivityComment(id, comment)),
            delete: (id: string) => withSlowToast(deleteActivity(id))
        },
        activityTypes: {
            fetch: () => withSlowToast(fetchActivityTypes()),
            add: (name: string, description: string) => withSlowToast(addActivityType(name, description)),
            update: (id: string, name: string, description: string) => withSlowToast(updateActivityType(id, name, description)),
            delete: (id: string) => withSlowToast(deleteActivityType(id))
        },
        registrations: {
            fetch: (activityId: string) => withSlowToast(fetchRegistrations(activityId)),
            add: (participantId: string, activityId: string) => withSlowToast(addRegistration(participantId, activityId)),
            delete: (participantId: string, activityId: string) => withSlowToast(deleteRegistration(participantId, activityId)),
            fetchByParticipant: (participantId: string) => withSlowToast(fetchRegistrationsByParticipant(participantId))
        },
        activityAssignees: {
            fetch: (activityId: string) => withSlowToast(fetchActivityAssignees(activityId)),
            add: (participantId: string, activityId: string) => withSlowToast(addActivityAssignee(participantId, activityId)),
            delete: (participantId: string, activityId: string) => withSlowToast(deleteActivityAssignee(participantId, activityId)),
            fetchUsers: () => withSlowToast(fetchUsers())
        }
    }
}