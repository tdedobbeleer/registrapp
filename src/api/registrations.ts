import { supabase } from '../supabase'
import type { Registration } from '../types'
import { useErrorHandler } from '../composables/useErrorHandler'

const { handleApiError } = useErrorHandler()

export const fetchRegistrations = async (activityId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('activity_id', activityId)
    if (error) {
        throw new Error(handleApiError(error, 'fetching registrations'))
    } else {
        return data || []
    }
}

export const addRegistration = async (participantId: string, activityId: string) => {
    const { data, error } = await supabase
        .from('registrations')
        .insert([{ participant_id: participantId, activity_id: activityId }])
        .select()
    if (error) {
        throw new Error(handleApiError(error, 'adding registration'))
    } else {
        return data?.[0]
    }
}

export const deleteRegistration = async (id: string) => {
    const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'deleting registration'))
    }
}

export const fetchRegistrationsByParticipant = async (participantId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('participant_id', participantId)
    if (error) {
        throw new Error(handleApiError(error, 'fetching registrations by participant'))
    } else {
        return data || []
    }
}