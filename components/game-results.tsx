"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GameConfig, GameSession } from "@/app/page"
import { Trophy, RotateCcw, Share2, Download, Star, BookOpen, FileText, ImageIcon } from "lucide-react"

interface GameResultsProps {
  session: GameSession
  config: GameConfig
  onRestart: () => void
}

export default function GameResults({ session, config, onRestart }: GameResultsProps) {
  const totalScore = session.players.reduce((sum, player) => sum + player.score, 0)
  const averageScore = totalScore / session.players.length
  const bestPlayer = session.players.reduce((best, player) => (player.score > best.score ? player : best))

  const getScoreMessage = () => {
    if (config.mode === "solo") {
      const percentage = (session.players[0].score / (session.roundResults.length * 10)) * 100
      if (percentage >= 80) return { message: "🏆 Expert en santé au travail !", color: "text-yellow-600" }
      if (percentage >= 60) return { message: "🌟 Très bonne maîtrise !", color: "text-green-600" }
      if (percentage >= 40) return { message: "👍 Bon niveau, continue !", color: "text-blue-600" }
      return { message: "💪 Bon début, la pratique rend parfait !", color: "text-purple-600" }
    } else {
      return { message: "🎉 Partie terminée !", color: "text-indigo-600" }
    }
  }

  const scoreMessage = getScoreMessage()

  // Fonction pour générer le texte de partage
  const generateShareText = () => {
    const date = new Date().toLocaleDateString("fr-FR")
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    let text = `🎯 C'EST QUOI LA DÉFINITION ? - Résultats\n`
    text += `📅 ${date} à ${time}\n\n`

    if (config.mode === "solo") {
      const player = session.players[0]
      const percentage = Math.round((player.score / (session.roundResults.length * 10)) * 100)
      text += `👤 Mode Solo\n`
      text += `🎯 Score: ${player.score}/${session.roundResults.length * 10} (${percentage}%)\n`
      text += `📊 Thème: ${config.theme}\n`
      text += `🔢 ${session.config.numberOfRounds} manches jouées\n`
      text += `⏱️ ${config.timeLimit}s par manche\n\n`

      text += `📈 DÉTAIL DES MANCHES:\n`
      session.roundResults.forEach((result, index) => {
        const score = result.scores?.solo || 0
        const total = result.expectedWords?.length || 0
        text += `${index + 1}. ${result.keyword}: ${score}/${total}\n`
      })
    } else {
      text += `👥 Mode Multijoueur (${session.players.length} joueurs)\n`
      text += `🏆 Gagnant: ${bestPlayer.name} (${bestPlayer.score} pts)\n`
      text += `📊 Thème: ${config.theme}\n`
      text += `🔢 ${session.config.numberOfRounds} manches\n\n`

      text += `🏅 CLASSEMENT:\n`
      session.players
        .sort((a, b) => b.score - a.score)
        .forEach((player, index) => {
          text += `${index + 1}. ${player.name}: ${player.score} pts\n`
        })
    }

    text += `\n🎮 Joue aussi sur Mots en Tête !`
    return text
  }

  // Fonction pour générer les données CSV
  const generateCSVData = () => {
    const date = new Date().toISOString().split("T")[0]
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    let csv = `Date,Heure,Mode,Thème,Temps par manche,Nombre de manches\n`
    csv += `${date},${time},${config.mode},${config.theme},${config.timeLimit}s,${config.numberOfRounds}\n\n`

    if (config.mode === "solo") {
      csv += `Manche,Mot-clé,Définition,Mots trouvés,Mots corrects,Score,Mots attendus\n`
      session.roundResults.forEach((result, index) => {
        const playerWords = result.playerAnswers?.solo || []
        const correctWords = result.commonWords || []
        const score = result.scores?.solo || 0
        const expectedWords = result.expectedWords || []

        csv += `${index + 1},"${result.keyword}","${result.definition}",${playerWords.length},${correctWords.length},${score},"${expectedWords.join(", ")}"\n`
      })
    } else {
      csv += `Joueur,Score final\n`
      session.players.forEach((player) => {
        csv += `${player.name},${player.score}\n`
      })

      csv += `\nManche,Mot-clé,Définition,Mots communs\n`
      session.roundResults.forEach((result, index) => {
        const commonWords = result.commonWords || []
        csv += `${index + 1},"${result.keyword}","${result.definition}","${commonWords.join(", ")}"\n`
      })
    }

    return csv
  }

  // Fonction pour télécharger en CSV
  const downloadCSV = () => {
    const csvData = generateCSVData()
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `mots-en-tete-${config.mode}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fonction pour télécharger en PDF (simulation)
  const downloadPDF = () => {
    // En réalité, on utiliserait une librairie comme jsPDF
    // Pour la démo, on crée un fichier texte formaté
    const content = generateShareText()
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `mots-en-tete-resultats-${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fonction pour partager via l'API Web Share ou copier
  const shareResults = async () => {
    const shareData = {
      title: "Mots en Tête - Mes résultats",
      text: generateShareText(),
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copier dans le presse-papiers
        await navigator.clipboard.writeText(shareData.text)
        // Ici on pourrait afficher une notification de succès
        alert("Résultats copiés dans le presse-papiers !")
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error)
      // Fallback: copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(shareData.text)
        alert("Résultats copiés dans le presse-papiers !")
      } catch (clipboardError) {
        console.error("Erreur clipboard:", clipboardError)
      }
    }
  }

  // Fonction pour copier les résultats
  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      alert("Résultats copiés dans le presse-papiers !")
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }

  // Fonction pour partager une image (simulation)
  const shareAsImage = () => {
    // En réalité, on générerait une image avec Canvas ou html2canvas
    alert("Fonctionnalité de partage d'image à venir ! 📸")
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎉 Résultats de la partie
          </h1>
          <p className="text-lg text-gray-600">
            {config.mode === "multiplayer" ? `${session.players.length} joueurs` : "Mode solo"} • Thème: {config.theme}{" "}
            •{session.config.numberOfRounds} manches
          </p>
        </div>

        {/* Score principal */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Trophy className="h-8 w-8 text-yellow-500" />
              {config.mode === "solo" ? "Ton score" : "Classement final"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config.mode === "solo" ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-2">{session.players[0].score}</div>
                <div className="text-xl text-gray-600 mb-4">points</div>
                <div className={`text-lg font-medium ${scoreMessage.color}`}>{scoreMessage.message}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {session.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
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
                        </div>
                        <span className="font-medium text-lg">{player.name}</span>
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="text-xl font-bold">{player.score} pts</div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boutons de partage et téléchargement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Partager et sauvegarder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Partage rapide */}
              <Button onClick={shareResults} className="flex items-center gap-2" variant="default">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>

              {/* Copier */}
              <Button onClick={copyResults} className="flex items-center gap-2 bg-transparent" variant="outline">
                <ImageIcon className="h-4 w-4" />
                Copier
              </Button>

              {/* Télécharger CSV */}
              <Button onClick={downloadCSV} className="flex items-center gap-2 bg-transparent" variant="outline">
                <FileText className="h-4 w-4" />
                CSV
              </Button>

              {/* Télécharger PDF */}
              <Button onClick={downloadPDF} className="flex items-center gap-2 bg-transparent" variant="outline">
                <Download className="h-4 w-4" />
                Rapport
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Options de partage :</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div>
                  • <strong>Partager</strong> : Via réseaux sociaux ou apps
                </div>
                <div>
                  • <strong>Copier</strong> : Dans le presse-papiers
                </div>
                <div>
                  • <strong>CSV</strong> : Données pour Excel/Sheets
                </div>
                <div>
                  • <strong>Rapport</strong> : Fichier texte détaillé
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques détaillées */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-indigo-600">{session.config.numberOfRounds}</div>
              <div className="text-sm text-gray-600">Manches jouées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-purple-600">{session.config.timeLimit}s</div>
              <div className="text-sm text-gray-600">Par manche</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-pink-600">
                {config.mode === "solo" ? session.players[0].score : Math.round(averageScore)}
              </div>
              <div className="text-sm text-gray-600">{config.mode === "solo" ? "Score total" : "Score moyen"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-green-600">{session.players.length}</div>
              <div className="text-sm text-gray-600">{session.players.length > 1 ? "Joueurs" : "Joueur"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Détail des manches avec définitions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Détail des manches avec définitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {session.roundResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">
                      Manche {result.round}: {result.keyword}
                    </h3>
                    <Badge variant="outline">
                      {config.mode === "solo"
                        ? `${result.scores.solo || 0} points`
                        : `${result.commonWords?.length || 0} mots communs`}
                    </Badge>
                  </div>

                  {/* Définition */}
                  {result.definition && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm">
                        <strong>💡 Définition :</strong> {result.definition}
                      </p>
                    </div>
                  )}

                  {config.mode === "multiplayer" && result.commonWords && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-green-600 mb-1">Mots communs :</div>
                      <div className="flex flex-wrap gap-1">
                        {result.commonWords.map((word, wordIndex) => (
                          <Badge key={wordIndex} className="bg-green-500">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.expectedWords && (
                    <div>
                      <div className="text-sm font-medium text-blue-600 mb-1">Mots attendus :</div>
                      <div className="flex flex-wrap gap-1">
                        {result.expectedWords.slice(0, 8).map((word, wordIndex) => (
                          <Badge key={wordIndex} variant="outline" className="text-blue-600 border-blue-300">
                            {word}
                          </Badge>
                        ))}
                        {result.expectedWords.length > 8 && (
                          <Badge variant="outline" className="text-gray-500">
                            +{result.expectedWords.length - 8} autres...
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Nouvelle partie
          </Button>
          <Button onClick={shareResults} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Share2 className="h-5 w-5" />
            Partager les résultats
          </Button>
          {config.mode === "creative" && (
            <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
              <Download className="h-5 w-5" />
              Exporter mes mots-clés
            </Button>
          )}
        </div>

        {/* Message d'encouragement */}
        <div className="text-center mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <Star className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
          <p className="text-lg font-medium text-gray-800 mb-2">Bravo pour cette partie !</p>
          <p className="text-gray-600">Continue à jouer pour améliorer tes connaissances en santé au travail</p>
          <p className="text-sm text-gray-500 mt-2">
            🎯 "C'est quoi la définition ?" - Le jeu parfait pour réviser en s'amusant
          </p>
        </div>
      </div>
    </div>
  )
}
