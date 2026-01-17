import { supabase } from '../supabase'
import type { Registration } from '../types'

export const fetchRegistrations = async (activityId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*, participants(*)')
        .eq('activity_id', activityId)
    if (error) {
        console.error('Error fetching registrations:', error)
        throw error
    } else {
        return data || []
    }
}

export const addRegistration = async (participantId: string, activityId: string): Promise<Registration | undefined> => {
    const { data, error } = await supabase
        .from('registrations')
        .insert([{ participant_id: participantId, activity_id: activityId }])
        .select('*, participants(*)')
        if (error) {
        console.error('Error adding registration:', error)
        throw error
    } else {
        return data?.[0]
    }
}

export const deleteRegistration = async (participantId: string, activityId: string) => {
    const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('participant_id', participantId)
        .eq('activity_id', activityId)
    if (error) {
        console.error('Error deleting registration:', error)
        throw error
    }
}

export const fetchRegistrationsByParticipant = async (participantId: string): Promise<Registration[]> => {
    const { data, error } = await supabase
        .from('registrations')
        .select('*, participants(*)')
        .eq('participant_id', participantId)
    if (error) {
        console.error('Error fetching registrations by participant:', error)
        throw error
    } else {
        return data || []
    }
}

export const getActivityTypeStats = async (startDate?: string, endDate?: string) => {
    const params: any = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    const { data, error } = await supabase.rpc('get_activity_type_stats', params)
    if (error) {
        console.error('Error fetching activity type stats:', error)
        throw error
    } else {
        return data || []
    }
}