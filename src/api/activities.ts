import { supabase } from '../supabase'
import type { Activity } from '../types'

export const fetchActivities = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
        .from('activities')
        .select('*, activity_assignees(participant:participants(*))')
        .order('date', { ascending: false })
    if (error) {
        console.error('Error fetching activities:', error)
        throw error
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
        console.error('Error fetching activity:', error)
        throw error
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
        console.error('Error adding activity:', error)
        throw error
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
        console.error('Error updating activity:', error)
        throw error
    }
}

export const updateActivityComment = async (id: string, comment: string) => {
    const { data, error } = await supabase
        .from('activities')
        .update({ comment })
        .eq('id', id)
    if (error) {
        console.error('Error updating activity comment:', error)
        throw error
    } else {
        return data
    }
}

export const deleteActivity = async (id: string) => {
    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
    if (error) {
        console.error('Error deleting activity:', error)
        throw error
    }
}