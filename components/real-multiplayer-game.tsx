"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Player } from "@/app/page"
import { Clock, Users, Target, Trophy, Eye, EyeOff, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getRandomKeyword, findMatchingWords } from "@/lib/enhanced-game-data"

interface RealMultiplayerGameProps {
  roomId: string
  player: Player
  onGameEnd: () => void
  onBack: () => void
}

export default function RealMultiplayerGame({ roomId, player, onGameEnd, onBack }: RealMultiplayerGameProps) {
  const [gameRoom, setGameRoom] = useState<any>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [currentDefinition, setCurrentDefinition] = useState("")
  const [expectedWords, setExpectedWords] = useState<string[]>([])
  const [playerWords, setPlayerWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [roundActive, setRoundActive] = useState(true)
  const [allPlayersWords, setAllPlayersWords] = useState<{ [playerId: string]: string[] }>({})
  const [commonWords, setCommonWords] = useState<string[]>([])
  const [showExpected, setShowExpected] = useState(false)
  const [playerScores, setPlayerScores] = useState<{ [playerId: string]: number }>({})
  const [isHost, setIsHost] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Charger les données de la room
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const { data: room, error } = await supabase.from("game_rooms").select("*").eq("id", roomId).single()

        if (error) throw error
        if (!room) {
          alert("Partie introuvable")
          onBack()
          return
        }

        setGameRoom(room)
        setCurrentRound(room.current_round || 1)
        setIsHost(room.players.some((p: Player) => p.id === player.id && p.isHost))

        // Si la partie a déjà un mot-clé, charger l'état
        if (room.current_keyword && room.current_keyword !== "GAME_STARTED") {
          setCurrentKeyword(room.current_keyword)
          setExpectedWords(room.expected_words || [])
          setCurrentDefinition(room.definition || "")

          // Vérifier si le joueur a déjà soumis des mots
          const { data: answers } = await supabase
            .from("player_answers")
            .select("*")
            .eq("room_id", roomId)
            .eq("round", room.current_round)
            .eq("player_id", player.id)
            .single()

          if (answers) {
            setPlayerWords(answers.words || [])
          }
        } else if (isHost) {
          // Si c'est l'hôte et qu'il n'y a pas de mot-clé, en générer un
          startNewRound()
        }

        // Configurer les scores initiaux
        const initialScores: { [playerId: string]: number } = {}
        room.players.forEach((p: Player) => {
          initialScores[p.id] = p.score || 0
        })
        setPlayerScores(initialScores)

        // S'abonner aux changements
        subscribeToRoom()
      } catch (error) {
        console.error("Erreur lors du chargement de la partie:", error)
        alert("Erreur lors du chargement de la partie")
        onBack()
      }
    }

    loadRoom()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [roomId, player.id])

  // S'abonner aux changements en temps réel
  const subscribeToRoom = () => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as any

          // Mettre à jour l'état du jeu
          setGameRoom(updatedRoom)
          setCurrentRound(updatedRoom.current_round || 1)

          // Si le mot-clé a changé
          if (updatedRoom.current_keyword && updatedRoom.current_keyword !== currentKeyword) {
            setCurrentKeyword(updatedRoom.current_keyword)
            setExpectedWords(updatedRoom.expected_words || [])
            setCurrentDefinition(updatedRoom.definition || "")
            setRoundActive(true)
            setTimeLeft(60) // Réinitialiser le timer
            setPlayerWords([])
            setCurrentInput("")
            setShowExpected(false)
            setShowNextButton(false)

            // Démarrer le timer
            startTimer()
          }

          // Si la manche est terminée
          if (updatedRoom.round_active === false && roundActive) {
            endRound()
          }

          // Si la partie est terminée
          if (updatedRoom.game_finished) {
            onGameEnd()
          }
        },
      )
      .subscribe()

    // S'abonner aux réponses des joueurs
    const answersChannel = supabase
      .channel(`answers-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_answers",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Recharger les réponses quand il y a des changements
          if (!roundActive) {
            loadPlayerAnswers()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(answersChannel)
    }
  }

  // Charger les réponses des joueurs
  const loadPlayerAnswers = async () => {
    try {
      const { data: answers, error } = await supabase
        .from("player_answers")
        .select("*")
        .eq("room_id", roomId)
        .eq("round", currentRound)

      if (error) throw error

      // Organiser les réponses par joueur
      const playerAnswers: { [playerId: string]: string[] } = {}
      answers.forEach((answer) => {
        playerAnswers[answer.player_id] = answer.words || []
      })
      setAllPlayersWords(playerAnswers)

      // Calculer les mots communs
      calculateCommonWords(playerAnswers)
    } catch (error) {
      console.error("Erreur lors du chargement des réponses:", error)
    }
  }

  // Calculer les mots communs
  const calculateCommonWords = (playerAnswers: { [playerId: string]: string[] }) => {
    const wordFrequency: { [word: string]: { count: number; players: string[] } } = {}

    Object.entries(playerAnswers).forEach(([playerId, words]) => {
      words.forEach((word) => {
        const normalizedWord = word.toLowerCase().trim()

        // Chercher si ce mot existe déjà (avec tolérance)
        let foundExisting = false
        for (const [existingWord, data] of Object.entries(wordFrequency)) {
          if (findMatchingWords([normalizedWord], [existingWord]).length > 0) {
            data.count++
            data.players.push(playerId)
            foundExisting = true
            break
          }
        }

        if (!foundExisting) {
          wordFrequency[normalizedWord] = { count: 1, players: [playerId] }
        }
      })
    })

    // Mots communs = présents chez au moins 2 joueurs
    const common = Object.keys(wordFrequency).filter((word) => wordFrequency[word].count >= 2)
    setCommonWords(common)

    // Calculer les scores
    const roundScores: { [playerId: string]: number } = {}
    Object.keys(playerAnswers).forEach((playerId) => {
      const playerWordsForRound = playerAnswers[playerId] || []
      const playerCommonWords = common.filter((commonWord) =>
        playerWordsForRound.some((playerWord) => findMatchingWords([playerWord], [commonWord]).length > 0),
      )
      roundScores[playerId] = playerCommonWords.length
    })

    // Mettre à jour les scores si on est l'hôte
    if (isHost) {
      updateScores(roundScores)
    }
  }

  // Mettre à jour les scores
  const updateScores = async (roundScores: { [playerId: string]: number }) => {
    if (!gameRoom) return

    try {
      // Mettre à jour les scores des joueurs
      const updatedPlayers = gameRoom.players.map((p: Player) => ({
        ...p,
        score: (p.score || 0) + (roundScores[p.id] || 0),
      }))

      await supabase.from("game_rooms").update({ players: updatedPlayers }).eq("id", roomId)
    } catch (error) {
      console.error("Erreur lors de la mise à jour des scores:", error)
    }
  }

  // Démarrer le timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isHost) {
            endRoundForAll()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Générer un nouveau mot-clé
  const startNewRound = async () => {
    if (!isHost) return

    try {
      const { keyword, words, definition } = getRandomKeyword(gameRoom?.config?.theme || "all")

      // Mettre à jour la room avec le nouveau mot-clé
      await supabase
        .from("game_rooms")
        .update({
          current_keyword: keyword,
          expected_words: words,
          definition: definition,
          round_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)

      setCurrentKeyword(keyword)
      setExpectedWords(words)
      setCurrentDefinition(definition)
      setRoundActive(true)
      setTimeLeft(60)
      setPlayerWords([])
      setCurrentInput("")
      setShowExpected(false)
      setShowNextButton(false)

      startTimer()
    } catch (error) {
      console.error("Erreur lors du démarrage d'une nouvelle manche:", error)
    }
  }

  // Ajouter un mot
  const addWord = () => {
    const word = currentInput.trim()
    if (word && !playerWords.some((existing) => existing.toLowerCase() === word.toLowerCase())) {
      const newPlayerWords = [...playerWords, word]
      setPlayerWords(newPlayerWords)
      setCurrentInput("")

      // Sauvegarder les mots du joueur
      savePlayerWords(newPlayerWords)
    }
  }

  // Sauvegarder les mots du joueur
  const savePlayerWords = async (words: string[]) => {
    try {
      const { data, error } = await supabase
        .from("player_answers")
        .select("*")
        .eq("room_id", roomId)
        .eq("round", currentRound)
        .eq("player_id", player.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found, c'est normal si c'est la première sauvegarde
        throw error
      }

      if (data) {
        // Mettre à jour
        await supabase.from("player_answers").update({ words }).eq("id", data.id)
      } else {
        // Insérer
        await supabase.from("player_answers").insert({
          room_id: roomId,
          player_id: player.id,
          player_name: player.name,
          round: currentRound,
          words,
        })
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des mots:", error)
    }
  }

  // Gérer l'appui sur Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWord()
    }
  }

  // Terminer la manche pour tous les joueurs
  const endRoundForAll = async () => {
    if (!isHost) return

    try {
      await supabase
        .from("game_rooms")
        .update({
          round_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
    } catch (error) {
      console.error("Erreur lors de la fin de la manche:", error)
    }
  }

  // Terminer la manche localement
  const endRound = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setRoundActive(false)
    setShowNextButton(true)
    loadPlayerAnswers()
  }

  // Passer à la manche suivante
  const goToNextRound = async () => {
    if (!isHost) return

    try {
      if (currentRound < (gameRoom?.config?.numberOfRounds || 10)) {
        // Passer à la manche suivante
        await supabase
          .from("game_rooms")
          .update({
            current_round: currentRound + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomId)

        // Démarrer une nouvelle manche
        startNewRound()
      } else {
        // Fin du jeu
        await supabase
          .from("game_rooms")
          .update({
            game_finished: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomId)

        onGameEnd()
      }
    } catch (error) {
      console.error("Erreur lors du passage à la manche suivante:", error)
    }
  }

  // Supprimer un mot
  const removeWord = (wordToRemove: string) => {
    if (roundActive) {
      const newPlayerWords = playerWords.filter((word) => word !== wordToRemove)
      setPlayerWords(newPlayerWords)
      savePlayerWords(newPlayerWords)
    }
  }

  if (!gameRoom) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de la partie...</p>
        </div>
      </div>
    )
  }

  const progress = (currentRound / (gameRoom?.config?.numberOfRounds || 10)) * 100
  const currentPlayerScore = playerScores[player.id] || 0

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">{gameRoom.players.length} joueurs</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {roomId}
            </Badge>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Manche {currentRound}/{gameRoom?.config?.numberOfRounds || 10}
            </h1>
            <Progress value={progress} className="w-48 mt-2" />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Ton score</div>
            <div className="text-xl font-bold">{currentPlayerScore}</div>
          </div>
        </div>

        {/* Mot-clé central */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {currentKeyword || "En attente..."}
            </CardTitle>

            {!roundActive && currentDefinition && (
              <div className="max-w-2xl mx-auto mb-4">
                <p className="text-lg text-gray-700 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  💡 <strong>Définition :</strong> {currentDefinition}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-lg">
              {roundActive ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>{timeLeft}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {gameRoom?.config?.showAnswers === "after-round" && (
                    <Button variant="outline" size="sm" onClick={() => setShowExpected(!showExpected)}>
                      {showExpected ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showExpected ? "Masquer" : "Voir"} les réponses
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Zone de saisie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tes mots ({playerWords.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roundActive ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tape un mot..."
                      disabled={!roundActive || !currentKeyword}
                    />
                    <Button onClick={addWord} disabled={!currentInput.trim() || !currentKeyword}>
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {playerWords.map((word, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeWord(word)}
                      >
                        {word} ×
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    🎯 Objectif : Trouvez des mots communs avec les autres joueurs pour découvrir la définition ! Plus
                    vous avez de mots en commun, plus vous marquez de points.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">Temps écoulé !</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {commonWords.length} mot{commonWords.length > 1 ? "s" : ""} en commun trouvé
                    {commonWords.length > 1 ? "s" : ""}
                  </div>
                  {showNextButton && isHost && (
                    <Button onClick={goToNextRound} size="lg" className="flex items-center gap-2">
                      {currentRound < (gameRoom?.config?.numberOfRounds || 10) ? (
                        <>
                          <ArrowRight className="h-5 w-5" />
                          Manche suivante
                        </>
                      ) : (
                        <>
                          <Trophy className="h-5 w-5" />
                          Voir les résultats
                        </>
                      )}
                    </Button>
                  )}
                  {!isHost && (
                    <p className="text-sm text-gray-500">En attente que l'hôte passe à la manche suivante...</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Résultats de la manche */}
          {!roundActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Mots communs ({commonWords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {commonWords.map((word, index) => {
                      const playerHasWord = playerWords.some(
                        (playerWord) => findMatchingWords([playerWord], [word]).length > 0,
                      )
                      return (
                        <Badge
                          key={index}
                          variant={playerHasWord ? "default" : "outline"}
                          className={playerHasWord ? "bg-green-500" : ""}
                        >
                          {word} {playerHasWord && "✓"}
                        </Badge>
                      )
                    })}
                  </div>

                  {commonWords.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucun mot en commun cette manche</p>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>💡 Les mots communs donnent des points</p>
                    <p>
                      Ton score cette manche :{" "}
                      <span className="font-bold">
                        {
                          commonWords.filter((word) =>
                            playerWords.some((playerWord) => findMatchingWords([playerWord], [word]).length > 0),
                          ).length
                        }
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mots attendus */}
          {showExpected && !roundActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Mots attendus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {expectedWords.map((word, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600 border-blue-300">
                      {word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classement des joueurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameRoom.players
                  .map((p: Player) => ({ ...p, currentScore: playerScores[p.id] || 0 }))
                  .sort((a: any, b: any) => b.currentScore - a.currentScore)
                  .map((p: any, index: number) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className={`font-medium ${p.id === player.id ? "text-purple-600" : ""}`}>
                          {p.name} {p.id === player.id && "(toi)"}
                        </span>
                      </div>
                      <div className="text-sm font-bold">
                        {p.currentScore} pts
                        {!roundActive && allPlayersWords[p.id] && (
                          <span className="text-gray-500 ml-2">({allPlayersWords[p.id]?.length || 0} mots)</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {roundActive && (
          <div className="text-center mt-6">
            <Button onClick={isHost ? endRoundForAll : undefined} variant="outline" disabled={!isHost}>
              {isHost ? "Terminer cette manche" : "En attente de l'hôte..."}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
