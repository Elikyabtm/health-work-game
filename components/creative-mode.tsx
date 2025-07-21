"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { GameConfig, GameSession } from "@/app/page"
import { ArrowLeft, Plus, Trash2, Play, Lightbulb } from "lucide-react"
import CreativeGamePlay from "./creative-game-play"

interface CreativeModeProps {
  config: GameConfig
  onGameEnd: (session: GameSession) => void
  onBack: () => void
}

interface CustomKeyword {
  keyword: string
  definition: string
  expectedWords: string[]
}

export default function CreativeMode({ config, onGameEnd, onBack }: CreativeModeProps) {
  const [customKeywords, setCustomKeywords] = useState<CustomKeyword[]>([])
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [currentWords, setCurrentWords] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [currentDefinition, setCurrentDefinition] = useState("")

  const addKeyword = () => {
    if (!currentKeyword.trim() || !currentDefinition.trim() || !currentWords.trim()) return

    const words = currentWords
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0)

    if (words.length === 0) return

    const newKeyword: CustomKeyword = {
      keyword: currentKeyword.trim(),
      definition: currentDefinition.trim(),
      expectedWords: words,
    }

    setCustomKeywords([...customKeywords, newKeyword])
    setCurrentKeyword("")
    setCurrentDefinition("")
    setCurrentWords("")
  }

  const removeKeyword = (index: number) => {
    setCustomKeywords(customKeywords.filter((_, i) => i !== index))
  }

  const startCreativeGame = () => {
    if (customKeywords.length === 0) return
    setGameStarted(true)
  }

  if (gameStarted) {
    return (
      <CreativeGamePlay
        config={config}
        customKeywords={customKeywords}
        onGameEnd={onGameEnd}
        onBack={() => setGameStarted(false)}
      />
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-pink-500" />
              Mode Créatif - C'est quoi la définition ?
            </h1>
            <p className="text-gray-600">Crée tes propres mots-clés, définitions et mots associés</p>
          </div>
        </div>

        {/* Explication du mode créatif */}
        <Card className="mb-6 bg-pink-50 border-pink-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-pink-800 mb-2">🎨 Mode Créatif - Pour les formateurs</h3>
            <p className="text-pink-700 text-sm">
              Créez vos propres mots-clés avec leurs définitions et les mots associés que vous souhaitez que vos
              apprenants trouvent. Parfait pour adapter le jeu à votre contenu de formation spécifique !
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulaire d'ajout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter un mot-clé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mot-clé principal</label>
                <Input
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  placeholder="Ex: Ergonomie, Formation, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Définition</label>
                <Textarea
                  value={currentDefinition}
                  onChange={(e) => setCurrentDefinition(e.target.value)}
                  placeholder="Ex: État de bien-être physique, mental et social..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mots associés (séparés par des virgules)</label>
                <Textarea
                  value={currentWords}
                  onChange={(e) => setCurrentWords(e.target.value)}
                  placeholder="Ex: posture, confort, adaptation, aménagement, position, mouvement"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sépare chaque mot par une virgule. Ces mots seront considérés comme corrects.
                </p>
              </div>

              <Button
                onClick={addKeyword}
                disabled={!currentKeyword.trim() || !currentDefinition.trim() || !currentWords.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ce mot-clé
              </Button>
            </CardContent>
          </Card>

          {/* Liste des mots-clés créés */}
          <Card>
            <CardHeader>
              <CardTitle>Tes mots-clés ({customKeywords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {customKeywords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun mot-clé créé</p>
                  <p className="text-sm">Commence par ajouter ton premier mot-clé</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customKeywords.map((kw, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{kw.keyword}</h3>
                        <Button variant="outline" size="sm" onClick={() => removeKeyword(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 italic">"{kw.definition}"</p>
                      <div className="flex flex-wrap gap-1">
                        {kw.expectedWords.map((word, wordIndex) => (
                          <Badge key={wordIndex} variant="outline" className="text-sm">
                            {word}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{kw.expectedWords.length} mots associés</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conseils */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">💡 Conseils pour créer de bons mots-clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">✅ Bonnes pratiques :</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Choisis des mots-clés centraux et importants</li>
                  <li>• Ajoute 5-10 mots associés par mot-clé</li>
                  <li>• Utilise des synonymes et termes techniques</li>
                  <li>• Pense aux mots que tes apprenants connaissent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Exemples d'usage :</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Formation en entreprise</li>
                  <li>• Animation d'équipe</li>
                  <li>• Évaluation des connaissances</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Démarrer le jeu */}
        {customKeywords.length > 0 && (
          <div className="mt-6 text-center">
            <Button onClick={startCreativeGame} size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Jouer avec mes mots-clés ({customKeywords.length} mots)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
