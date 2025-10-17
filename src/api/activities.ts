import { supabase } from '../supabase'
import type { Activity } from '../types'
import { useErrorHandler } from '../composables/useErrorHandler'

const { handleApiError } = useErrorHandler()

export const fetchActivities = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })
    if (error) {
        throw new Error(handleApiError(error, 'fetching activities'))
    } else {
        return data || []
    }
}

export const fetchActivity = async (id: string): Promise<Activity> => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single()
    if (error) {
        throw new Error(handleApiError(error, 'fetching activity'))
    } else {
        return data
    }
}

export const addActivity = async (activityTypeId: string, date: string) => {
    const { data, error } = await supabase
        .from('activities')
        .insert([{ activity_type_id: activityTypeId, date }])
        .select()
    if (error) {
        throw new Error(handleApiError(error, 'adding activity'))
    } else {
        return data?.[0]
    }
}

export const updateActivity = async (id: string, activityTypeId: string, date: string) => {
    const { error } = await supabase
        .from('activities')
        .update({ activity_type_id: activityTypeId, date })
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'updating activity'))
    }
}

export const deleteActivity = async (id: string) => {
    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'deleting activity'))
    }
}