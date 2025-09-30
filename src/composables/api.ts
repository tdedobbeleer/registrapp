import {
    addParticipant,
    updateParticipant,
    deleteParticipant,
    fetchParticipants,
    fetchParticipantsSimple
} from '../api/participants'

import {
    fetchActivities,
    fetchActivity,
    addActivity,
    updateActivity,
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
    updateRegistration,
    fetchRegistrationsByParticipant
} from '../api/registrations'

export const useApi = () => {
    return {
        participants: {
            add: addParticipant,
            update: updateParticipant,
            delete: deleteParticipant,
            fetch: fetchParticipants,
            fetchSimple: fetchParticipantsSimple
        },
        activities: {
            fetch: fetchActivities,
            fetchOne: fetchActivity,
            add: addActivity,
            update: updateActivity,
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
            update: updateRegistration,
            fetchByParticipant: fetchRegistrationsByParticipant
        }
    }
}