"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { GameConfig, GameSession } from "@/app/page"
import { Clock, Plus, ArrowLeft, Target, Eye, EyeOff, ArrowRight } from "lucide-react"
import { findMatchingWords } from "@/lib/enhanced-game-data"

interface CustomKeyword {
  keyword: string
  definition: string
  expectedWords: string[]
}

interface CreativeGamePlayProps {
  config: GameConfig
  customKeywords: CustomKeyword[]
  onGameEnd: (session: GameSession) => void
  onBack: () => void
}

export default function CreativeGamePlay({ config, customKeywords, onGameEnd, onBack }: CreativeGamePlayProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentKeywordData, setCurrentKeywordData] = useState<CustomKeyword | null>(null)
  const [playerWords, setPlayerWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(config.timeLimit)
  const [roundActive, setRoundActive] = useState(true)
  const [totalScore, setTotalScore] = useState(0)
  const [showExpected, setShowExpected] = useState(false)
  const [roundResults, setRoundResults] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [showNextButton, setShowNextButton] = useState(false)
  const [usedKeywords, setUsedKeywords] = useState<number[]>([])

  const maxRounds = Math.min(config.numberOfRounds, customKeywords.length)

  useEffect(() => {
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

  const getRandomKeyword = () => {
    const availableIndexes = customKeywords.map((_, index) => index).filter((index) => !usedKeywords.includes(index))

    if (availableIndexes.length === 0) {
      // Si tous les mots ont été utilisés, on recommence
      setUsedKeywords([])
      return customKeywords[0]
    }

    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
    setUsedKeywords((prev) => [...prev, randomIndex])
    return customKeywords[randomIndex]
  }

  const startNewRound = () => {
    const keywordData = getRandomKeyword()
    setCurrentKeywordData(keywordData)
    setPlayerWords([])
    setCurrentInput("")
    setTimeLeft(config.timeLimit)
    setRoundActive(true)
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

  const endRound = () => {
    if (!currentKeywordData) return

    setRoundActive(false)

    // Utiliser la fonction de correspondance tolérante
    const matchedWords = findMatchingWords(playerWords, currentKeywordData.expectedWords)
    const roundScore = matchedWords.length
    setTotalScore((prev) => prev + roundScore)

    const roundResult = {
      round: currentRound,
      keyword: currentKeywordData.keyword,
      definition: currentKeywordData.definition,
      playerAnswers: { creative: playerWords },
      commonWords: matchedWords,
      scores: { creative: roundScore },
      expectedWords: currentKeywordData.expectedWords,
    }

    setRoundResults((prev) => [...prev, roundResult])

    if (config.showAnswers === "after-round") {
      setShowExpected(true)
    }

    setShowNextButton(true)
  }

  const goToNextRound = () => {
    if (currentRound < maxRounds) {
      setCurrentRound((prev) => prev + 1)
      startNewRound()
    } else {
      // Fin du jeu
      const finalSession: GameSession = {
        id: "creative-" + Date.now(),
        config: { ...config, numberOfRounds: maxRounds },
        players: [{ id: "creative", name: "Créateur", score: totalScore }],
        currentRound,
        currentKeyword: currentKeywordData?.keyword || "",
        expectedWords: currentKeywordData?.expectedWords || [],
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

  if (!currentKeywordData) {
    return <div>Chargement...</div>
  }

  // Utiliser la fonction de correspondance
  const matchedWords = findMatchingWords(playerWords, currentKeywordData.expectedWords)
  const progress = (currentRound / maxRounds) * 100

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Manche {currentRound}/{maxRounds}
            </h1>
            <Progress value={progress} className="w-48 mt-2" />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-xl font-bold">{totalScore}</div>
          </div>
        </div>

        {/* Mot-clé central */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {currentKeywordData.keyword}
            </CardTitle>

            {/* Afficher la définition seulement après la fin de la manche */}
            {!roundActive && (
              <div className="max-w-2xl mx-auto mb-4">
                <p className="text-lg text-gray-700 bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                  💡 <strong>Définition :</strong> {currentKeywordData.definition}
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
                  {config.showAnswers === "after-round" && (
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Zone de saisie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Écris tes mots ({playerWords.length})
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
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    💡 Écris tous les mots qui te viennent à l'esprit en lien avec "{currentKeywordData.keyword}"
                  </p>
                  <p className="text-xs text-gray-500">ℹ️ Les accents et pluriels sont automatiquement pris en compte</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">Manche terminée !</div>
                  <div className="text-sm text-gray-600 mb-4">
                    Tu as trouvé {matchedWords.length} mot{matchedWords.length > 1 ? "s" : ""} correct
                    {matchedWords.length > 1 ? "s" : ""} sur {currentKeywordData.expectedWords.length}
                  </div>
                  {showNextButton && (
                    <Button onClick={goToNextRound} size="lg" className="flex items-center gap-2">
                      {currentRound < maxRounds ? (
                        <>
                          <ArrowRight className="h-5 w-5" />
                          Manche suivante
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5" />
                          Voir les résultats
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mots trouvés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tes mots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {playerWords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun mot ajouté</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {playerWords.map((word, index) => {
                      const isMatched = matchedWords.includes(word)
                      return (
                        <Badge
                          key={index}
                          variant={isMatched ? "default" : "secondary"}
                          className={`cursor-pointer ${isMatched ? "bg-green-500 hover:bg-green-600" : ""}`}
                          onClick={() => removeWord(word)}
                        >
                          {word} {roundActive && "×"}
                        </Badge>
                      )
                    })}
                  </div>
                )}

                {!roundActive && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">
                      ✅ Mots corrects : {matchedWords.length}/{currentKeywordData.expectedWords.length}
                    </div>
                    {matchedWords.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">{matchedWords.join(", ")}</div>
                    )}
                  </div>
                )}

                {showExpected && !roundActive && (
                  <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                    <div className="text-sm font-medium text-pink-800 mb-2">💡 Mots attendus :</div>
                    <div className="flex flex-wrap gap-1">
                      {currentKeywordData.expectedWords.map((word, index) => (
                        <Badge key={index} variant="outline" className="text-pink-600 border-pink-300">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
