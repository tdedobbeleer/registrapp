import { supabase } from '../supabase'
import type { ActivityAssignee } from '../types'

export const fetchActivityAssignees = async (activityId: string): Promise<ActivityAssignee[]> => {
    const { data, error } = await supabase
        .from('activity_assignees')
        .select('*, participants(*)')
        .eq('activity_id', activityId)
    if (error) {
        console.error('Error fetching activity assignees:', error)
        throw error
    } else {
        return data || []
    }
}

export const addActivityAssignee = async (participantId: string, activityId: string) => {
    const { data, error } = await supabase
        .from('activity_assignees')
        .insert([{ participant_id: participantId, activity_id: activityId }])
        .select()
    if (error) {
        console.error('Error adding activity assignee:', error)
        throw error
    } else {
        return data?.[0]
    }
}

export const deleteActivityAssignee = async (participantId: string, activityId: string) => {
    const { error } = await supabase
        .from('activity_assignees')
        .delete()
        .eq('participant_id', participantId)
        .eq('activity_id', activityId)
    if (error) {
        console.error('Error deleting activity assignee:', error)
        throw error
    }
}

export const fetchUsers = async (): Promise<ActivityAssignee['participant'][]> => {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .in('participant_role', ['PHYSIOTHERAPIST', 'VOLUNTEER'])
        .order('first_name')
    if (error) {
        console.error('Error fetching users:', error)
        throw error
    } else {
        return data || []
    }
}