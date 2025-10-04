import { supabase } from '../supabase'
import type { Registration } from '../types'

export const fetchRegistrations = async (activityId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('activity_id', activityId)
    if (error) {
        console.error('Error fetching registrations:', error)
        throw error
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
        console.error('Error adding registration:', error)
        throw error
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
        console.error('Error deleting registration:', error)
        throw error
    }
}

export const fetchRegistrationsByParticipant = async (participantId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('participant_id', participantId)
    if (error) {
        console.error('Error fetching registrations by participant:', error)
        throw error
    } else {
        return data || []
    }
}