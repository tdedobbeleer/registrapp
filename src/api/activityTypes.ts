import { supabase } from '../supabase'
import type { ActivityType } from '../types'

export const fetchActivityTypes = async (): Promise<ActivityType[]> => {
    const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .order('name', { ascending: true })
    if (error) {
        console.error('Error fetching activity types:', error)
        throw error
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
        console.error('Error adding activity type:', error)
        throw error
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
        console.error('Error updating activity type:', error)
        throw error
    }
}

export const deleteActivityType = async (id: string) => {
    const { error } = await supabase
        .from('activity_types')
        .delete()
        .eq('id', id)
    if (error) {
        console.error('Error deleting activity type:', error)
        throw error
    }
}