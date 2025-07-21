"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GameMode } from "@/app/page"
import { Brain, Users, Lightbulb, Trophy, Clock, Target } from "lucide-react"

interface WelcomeScreenProps {
  onModeSelect: (mode: GameMode) => void
}

export default function WelcomeScreen({ onModeSelect }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🧠 C'est quoi la définition ?
          </h1>
          <p className="text-xl text-gray-600 mb-2">Jeu d'association de mots - Santé & Sécurité au Travail</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <Clock className="h-8 w-8 text-indigo-500" />
            <div className="text-left">
              <div className="font-semibold">Temps limité</div>
              <div className="text-sm text-gray-600">30s à 90s par manche</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <Target className="h-8 w-8 text-purple-500" />
            <div className="text-left">
              <div className="font-semibold">Mots attendus</div>
              <div className="text-sm text-gray-600">Base de données intégrée</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
            <Trophy className="h-8 w-8 text-pink-500" />
            <div className="text-left">
              <div className="font-semibold">Scoring avancé</div>
              <div className="text-sm text-gray-600">Mots communs = points</div>
            </div>
          </div>
        </div>

        {/* Comment jouer */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">📋 Comment jouer ?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🎯 Le principe :</h4>
                <ul className="text-sm space-y-1">
                  <li>• Un mot-clé s'affiche à l'écran</li>
                  <li>• Écris tous les mots qui te viennent à l'esprit pour trouver la définition</li>
                  <li>• Plus tu trouves de mots "attendus", plus tu marques de points</li>
                  <li>• La définition s'affiche à la fin de chaque manche</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⚡ Conseils :</h4>
                <ul className="text-sm space-y-1">
                  <li>• Pense aux synonymes et termes techniques</li>
                  <li>• Les accents et pluriels sont automatiquement pris en compte</li>
                  <li>• En multijoueur : les mots communs donnent des points</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Modes */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onModeSelect("solo")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit group-hover:bg-indigo-200 transition-colors">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Mode Solo</CardTitle>
              <CardDescription>Joue seul(e) et révise tes connaissances</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Trouve un maximum de mots attendus</li>
                <li>• Progression personnelle</li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                Commencer en solo
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onModeSelect("multiplayer")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit group-hover:bg-purple-200 transition-colors">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Mode Multijoueur</CardTitle>
              <CardDescription>Jouable de 2 à 6 joueurs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Chaque joueur écrit ses mots</li>
                <li>• Mots communs donnent des points</li>
                <li>• Coopération et intuition</li>
                <li>• Session partageable par URL</li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                Créer une partie
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onModeSelect("creative")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-pink-100 rounded-full w-fit group-hover:bg-pink-200 transition-colors">
                <Lightbulb className="h-8 w-8 text-pink-600" />
              </div>
              <CardTitle className="text-xl">Mode Créatif</CardTitle>
              <CardDescription>Crée tes propres mots-clés</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Ajoute tes propres mots-clés</li>
                <li>• Parfait pour les formateurs</li>
                <li>• Contenu personnalisé</li>
                <li>• Partage avec ton équipe</li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                Mode créatif
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">🎯 Parfait pour une session ludique en formation, en classe ou en équipe</p>
        </div>
      </div>
    </div>
  )
}
