export interface ActivityType {
  id: string
  name: string
  description: string
  created_at: string
}

export interface Activity {
  id: string
  activity_type_id: string
  date: string
  created_at: string
  activity_assignees?: ActivityAssignee[]
}

export interface Participant {
  id: string
  first_name: string
  last_name: string
  activity_types: string[]
  participant_role: 'PHYSIOTHERAPIST' | 'VOLUNTEER' | null
  created_at: string
}

export interface ParticipantActivityType {
  id: string
  participant_id: string
  activity_type_id: string
  created_at: string
}

export interface Registration {
  participant_id: string
  activity_id: string
  created_at: string
  participant: Participant
}

export interface ActivityAssignee {
  id: string
  activity_id: string
  participant_id: string
  created_at: string
  participant: Participant
}