export interface Tour {
  id: string
  name: string
  plan: string
  start_date: string
  end_date: string
  guides: string
  info?: string
  created_at: string
  updated_at: string
}

export interface TourWithParticipants extends Tour {
  participants: Participant[]
}

export interface TourCreate {
  name: string
  plan: string
  start_date: string
  end_date: string
  guides: string
  info?: string
}

export interface TourUpdate {
  name?: string
  plan?: string
  start_date?: string
  end_date?: string
  guides?: string
  info?: string
}

export interface Participant {
  id: string
  tour_id: string
  name: string
  surname: string
  paid_amount: number
  birth_date: string | null
  phone_number: string
  email: string | null
  created_at: string
  updated_at: string
}

export interface ParticipantCreate {
  tour_id: string
  name: string
  surname: string
  paid_amount: number
  birth_date: string
  phone_number: string
  email: string
}


export interface ParticipantUpdate {
  tour_id?: string
  name?: string
  surname?: string
  paid_amount?: number
  birth_date?: string
  phone_number?: string
  email?: string
}

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  full_name: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
