"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { GameConfig, GameState } from "@/app/page"
import { Clock, Plus, ArrowLeft, Target } from "lucide-react"
import { gameData } from "@/lib/game-data"

interface GamePlayProps {
  config: GameConfig
  onGameEnd: (gameState: GameState) => void
  onBack: () => void
}

export default function GamePlay({ config, onGameEnd, onBack }: GamePlayProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [expectedWords, setExpectedWords] = useState<string[]>([])
  const [playerWords, setPlayerWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(config.timeLimit)
  const [roundActive, setRoundActive] = useState(true)
  const [totalScore, setTotalScore] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialiser le premier tour
  useEffect(() => {
    startNewRound()
  }, [])

  // Timer
  useEffect(() => {
    if (config.timeLimit === 0 || !roundActive) return

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
  }, [roundActive, config.timeLimit])

  const startNewRound = () => {
    const themeData = gameData[config.theme]
    const keywords = Object.keys(themeData)
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]

    setCurrentKeyword(randomKeyword)
    setExpectedWords(themeData[randomKeyword])
    setPlayerWords([])
    setCurrentInput("")
    setTimeLeft(config.timeLimit)
    setRoundActive(true)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const addWord = () => {
    const word = currentInput.trim().toLowerCase()
    if (word && !playerWords.includes(word)) {
      setPlayerWords([...playerWords, word])
      setCurrentInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWord()
    }
  }

  const endRound = () => {
    setRoundActive(false)

    // Calculer le score pour ce tour
    const matchedWords = playerWords.filter((word) =>
      expectedWords.some((expected) => expected.toLowerCase().includes(word) || word.includes(expected.toLowerCase())),
    )
    const roundScore = matchedWords.length
    setTotalScore((prev) => prev + roundScore)

    // Attendre 3 secondes avant le tour suivant ou la fin
    setTimeout(() => {
      if (currentRound < config.numberOfRounds) {
        setCurrentRound((prev) => prev + 1)
        startNewRound()
      } else {
        // Fin du jeu
        onGameEnd({
          currentRound,
          currentKeyword,
          playerWords,
          expectedWords,
          score: totalScore + roundScore,
          gameFinished: true,
        })
      }
    }, 3000)
  }

  const removeWord = (wordToRemove: string) => {
    setPlayerWords(playerWords.filter((word) => word !== wordToRemove))
  }

  const matchedWords = playerWords.filter((word) =>
    expectedWords.some((expected) => expected.toLowerCase().includes(word) || word.includes(expected.toLowerCase())),
  )

  const progress = (currentRound / config.numberOfRounds) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Tour {currentRound}/{config.numberOfRounds}
            </h1>
            <Progress value={progress} className="w-48 mt-2" />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score total</div>
            <div className="text-xl font-bold">{totalScore}</div>
          </div>
        </div>

        {/* Mot-clé central */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">{currentKeyword}</CardTitle>
            {config.timeLimit > 0 && (
              <div className="flex items-center justify-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>{timeLeft}s</span>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Zone de saisie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Écris tes mots
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
                      placeholder="Tape un mot et appuie sur Entrée..."
                      disabled={!roundActive}
                    />
                    <Button onClick={addWord} disabled={!currentInput.trim()}>
                      Ajouter
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    💡 Écris tous les mots qui te viennent à l'esprit en lien avec "{currentKeyword}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">Tour terminé !</div>
                  <div className="text-sm text-gray-600">
                    {currentRound < config.numberOfRounds
                      ? "Préparation du tour suivant..."
                      : "Calcul des résultats..."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mots trouvés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tes mots ({playerWords.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playerWords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun mot ajouté</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {playerWords.map((word, index) => {
                      const isMatched = expectedWords.some(
                        (expected) => expected.toLowerCase().includes(word) || word.includes(expected.toLowerCase()),
                      )
                      return (
                        <Badge
                          key={index}
                          variant={isMatched ? "default" : "secondary"}
                          className={`cursor-pointer ${isMatched ? "bg-green-500 hover:bg-green-600" : ""}`}
                          onClick={() => roundActive && removeWord(word)}
                        >
                          {word} {roundActive && "×"}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              {!roundActive && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    ✅ Mots corrects trouvés : {matchedWords.length}/{expectedWords.length}
                  </div>
                  <div className="text-xs text-green-600 mt-1">{matchedWords.join(", ")}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {roundActive && (
          <div className="text-center mt-6">
            <Button onClick={endRound} variant="outline">
              Terminer ce tour
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
