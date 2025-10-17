import { supabase } from '../supabase'
import type { Participant, ParticipantActivityType } from '../types'
import { useErrorHandler } from '../composables/useErrorHandler'

const { handleApiError } = useErrorHandler()

export const addParticipant = async (firstName: string, lastName: string, activityTypes: string[] = []) => {
    const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([{ first_name: firstName, last_name: lastName }])
        .select()
        .single()
    if (participantError) {
        throw new Error(handleApiError(participantError, 'adding participant'))
    } else if (participantData) {
        if (activityTypes.length > 0) {
            const { error: patError } = await supabase
                .from('participant_activity_types')
                .insert(activityTypes.map(atId => ({ participant_id: participantData.id, activity_type_id: atId })))
            if (patError) {
                throw new Error(handleApiError(patError, 'adding participant activity types'))
            }
        }
        return participantData
    }
}

export const updateParticipant = async (id: string, firstName: string, lastName: string, activityTypes: string[] = []) => {
    const { error: updateError } = await supabase
        .from('participants')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', id)
    if (updateError) {
        throw new Error(handleApiError(updateError, 'updating participant'))
    }
    // Delete old activity types
    const { error: deleteError } = await supabase
        .from('participant_activity_types')
        .delete()
        .eq('participant_id', id)
    if (deleteError) {
        throw new Error(handleApiError(deleteError, 'deleting old participant activity types'))
    }
    // Insert new activity types
    if (activityTypes.length > 0) {
        const { error: insertError } = await supabase
            .from('participant_activity_types')
            .insert(activityTypes.map(atId => ({ participant_id: id, activity_type_id: atId })))
        if (insertError) {
            throw new Error(handleApiError(insertError, 'inserting new participant activity types'))
        }
    }
}

export const deleteParticipant = async (id: string) => {
    // First delete from junction table
    const { error: patError } = await supabase
        .from('participant_activity_types')
        .delete()
        .eq('participant_id', id)
    if (patError) {
        throw new Error(handleApiError(patError, 'deleting participant activity types'))
    }
    // Then delete participant
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)
    if (error) {
        throw new Error(handleApiError(error, 'deleting participant'))
    }
}

export const fetchParticipants = async (activityTypeId?: string): Promise<Participant[]> => {
  if (activityTypeId) {
    // First, get participant_ids that have the activity_type
    const { data: patData, error: patError } = await supabase
      .from('participant_activity_types')
      .select('participant_id')
      .eq('activity_type_id', activityTypeId)
    if (patError) {
      throw new Error(handleApiError(patError, 'fetching participant activity types'))
    }
    const participantIds = (patData || []).map(pat => pat.participant_id)
    if (participantIds.length === 0) {
      return []
    }
    // Then fetch participants with their activity_types
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        participant_activity_types (
          activity_type_id
        )
      `)
      .in('id', participantIds)
      .order('first_name', { ascending: true })
    if (error) {
      throw new Error(handleApiError(error, 'fetching participants'))
    } else {
      return (data || []).map(p => ({
        ...p,
        activity_types: (p.participant_activity_types as ParticipantActivityType[] || []).map(pat => pat.activity_type_id)
      }))
    }
  } else {
    // Fetch all participants
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        participant_activity_types (
          activity_type_id
        )
      `)
      .order('first_name', { ascending: true })
    if (error) {
      throw new Error(handleApiError(error, 'fetching participants'))
    } else {
      return (data || []).map(p => ({
        ...p,
        activity_types: (p.participant_activity_types as ParticipantActivityType[] || []).map(pat => pat.activity_type_id)
      }))
    }
  }
}
