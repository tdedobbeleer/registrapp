import { supabase } from '../supabase'
import type { ActivityType } from '../types'
import { useErrorHandler } from '../composables/useErrorHandler'

const { handleApiError } = useErrorHandler()

export const fetchActivityTypes = async (): Promise<ActivityType[]> => {
    const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .order('name', { ascending: true })
    if (error) {
        throw new Error(handleApiError(error, 'fetching activity types'))
    } else {
        return data || []
    }
}

export const addActivityType = async (name: string, description: string) => {
    const { data, error } = await supabase
        .from('activity_types')
        .insert([{ name, description }])
        .select()
    if (error) {
        throw new Error(handleApiError(error, 'adding activity type'))
    } else {
        return data?.[0]
    }
}

export const updateActivityType = async (id: string, name: string, description: string) => {
    const { error } = await supabase
        .from('activity_types')
        .update({ name, description })
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'updating activity type'))
    }
}

export const deleteActivityType = async (id: string) => {
    const { error } = await supabase
        .from('activity_types')
        .delete()
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'deleting activity type'))
    }
}