import { supabase } from '../supabase'
import type { Participant, ParticipantActivityType } from '../types'

// This function fetches detailed participant data for merging - includes activity type names and registration counts
export const fetchParticipantsForMergeByIds = async (ids: string[]): Promise<Participant[]> => {
    if (ids.length === 0) return []
    
    const { data, error } = await supabase
        .from('participants')
        .select(`
            *,
            participant_activity_types (
                activity_type_id,
                activity_types (
                    id,
                    name
                )
            )
        `)
        .in('id', ids)
        .order('first_name', { ascending: true })
    
    if (error) {
        console.error('Error fetching participants for merge:', error)
        throw error
    }
    
    const participants = (data || []).map(p => ({
        ...p,
        activity_types: (p.participant_activity_types as ParticipantActivityType[] || []).map(pat => pat.activity_type_id),
        activity_type_names: (p.participant_activity_types as any[] || []).map(pat => pat.activity_types?.name).filter(Boolean)
    }))
    
    // Fetch registration counts for each participant
    const registrationCounts: Record<string, number> = {}
    for (const participant of participants) {
        const { count, error: countError } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('participant_id', participant.id)
        
        if (countError) {
            console.error('Error fetching registration count:', countError)
            registrationCounts[participant.id] = 0
        } else {
            registrationCounts[participant.id] = count || 0
        }
    }
    
    // Add registration count to each participant
    return participants.map(p => ({
        ...p,
        registrationCount: registrationCounts[p.id] || 0
    }))
}

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

