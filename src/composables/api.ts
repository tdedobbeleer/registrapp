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

export const useApi = () => {
    return {
        participants: {
            add: addParticipant,
            update: updateParticipant,
            delete: deleteParticipant,
            fetch: fetchParticipants
        },
        activities: {
            fetch: fetchActivities,
            fetchOne: fetchActivity,
            add: addActivity,
            update: updateActivity,
            updateComment: updateActivityComment,
            delete: deleteActivity
        },
        activityTypes: {
            fetch: fetchActivityTypes,
            add: addActivityType,
            update: updateActivityType,
            delete: deleteActivityType
        },
        registrations: {
            fetch: fetchRegistrations,
            add: addRegistration,
            delete: deleteRegistration,
            fetchByParticipant: fetchRegistrationsByParticipant
        },
        activityAssignees: {
            fetch: fetchActivityAssignees,
            add: addActivityAssignee,
            delete: deleteActivityAssignee,
            fetchUsers: fetchUsers
        }
    }
}