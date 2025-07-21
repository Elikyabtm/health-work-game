"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { GameConfig, GameSession, Player } from "@/app/page"
import { ArrowLeft, Users, Copy, Crown, Play, UserPlus } from "lucide-react"

interface MultiplayerLobbyProps {
  config: GameConfig
  onGameStart: (session: GameSession, player: Player) => void
  onBack: () => void
}

export default function MultiplayerLobby({ config, onGameStart, onBack }: MultiplayerLobbyProps) {
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase())
  const [playerName, setPlayerName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const sessionUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${sessionId}`

  const joinSession = () => {
    if (!playerName.trim()) return

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2),
      name: playerName.trim(),
      score: 0,
      isHost: players.length === 0, // Premier joueur = hôte
    }

    setCurrentPlayer(newPlayer)
    setPlayers([...players, newPlayer])
    setIsHost(newPlayer.isHost || false)
  }

  // Simuler l'arrivée d'autres joueurs
  useEffect(() => {
    if (currentPlayer && players.length === 1) {
      const timer = setTimeout(() => {
        const botNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
        const randomName = botNames[Math.floor(Math.random() * botNames.length)]

        const botPlayer: Player = {
          id: Math.random().toString(36).substring(2),
          name: randomName,
          score: 0,
          isHost: false,
        }

        setPlayers((prev) => [...prev, botPlayer])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, players.length])

  const startGame = () => {
    if (!currentPlayer || players.length < 2) return

    const session: GameSession = {
      id: sessionId,
      config,
      players,
      currentRound: 1,
      currentKeyword: "",
      expectedWords: [],
      roundResults: [],
      gameFinished: false,
    }

    onGameStart(session, currentPlayer)
  }

  const copySessionUrl = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }

  const addBotPlayer = () => {
    if (players.length >= (config.maxPlayers || 6)) return

    const botNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
    const availableNames = botNames.filter((name) => !players.some((player) => player.name === name))

    if (availableNames.length === 0) return

    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)]

    const botPlayer: Player = {
      id: Math.random().toString(36).substring(2),
      name: randomName,
      score: 0,
      isHost: false,
    }

    setPlayers((prev) => [...prev, botPlayer])
  }

  const removePlayer = (playerId: string) => {
    if (!isHost || playerId === currentPlayer?.id) return
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">👥 Salon multijoueur</h1>
            <p className="text-gray-600">
              Code de la partie : <span className="font-mono font-bold text-purple-600">{sessionId}</span>
            </p>
          </div>
        </div>

        {!currentPlayer ? (
          /* Rejoindre la partie */
          <Card>
            <CardHeader>
              <CardTitle>Rejoindre la partie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ton nom ou pseudo..."
                  onKeyPress={(e) => e.key === "Enter" && joinSession()}
                  maxLength={20}
                />
              </div>
              <Button onClick={joinSession} disabled={!playerName.trim()} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Rejoindre la partie
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Partage de la partie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Inviter des joueurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={sessionUrl} readOnly className="font-mono text-sm" />
                  <Button onClick={copySessionUrl} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copySuccess && <p className="text-sm text-green-600 mt-2">✅ Lien copié dans le presse-papiers !</p>}
                <p className="text-sm text-gray-600 mt-2">
                  Partage ce lien avec tes amis pour qu'ils rejoignent la partie
                </p>
              </CardContent>
            </Card>

            {/* Liste des joueurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Joueurs connectés ({players.length}/{config.maxPlayers || 6})
                  </span>
                  {isHost && players.length < (config.maxPlayers || 6) && (
                    <Button onClick={addBotPlayer} size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Ajouter un bot
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.isHost && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Hôte
                          </Badge>
                        )}
                        {player.id === currentPlayer.id && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600">
                            C'est toi
                          </Badge>
                        )}
                      </div>
                      {isHost && player.id !== currentPlayer.id && (
                        <Button
                          onClick={() => removePlayer(player.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {players.length < 2 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>En attente d'autres joueurs...</p>
                    <p className="text-sm">Minimum 2 joueurs requis</p>
                    {isHost && <p className="text-sm mt-2">💡 Tu peux ajouter des bots pour tester</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration de la partie */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Thème :</span>
                    <span className="ml-2 font-medium">{config.theme}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temps :</span>
                    <span className="ml-2 font-medium">{config.timeLimit}s</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Manches :</span>
                    <span className="ml-2 font-medium">{config.numberOfRounds}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Réponses :</span>
                    <span className="ml-2 font-medium">
                      {config.showAnswers === "after-round" ? "Après chaque manche" : "À la fin"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Démarrer la partie */}
            {isHost && (
              <Button onClick={startGame} disabled={players.length < 2} className="w-full" size="lg">
                <Play className="h-5 w-5 mr-2" />
                Démarrer la partie ({players.length} joueurs)
              </Button>
            )}

            {!isHost && (
              <div className="text-center py-4 text-gray-500">
                <p>En attente que l'hôte démarre la partie...</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