export const mergeParticipants = async (primaryId: string, secondaryIds: string[]) => {
    // Get existing activity types for primary participant
    const { data: primaryActivityTypes, error: primaryAtError } = await supabase
        .from('participant_activity_types')
        .select('activity_type_id')
        .eq('participant_id', primaryId)
    
    if (primaryAtError) {
        console.error('Error fetching primary activity types:', primaryAtError)
        throw primaryAtError
    }
    
    const primaryActivityTypeIds = new Set((primaryActivityTypes || []).map(at => at.activity_type_id))
    
    // Get primary participant data for influx and role
    const { data: primaryData, error: primaryDataError } = await supabase
        .from('participants')
        .select('influx, participant_role')
        .eq('id', primaryId)
        .single()
    
    if (primaryDataError) {
        console.error('Error fetching primary participant data:', primaryDataError)
        throw primaryDataError
    }
    
    let primaryInflux = primaryData?.influx
    let primaryRole = primaryData?.participant_role
    
    // Copy activity types, registrations, influx, and role from secondary participants to primary participant
    for (const secondaryId of secondaryIds) {
        // Get secondary participant data
        const { data: secondaryData, error: secondaryDataError } = await supabase
            .from('participants')
            .select('influx, participant_role')
            .eq('id', secondaryId)
            .single()
        
        if (!secondaryDataError && secondaryData) {
            // Copy influx if primary doesn't have it (is null, empty, or UNKNOWN) and secondary has a valid value
            const shouldCopyInflux = !primaryInflux || primaryInflux === 'UNKNOWN'
            if (shouldCopyInflux && secondaryData.influx && secondaryData.influx !== 'UNKNOWN') {
                primaryInflux = secondaryData.influx
            }
            // Copy role if primary doesn't have it and secondary does
            if (!primaryRole && secondaryData.participant_role) {
                primaryRole = secondaryData.participant_role
            }
        }
        
        // Get activity types for the secondary participant
        const { data: secondaryActivityTypes, error: atError } = await supabase
            .from('participant_activity_types')
            .select('activity_type_id')
            .eq('participant_id', secondaryId)
        
        if (atError) {
            console.error('Error fetching activity types for secondary participant:', atError)
        } else if (secondaryActivityTypes && secondaryActivityTypes.length > 0) {
            // Copy each activity type that the primary doesn't already have
            for (const at of secondaryActivityTypes) {
                if (!primaryActivityTypeIds.has(at.activity_type_id)) {
                    const { error: insertError } = await supabase
                        .from('participant_activity_types')
                        .insert({ participant_id: primaryId, activity_type_id: at.activity_type_id })
                    
                    if (insertError) {
                        console.error('Error copying activity type:', insertError)
                    } else {
                        primaryActivityTypeIds.add(at.activity_type_id)
                    }
                }
            }
        }
        
        // Get all registrations for the secondary participant
        const { data: regs, error: regError } = await supabase
            .from('registrations')
            .select('*')
            .eq('participant_id', secondaryId)
        
        if (regError) {
            console.error('Error fetching registrations for secondary participant:', regError)
            continue
        }
        
        if (regs && regs.length > 0) {
            // Copy each registration to the primary participant if it doesn't exist
            for (const reg of regs) {
                // Check if registration already exists for primary participant
                const { data: existing } = await supabase
                    .from('registrations')
                    .select('*')
                    .eq('participant_id', primaryId)
                    .eq('activity_id', reg.activity_id)
                    .single()
                
                if (!existing) {
                    // Insert the registration for the primary participant
                    const { error: insertError } = await supabase
                        .from('registrations')
                        .insert({ participant_id: primaryId, activity_id: reg.activity_id })
                    
                    if (insertError) {
                        console.error('Error copying registration:', insertError)
                    }
                }
            }
        }
    }
    
    // Update primary participant with merged influx and role
    const { error: updateError } = await supabase
        .from('participants')
        .update({ influx: primaryInflux, participant_role: primaryRole })
        .eq('id', primaryId)
    
    if (updateError) {
        console.error('Error updating primary participant:', updateError)
        throw updateError
    }
    
    // Delete the secondary participants
    for (const secondaryId of secondaryIds) {
        await deleteParticipant(secondaryId)
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

export const findDuplicateParticipants = async (): Promise<{ first_name: string, last_name: string, count: number, ids: string[] }[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('id, first_name, last_name')

  if (error) {
    console.error('Error fetching participants for duplicates:', error)
    throw error
  }

  const duplicates: { [key: string]: { count: number, ids: string[], first_name: string, last_name: string } } = {}
  data?.forEach(p => {
    const key = `${p.first_name.toLowerCase()}_${p.last_name.toLowerCase()}`
    if (!duplicates[key]) {
      duplicates[key] = { count: 0, ids: [], first_name: p.first_name, last_name: p.last_name }
    }
    duplicates[key].count += 1
    duplicates[key].ids.push(p.id)
  })

  return Object.entries(duplicates)
    .filter(([_, data]) => data.count > 1)
    .map(([, data]) => ({
      first_name: data.first_name,
      last_name: data.last_name,
      count: data.count,
      ids: data.ids
    }))
}

// Find participants with similar names (using Levenshtein distance) that are not exact duplicates
export const findSimilarParticipantNames = async (): Promise<{ name: string, names: string[], ids: string[] }[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('id, first_name, last_name')
    .order('first_name', { ascending: true })

  if (error) {
    console.error('Error fetching participants for similarity check:', error)
    throw error
  }

  const participants = data || []
  const processed = new Set<string>()
  const similarGroups: { name: string, names: string[], ids: string[] }[] = []

  for (let i = 0; i < participants.length; i++) {
    const p1 = participants[i]!
    if (processed.has(p1.id)) continue

    const group: { name: string, id: string }[] = [{ name: `${p1.first_name} ${p1.last_name}`, id: p1.id }]
    const p1FullName = `${p1.first_name} ${p1.last_name}`.toLowerCase()

    for (let j = i + 1; j < participants.length; j++) {
      const p2 = participants[j]!
      if (processed.has(p2.id)) continue

      const p2FullName = `${p2.first_name} ${p2.last_name}`.toLowerCase()
      const distance = levenshteinDistance(p1FullName, p2FullName)
      const maxLength = Math.max(p1FullName.length, p2FullName.length)
      const similarity = 1 - (distance / maxLength)

      // Consider similar if similarity is above 0.7 (70%) and distance is small, but not exact match
      if (similarity > 0.7 || distance <= 2) {
        group.push({ name: `${p2.first_name} ${p2.last_name}`, id: p2.id })
        processed.add(p2.id)
      }
    }

    if (group.length > 1) {
      processed.add(p1.id)
      // Sort by first_name for consistent display
      group.sort((a, b) => a.name.localeCompare(b.name))
      const names = group.map(g => g.name)
      const ids = group.map(g => g.id)
      // Use the first name as the main reference
      const mainName = group[0]?.name || 'Unknown'
      similarGroups.push({ name: mainName, names, ids })
    }
  }

  return similarGroups
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
