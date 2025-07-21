import { createClient } from "@supabase/supabase-js"

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is not defined")
}

if (!supabaseKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
}

// Créer le client Supabase seulement si les variables sont définies
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Types pour la base de données
export interface GameRoom {
  id: string
  config: any
  players: any[]
  current_round: number
  current_keyword: string
  expected_words: string[]
  round_results: any[]
  game_finished: boolean
  created_at: string
  updated_at: string
}

export interface PlayerAnswer {
  id: string
  room_id: string
  player_id: string
  player_name: string
  round: number
  words: string[]
  submitted_at: string
}

// Fonction utilitaire pour vérifier si Supabase est disponible
export const isSupabaseAvailable = () => {
  return supabase !== null
}
