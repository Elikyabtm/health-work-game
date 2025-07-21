"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { GameConfig, Player } from "@/app/page"
import { ArrowLeft, Copy, Crown, Play, UserPlus, AlertCircle } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"

interface RealMultiplayerLobbyProps {
  config: GameConfig
  onGameStart: (roomId: string, player: Player) => void
  onBack: () => void
}

export default function RealMultiplayerLobby({ config, onGameStart, onBack }: RealMultiplayerLobbyProps) {
  const [roomId, setRoomId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Si Supabase n’est pas dispo
  if (!isSupabaseAvailable()) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">👥 Multijoueur</h1>
              <p className="text-gray-600">Configuration requise</p>
            </div>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Configuration Supabase requise
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="mb-4">
                Pour utiliser le mode multijoueur, vous devez configurer Supabase avec les variables d'environnement :
              </p>
              <div className="bg-red-100 p-4 rounded-lg font-mono text-sm mb-4">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
              </div>
              <p>💡 En attendant, vous pouvez utiliser le mode Solo ou Créatif.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 🔁 Abonnement en temps réel
  useEffect(() => {
    if (!roomId || !currentPlayer) return
    const unsubscribe = subscribeToRoom(roomId)
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [roomId, currentPlayer])

  // ✅ S'abonner aux mises à jour de la room
  const subscribeToRoom = (targetRoomId: string) => {
    if (!supabase) return

    const channel = supabase
      .channel(`room-${targetRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${targetRoomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as any
          console.log("🎯 Mise à jour reçue :", updatedRoom)
          setPlayers(updatedRoom.players || [])

          if (updatedRoom.current_keyword && !updatedRoom.game_finished) {
            onGameStart(targetRoomId, currentPlayer!)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Créer une room
  const createRoom = async () => {
    if (!playerName.trim() || !supabase) return

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2),
      name: playerName.trim(),
      score: 0,
      isHost: true,
    }

    try {
      const { error } = await supabase.from("game_rooms").insert({
        id: newRoomId,
        config,
        players: [newPlayer],
        current_round: 1,
        current_keyword: "",
        expected_words: [],
        round_results: [],
        game_finished: false,
      })

      if (error) throw error

      setRoomId(newRoomId)
      setCurrentPlayer(newPlayer)
      setPlayers([newPlayer])
      setIsHost(true)
    } catch (error) {
      console.error("Erreur lors de la création de la room:", error)
      alert("Erreur lors de la création de la partie")
    }
  }

  // Rejoindre une room
  const joinRoom = async (targetRoomId: string) => {
    if (!playerName.trim() || !targetRoomId.trim() || !supabase) return
    setIsJoining(true)

    try {
      const { data: room, error: fetchError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", targetRoomId.toUpperCase())
        .single()

      if (fetchError || !room) {
        alert("Partie non trouvée")
        setIsJoining(false)
        return
      }

      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2),
        name: playerName.trim(),
        score: 0,
        isHost: false,
      }

      const updatedPlayers = [...room.players, newPlayer]

      const { error: updateError } = await supabase
        .from("game_rooms")
        .update({ players: updatedPlayers })
        .eq("id", targetRoomId.toUpperCase())

      if (updateError) throw updateError

      setRoomId(targetRoomId.toUpperCase())
      setCurrentPlayer(newPlayer)
      setPlayers(updatedPlayers)
      setIsHost(false)
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      alert("Erreur lors de la connexion à la partie")
    }

    setIsJoining(false)
  }

  // Démarrer la partie
  const startGame = async () => {
    if (!isHost || !roomId || players.length < 2 || !supabase) return

    try {
      const { error } = await supabase
        .from("game_rooms")
        .update({
          current_keyword: "GAME_STARTED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)

      if (error) throw error
    } catch (error) {
      console.error("Erreur lors du démarrage:", error)
      alert("Erreur lors du démarrage de la partie")
    }
  }

  // Copier l'URL
  const copyRoomUrl = async () => {
    const url = `${window.location.origin}?join=${roomId}`

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (error) {
        console.error("Erreur lors de la copie :", error)
        alert("Erreur lors de la copie automatique.")
      }
    } else {
      window.prompt("Copie manuellement ce lien :", url)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">👥 Multijoueur</h1>
            <p className="text-gray-600">Jouez avec de vrais joueurs en ligne</p>
          </div>
        </div>

        {!currentPlayer ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ton nom</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ton nom ou pseudo..."
                  maxLength={20}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Créer une partie</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={createRoom} disabled={!playerName.trim()} className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Créer une nouvelle partie
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rejoindre une partie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    placeholder="Code de la partie (ex: ABC123)"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button
                    onClick={() => joinRoom(roomId)}
                    disabled={!playerName.trim() || !roomId.trim() || isJoining}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isJoining ? "Connexion..." : "Rejoindre"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Partie {roomId}</span>
                  <Button onClick={copyRoomUrl} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {copySuccess && <p className="text-sm text-green-600 mb-2">✅ Lien copié !</p>}
                <p className="text-sm text-gray-600">
                  Partage ce code avec tes amis : <span className="font-mono font-bold">{roomId}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Joueurs connectés ({players.length}/{config.maxPlayers || 6})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.isHost && (
                          <Badge variant="secondary">
                            <Crown className="h-3 w-3 mr-1" />
                            Hôte
                          </Badge>
                        )}
                        {player.id === currentPlayer?.id && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600">
                            Toi
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {players.length < 2 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>En attente d'autres joueurs...</p>
                    <p className="text-sm">Minimum 2 joueurs requis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isHost ? (
              <Button onClick={startGame} disabled={players.length < 2} className="w-full" size="lg">
                <Play className="h-5 w-5 mr-2" />
                Démarrer la partie ({players.length} joueurs)
              </Button>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>En attente que l'hôte démarre la partie...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
