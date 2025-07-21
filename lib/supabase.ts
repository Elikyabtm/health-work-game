import { createClient } from "@supabase/supabase-js"

// ⚠️ Assure-toi que ces variables sont bien définies dans Vercel > Project Settings > Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Créer le client Supabase (même si les variables ne sont pas définies en local, ce sera une erreur visible)
export const supabase = createClient(supabaseUrl, supabaseKey)

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

// Fonction utilitaire
export const isSupabaseAvailable = () => {
  return Boolean(supabaseUrl) && Boolean(supabaseKey)
}
