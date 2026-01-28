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

export const getTotalActivitiesThisYear = async (): Promise<number> => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
    const { count, error } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfYear)
    if (error) {
        console.error('Error counting activities this year:', error)
        throw error
    }
    return count || 0
}

export const getTotalParticipantsLastWeek = async (): Promise<number> => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const { data, error } = await supabase
        .from('registrations')
        .select('participant_id')
        .gte('created_at', oneWeekAgo.toISOString())
    if (error) {
        console.error('Error fetching participants last week:', error)
        throw error
    }
    const unique = new Set(data?.map(r => r.participant_id) || [])
    return unique.size
}

export const getTotalParticipants = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
    if (error) {
        console.error('Error counting participants:', error)
        throw error
    }
    return count || 0
}

export const getTotalRegistrationsThisYear = async (): Promise<number> => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
    const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfYear)
    if (error) {
        console.error('Error counting registrations this year:', error)
        throw error
    }
    return count || 0
}