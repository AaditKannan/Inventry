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
          display_name: string | null
          team_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          team_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          team_id?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          city: string | null
          region: string | null
          lat: number | null
          lng: number | null
          visibility: 'public' | 'private'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          city?: string | null
          region?: string | null
          lat?: number | null
          lng?: number | null
          visibility?: 'public' | 'private'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string | null
          region?: string | null
          lat?: number | null
          lng?: number | null
          visibility?: 'public' | 'private'
          created_by?: string | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          team_id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          is_default?: boolean
          created_at?: string
        }
      }
      parts: {
        Row: {
          id: string
          sku: string | null
          name: string
          description: string | null
          manufacturer: string | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          sku?: string | null
          name: string
          description?: string | null
          manufacturer?: string | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          sku?: string | null
          name?: string
          description?: string | null
          manufacturer?: string | null
          tags?: string[] | null
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          team_id: string
          part_id: string
          quantity: number
          condition: 'new' | 'used' | 'broken'
          location_id: string | null
          lendable: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          part_id: string
          quantity?: number
          condition?: 'new' | 'used' | 'broken'
          location_id?: string | null
          lendable?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          part_id?: string
          quantity?: number
          condition?: 'new' | 'used' | 'broken'
          location_id?: string | null
          lendable?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          requester_team_id: string
          owner_team_id: string
          part_id: string
          quantity: number
          status: 'pending' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled'
          needed_by: string | null
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_team_id: string
          owner_team_id: string
          part_id: string
          quantity: number
          status?: 'pending' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled'
          needed_by?: string | null
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_team_id?: string
          owner_team_id?: string
          part_id?: string
          quantity?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled'
          needed_by?: string | null
          message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          request_id: string
          part_id: string
          quantity: number
          status: 'in_transit' | 'delivered' | 'returned' | 'lost' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          part_id: string
          quantity: number
          status?: 'in_transit' | 'delivered' | 'returned' | 'lost' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          part_id?: string
          quantity?: number
          status?: 'in_transit' | 'delivered' | 'returned' | 'lost' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          team_id: string
          actor: string
          entity_type: string
          entity_id: string | null
          action: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          actor: string
          entity_type: string
          entity_id?: string | null
          action: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          actor?: string
          entity_type?: string
          entity_id?: string | null
          action?: string
          meta?: Json | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          team_id: string
          vendor: string | null
          raw_file_path: string | null
          parsed: Json
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          vendor?: string | null
          raw_file_path?: string | null
          parsed?: Json
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          vendor?: string | null
          raw_file_path?: string | null
          parsed?: Json
          created_at?: string
        }
      }
    }
    Views: {
      safe_public_inventory_view: {
        Row: {
          team_id: string
          team_name: string
          city: string | null
          region: string | null
          lat: number | null
          lng: number | null
          total_items: number
          lendable_items: number
          counts_by_tag: Json
        }
      }
    }
  }
}
