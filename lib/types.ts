export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          whatsapp: string | null
          zone: string | null
          level: number | null
          sports: string[] | null
          padel_category: string | null
          tennis_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          whatsapp?: string | null
          zone?: string | null
          level?: number | null
          sports?: string[] | null
          padel_category?: string | null
          tennis_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          whatsapp?: string | null
          zone?: string | null
          level?: number | null
          sports?: string[] | null
          padel_category?: string | null
          tennis_level?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      matches: {
        Row: {
          id: string
          organizer_id: string
          sport: string
          starts_at: string
          zone: string
          location_text: string
          total_slots: number
          price_per_person: number | null
          status: 'open' | 'canceled' | 'finished'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          sport: string
          starts_at: string
          zone: string
          location_text: string
          total_slots: number
          price_per_person?: number | null
          status?: 'open' | 'canceled' | 'finished'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          sport?: string
          starts_at?: string
          zone?: string
          location_text?: string
          total_slots?: number
          price_per_person?: number | null
          status?: 'open' | 'canceled' | 'finished'
          created_at?: string
          updated_at?: string
        }
      }

      match_players: {
        Row: {
          match_id: string
          user_id: string
          role: 'signed_up' | 'substitute'
          joined_at: string
          canceled_at: string | null
          confirmed_at: string | null
        }
        Insert: {
          match_id: string
          user_id: string
          role: 'signed_up' | 'substitute'
          joined_at?: string
          canceled_at?: string | null
          confirmed_at?: string | null
        }
        Update: {
          match_id?: string
          user_id?: string
          role?: 'signed_up' | 'substitute'
          joined_at?: string
          canceled_at?: string | null
          confirmed_at?: string | null
        }
      }
    }

    Functions: {
      join_match: {
        Args: {
          p_match_id: string
          p_prefer_substitute?: boolean
        }
        Returns: string
      }
      leave_match: {
        Args: {
          p_match_id: string
        }
        Returns: void
      }
      confirm_attendance: {
        Args: {
          p_match_id: string
        }
        Returns: void
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type MatchPlayer = Database['public']['Tables']['match_players']['Row']

export type MatchWithOrganizer = Match & {
  organizer: Profile
}

export type MatchWithPlayers = Match & {
  organizer: Profile
  players: (MatchPlayer & { profile: Profile })[]
}

