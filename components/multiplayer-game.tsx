"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { GameSession, Player } from "@/app/page"
import { Clock, Users, Target, Trophy, Eye, EyeOff, ArrowRight } from "lucide-react"
import { getRandomKeyword, findMatchingWords } from "@/lib/enhanced-game-data"

interface MultiplayerGameProps {
  session: GameSession
  player: Player
  onGameEnd: (session: GameSession) => void
}

export default function MultiplayerGame({ session, player, onGameEnd }: MultiplayerGameProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [expectedWords, setExpectedWords] = useState<string[]>([])
  const [playerWords, setPlayerWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(session.config.timeLimit)
  const [roundActive, setRoundActive] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [allPlayersWords, setAllPlayersWords] = useState<{ [playerId: string]: string[] }>({})
  const [commonWords, setCommonWords] = useState<string[]>([])
  const [showExpected, setShowExpected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentDefinition, setCurrentDefinition] = useState("")
  const [showNextButton, setShowNextButton] = useState(false)
  const [roundResults, setRoundResults] = useState<any[]>([])
  const [playerScores, setPlayerScores] = useState<{ [playerId: string]: number }>({})
  const [usedKeywords, setUsedKeywords] = useState<string[]>([]) // Pour éviter les doublons

  useEffect(() => {
    // Initialiser les scores
    const initialScores: { [playerId: string]: number } = {}
    session.players.forEach((p) => {
      initialScores[p.id] = 0
    })
    setPlayerScores(initialScores)

    startNewRound()
  }, [])

  useEffect(() => {
    if (!roundActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endRound()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [roundActive])

  const getUniqueKeyword = () => {
    let attempts = 0
    let keyword, words, definition

    do {
      const result = getRandomKeyword(session.config.theme)
      keyword = result.keyword
      words = result.words
      definition = result.definition
      attempts++
    } while (usedKeywords.includes(keyword) && attempts < 20)

    // Si on n'arrive pas à trouver un mot unique après 20 tentatives, on prend quand même
    return { keyword, words, definition }
  }

  const startNewRound = () => {
    const { keyword, words, definition } = getUniqueKeyword()

    setCurrentKeyword(keyword)
    setExpectedWords(words)
    setCurrentDefinition(definition)
    setUsedKeywords((prev) => [...prev, keyword]) // Ajouter à la liste des mots utilisés

    setPlayerWords([])
    setCurrentInput("")
    setTimeLeft(session.config.timeLimit)
    setRoundActive(true)
    setShowResults(false)
    setShowExpected(false)
    setShowNextButton(false)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const addWord = () => {
    const word = currentInput.trim()
    if (word && !playerWords.some((existing) => existing.toLowerCase() === word.toLowerCase())) {
      setPlayerWords([...playerWords, word])
      setCurrentInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWord()
    }
  }

  const generateBotWords = (expectedWords: string[], playerWords: string[]) => {
    // Générer des mots plus réalistes pour les bots
    const botWords: string[] = []

    // 60% de chance d'avoir des mots attendus
    expectedWords.forEach((word) => {
      if (Math.random() > 0.4) {
        botWords.push(word)
      }
    })

    // Ajouter quelques mots du joueur (simulation de pensée commune)
    playerWords.forEach((word) => {
      if (Math.random() > 0.7) {
        botWords.push(word)
      }
    })

    // Ajouter des mots aléatoires plausibles
    const randomWords = ["travail", "sécurité", "protection", "formation", "règles", "équipe"]
    randomWords.forEach((word) => {
      if (Math.random() > 0.8) {
        botWords.push(word)
      }
    })

    // Limiter à 3-7 mots et éviter les doublons
    const uniqueWords = [...new Set(botWords)]
    return uniqueWords.slice(0, Math.floor(Math.random() * 5) + 3)
  }

  const endRound = () => {
    setRoundActive(false)

    // Générer les mots des autres joueurs de façon plus réaliste
    const simulatedPlayersWords: { [playerId: string]: string[] } = {}
    session.players.forEach((p) => {
      if (p.id === player.id) {
        simulatedPlayersWords[p.id] = playerWords
      } else {
        simulatedPlayersWords[p.id] = generateBotWords(expectedWords, playerWords)
      }
    })

    setAllPlayersWords(simulatedPlayersWords)

    // Calculer les mots communs avec une logique améliorée
    const wordFrequency: { [word: string]: { count: number; players: string[] } } = {}

    Object.entries(simulatedPlayersWords).forEach(([playerId, words]) => {
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

    // Calculer les scores pour cette manche
    const roundScores: { [playerId: string]: number } = {}
    session.players.forEach((p) => {
      const playerWordsForRound = simulatedPlayersWords[p.id] || []
      const playerCommonWords = common.filter((commonWord) =>
        playerWordsForRound.some((playerWord) => findMatchingWords([playerWord], [commonWord]).length > 0),
      )
      roundScores[p.id] = playerCommonWords.length
    })

    // Mettre à jour les scores totaux
    setPlayerScores((prev) => {
      const newScores = { ...prev }
      Object.entries(roundScores).forEach(([playerId, score]) => {
        newScores[playerId] = (newScores[playerId] || 0) + score
      })
      return newScores
    })

    // Sauvegarder les résultats de la manche
    const roundResult = {
      round: currentRound,
      keyword: currentKeyword,
      definition: currentDefinition,
      playerAnswers: simulatedPlayersWords,
      commonWords: common,
      scores: roundScores,
      expectedWords,
    }

    setRoundResults((prev) => [...prev, roundResult])
    setShowResults(true)

    if (session.config.showAnswers === "after-round") {
      setShowExpected(true)
    }

    setShowNextButton(true)
  }

  const goToNextRound = () => {
    if (currentRound < session.config.numberOfRounds) {
      setCurrentRound((prev) => prev + 1)
      startNewRound()
    } else {
      // Fin du jeu - créer la session finale avec tous les résultats
      const finalPlayers = session.players.map((p) => ({
        ...p,
        score: playerScores[p.id] || 0,
      }))

      const finalSession: GameSession = {
        ...session,
        players: finalPlayers,
        currentRound,
        currentKeyword,
        expectedWords,
        roundResults,
        gameFinished: true,
      }
      onGameEnd(finalSession)
    }
  }

  const removeWord = (wordToRemove: string) => {
    if (roundActive) {
      setPlayerWords(playerWords.filter((word) => word !== wordToRemove))
    }
  }

  const progress = (currentRound / session.config.numberOfRounds) * 100
  const currentPlayerScore = playerScores[player.id] || 0

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">{session.players.length} joueurs</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {session.id}
            </Badge>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Manche {currentRound}/{session.config.numberOfRounds}
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
              {currentKeyword}
            </CardTitle>

            {showResults && (
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
                  {session.config.showAnswers === "after-round" && (
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
                      disabled={!roundActive}
                    />
                    <Button onClick={addWord} disabled={!currentInput.trim()}>
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
                  <p className="text-xs text-gray-500">ℹ️ Les accents et pluriels sont automatiquement pris en compte</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">Temps écoulé !</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {commonWords.length} mot{commonWords.length > 1 ? "s" : ""} en commun trouvé
                    {commonWords.length > 1 ? "s" : ""}
                  </div>
                  {showNextButton && (
                    <Button onClick={goToNextRound} size="lg" className="flex items-center gap-2">
                      {currentRound < session.config.numberOfRounds ? (
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Résultats de la manche */}
          {showResults && (
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
          {showExpected && showResults && (
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
                {session.players
                  .map((p) => ({ ...p, currentScore: playerScores[p.id] || 0 }))
                  .sort((a, b) => b.currentScore - a.currentScore)
                  .map((p, index) => (
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
                        {showResults && allPlayersWords[p.id] && (
                          <span className="text-gray-500 ml-2">({allPlayersWords[p.id].length} mots)</span>
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
            <Button onClick={endRound} variant="outline">
              Terminer cette manche
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
