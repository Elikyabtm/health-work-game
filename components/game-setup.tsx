"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { GameConfig, GameMode, Theme, TimeLimit, ShowAnswers } from "@/app/page"
import { ArrowLeft, Clock, Hash, Eye, Filter } from "lucide-react"

interface GameSetupProps {
  initialMode?: GameMode
  onGameStart: (config: GameConfig) => void
  onBack: () => void
}

const themes = [
  {
    value: "all" as Theme,
    label: "Tous les concepts",
    description: "Les 11 définitions essentielles de la santé au travail",
  },
  { value: "prevention" as Theme, label: "Prévention", description: "Concepts liés à la prévention des risques" },
  { value: "securite" as Theme, label: "Sécurité", description: "Notions de sécurité et protection au travail" },
  { value: "sante" as Theme, label: "Santé", description: "Bien-être et conditions de travail" },
  { value: "risque" as Theme, label: "Risque", description: "Évaluation et gestion des risques professionnels" },
  { value: "accidents" as Theme, label: "Accidents", description: "Accidents du travail et de trajet" },
  {
    value: "maladie-pro" as Theme,
    label: "Maladie professionnelle",
    description: "Pathologies d'origine professionnelle",
  },
]

const getModeInfo = (mode: GameMode) => {
  switch (mode) {
    case "solo":
      return { title: "Configuration Solo", icon: "🧍‍♀️", color: "indigo" }
    case "multiplayer":
      return { title: "Configuration Multijoueur", icon: "👥", color: "purple" }
    case "creative":
      return { title: "Configuration Créative", icon: "🧠", color: "pink" }
    default:
      return { title: "Configuration", icon: "⚙️", color: "gray" }
  }
}

export default function GameSetup({ initialMode = "solo", onGameStart, onBack }: GameSetupProps) {
  const [mode] = useState<GameMode>(initialMode)
  const [theme, setTheme] = useState<Theme>("all")
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60)
  const [numberOfRounds, setNumberOfRounds] = useState([10])
  const [showAnswers, setShowAnswers] = useState<ShowAnswers>("after-round")
  const [maxPlayers, setMaxPlayers] = useState([4])

  const modeInfo = getModeInfo(mode)

  const handleStart = () => {
    onGameStart({
      mode,
      theme,
      timeLimit,
      numberOfRounds: numberOfRounds[0],
      showAnswers,
      maxPlayers: mode === "multiplayer" ? maxPlayers[0] : undefined,
    })
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {modeInfo.icon} {modeInfo.title}
            </h1>
            <p className="text-gray-600">Personnalise ton expérience de jeu</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Thème */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Thème
              </CardTitle>
              <CardDescription>Choisis le domaine de mots-clés</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-sm text-gray-600">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Paramètres de temps et tours */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Temps par manche
                </CardTitle>
                <CardDescription>{timeLimit}s par mot-clé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant={timeLimit === 30 ? "default" : "outline"} size="sm" onClick={() => setTimeLimit(30)}>
                    30s
                  </Button>
                  <Button variant={timeLimit === 60 ? "default" : "outline"} size="sm" onClick={() => setTimeLimit(60)}>
                    60s
                  </Button>
                  <Button variant={timeLimit === 90 ? "default" : "outline"} size="sm" onClick={() => setTimeLimit(90)}>
                    90s
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Nombre de manches
                </CardTitle>
                <CardDescription>{numberOfRounds[0]} mots-clés</CardDescription>
              </CardHeader>
              <CardContent>
                <Slider
                  value={numberOfRounds}
                  onValueChange={setNumberOfRounds}
                  max={15}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paramètres d'affichage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Affichage des réponses
              </CardTitle>
              <CardDescription>Quand montrer les mots attendus</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={showAnswers} onValueChange={(value) => setShowAnswers(value as ShowAnswers)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after-round" id="after-round" />
                  <Label htmlFor="after-round">Après chaque manche</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="end-game" id="end-game" />
                  <Label htmlFor="end-game">À la fin du jeu seulement</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Paramètres multijoueur */}
          {mode === "multiplayer" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">👥 Paramètres multijoueur</CardTitle>
                <CardDescription>Configuration pour les parties à plusieurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Nombre maximum de joueurs : {maxPlayers[0]}
                  </Label>
                  <Slider
                    value={maxPlayers}
                    onValueChange={setMaxPlayers}
                    max={6}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bouton de démarrage */}
        <div className="mt-8">
          <Button onClick={handleStart} className="w-full" size="lg">
            🚀 {mode === "multiplayer" ? "Créer la partie" : "Commencer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
