// Este archivo se generará automáticamente con: npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
// Por ahora, definimos tipos básicos para que compile

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
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          plan: 'hobby' | 'startup' | 'growth'
          trial_ends_at: string | null
          subscription_status: 'active' | 'cancelled' | 'trial'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          plan?: 'hobby' | 'startup' | 'growth'
          trial_ends_at?: string | null
          subscription_status?: 'active' | 'cancelled' | 'trial'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          plan?: 'hobby' | 'startup' | 'growth'
          trial_ends_at?: string | null
          subscription_status?: 'active' | 'cancelled' | 'trial'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

