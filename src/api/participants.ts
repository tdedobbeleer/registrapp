import { supabase } from '../supabase'
import type { Participant, ParticipantActivityType } from '../types'

// Levenshtein distance function
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, () => new Array(a.length + 1).fill(0))
  
    for (let i = 0; i <= a.length; i += 1) {
      matrix[0]![i] = i
    }
  
    for (let j = 0; j <= b.length; j += 1) {
      matrix[j]![0] = j
    }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j]![i] = Math.min(
        matrix[j]![i - 1]! + 1, // deletion
        matrix[j - 1]![i]! + 1, // insertion
        matrix[j - 1]![i - 1]! + indicator // substitution
      )
    }
  }

  return matrix[b.length]![a.length]!
}

export const findSimilarParticipants = async (firstName: string, lastName: string): Promise<Participant[]> => {
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
    console.error('Error fetching participants:', error)
    throw error
  }

  const fullName = `${firstName} ${lastName}`.toLowerCase()
  const similarParticipants: Participant[] = []

  for (const participant of data || []) {
    const participantFullName = `${participant.first_name} ${participant.last_name}`.toLowerCase()
    const distance = levenshteinDistance(fullName, participantFullName)
    const maxLength = Math.max(fullName.length, participantFullName.length)
    const similarity = 1 - (distance / maxLength)

    // Consider similar if similarity is above 0.7 (70%) and distance is small
    if (similarity > 0.7 || distance <= 2) {
      similarParticipants.push({
        ...participant,
        activity_types: (participant.participant_activity_types as ParticipantActivityType[] || []).map(pat => pat.activity_type_id)
      })
    }
  }

  return similarParticipants
}

export const addParticipant = async (firstName: string, lastName: string, activityTypes: string[] = [], participantRole: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null = null, influx: 'WGC' | 'BOV' | 'PHYSIO' | 'OTHER' | 'UNKNOWN' | null = null) => {
    const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([{ first_name: firstName, last_name: lastName, participant_role: participantRole, influx: influx }])
        .select()
        .single()
    if (participantError) {
        console.error('Error adding participant:', participantError)
        throw participantError
    } else if (participantData) {
        if (activityTypes.length > 0) {
            const { error: patError } = await supabase
                .from('participant_activity_types')
                .insert(activityTypes.map(atId => ({ participant_id: participantData.id, activity_type_id: atId })))
            if (patError) {
                console.error('Error adding participant activity types:', patError)
                throw patError
            }
        }
        return participantData
    }
}

export const updateParticipant = async (id: string, firstName: string, lastName: string, activityTypes: string[] = [], participantRole: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null = null, influx: 'WGC' | 'BOV' | 'PHYSIO' | 'OTHER' | 'UNKNOWN' | null = null) => {
    const { error: updateError } = await supabase
        .from('participants')
        .update({ first_name: firstName, last_name: lastName, participant_role: participantRole, influx: influx })
        .eq('id', id)
    if (updateError) {
        console.error('Error updating participant:', updateError)
        throw updateError
    }
    // Delete old activity types
    const { error: deleteError } = await supabase
        .from('participant_activity_types')
        .delete()
        .eq('participant_id', id)
    if (deleteError) {
        console.error('Error deleting old participant activity types:', deleteError)
        throw deleteError
    }
    // Insert new activity types
    if (activityTypes.length > 0) {
        const { error: insertError } = await supabase
            .from('participant_activity_types')
            .insert(activityTypes.map(atId => ({ participant_id: id, activity_type_id: atId })))
        if (insertError) {
            console.error('Error inserting new participant activity types:', insertError)
            throw insertError
        }
    }
}

export const addActivityTypeToParticipant = async (participantId: string, activityTypeId: string) => {
    const { error } = await supabase
        .from('participant_activity_types')
        .insert([{ participant_id: participantId, activity_type_id: activityTypeId }])
    if (error) {
        console.error('Error adding activity type to participant:', error)
        throw error
    }
}

export const deleteParticipant = async (id: string) => {
    // First delete from junction table
    const { error: patError } = await supabase
        .from('participant_activity_types')
        .delete()
        .eq('participant_id', id)
    if (patError) {
        console.error('Error deleting participant activity types:', patError)
        throw patError
    }
    // Then delete participant
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)
    if (error) {
        console.error('Error deleting participant:', error)
        throw error
    }
}

export const findDuplicateParticipants = async (): Promise<{ first_name: string, last_name: string, count: number }[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('first_name, last_name')

  if (error) {
    console.error('Error fetching participants for duplicates:', error)
    throw error
  }

  const duplicates: { [key: string]: number } = {}
  data?.forEach(p => {
    const key = `${p.first_name.toLowerCase()}_${p.last_name.toLowerCase()}`
    duplicates[key] = (duplicates[key] || 0) + 1
  })

  return Object.entries(duplicates)
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => {
      const [first, last] = key.split('_')
      return { first_name: first!, last_name: last!, count }
    })
}

export const fetchParticipants = async (activityTypeId?: string): Promise<Participant[]> => {
  if (activityTypeId) {
    // First, get participant_ids that have the activity_type
    const { data: patData, error: patError } = await supabase
      .from('participant_activity_types')
      .select('participant_id')
      .eq('activity_type_id', activityTypeId)
    if (patError) {
      console.error('Error fetching participant activity types:', patError)
      throw patError
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
      console.error('Error fetching participants:', error)
      throw error
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
      console.error('Error fetching participants:', error)
      throw error
    } else {
      return (data || []).map(p => ({
        ...p,
        activity_types: (p.participant_activity_types as ParticipantActivityType[] || []).map(pat => pat.activity_type_id)
      }))
    }
  }
}
