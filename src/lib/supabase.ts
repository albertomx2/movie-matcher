import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          room_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          name?: string
          created_at?: string
        }
      }
      movies: {
        Row: {
          tmdb_id: number
          data: any
          updated_at: string
        }
        Insert: {
          tmdb_id: number
          data: any
          updated_at?: string
        }
        Update: {
          tmdb_id?: number
          data?: any
          updated_at?: string
        }
      }
      room_movies: {
        Row: {
          id: string
          room_id: string
          tmdb_id: number
          added_by: string
          status: 'pending' | 'seen' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          tmdb_id: number
          added_by: string
          status?: 'pending' | 'seen' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          tmdb_id?: number
          added_by?: string
          status?: 'pending' | 'seen' | 'archived'
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          room_movie_id: string
          user_id: string
          vote: 'like' | 'dislike' | 'maybe'
          created_at: string
        }
        Insert: {
          id?: string
          room_movie_id: string
          user_id: string
          vote: 'like' | 'dislike' | 'maybe'
          created_at?: string
        }
        Update: {
          id?: string
          room_movie_id?: string
          user_id?: string
          vote?: 'like' | 'dislike' | 'maybe'
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          room_movie_id: string
          user_id: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          room_movie_id: string
          user_id: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          room_movie_id?: string
          user_id?: string
          score?: number
          created_at?: string
        }
      }
    }
  }
}
