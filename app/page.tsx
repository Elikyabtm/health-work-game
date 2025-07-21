"use client"

import { useState } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import GameSetup from "@/components/game-setup"
import SoloGame from "@/components/solo-game"
import CreativeMode from "@/components/creative-mode"
import GameResults from "@/components/game-results"
import RealMultiplayerLobby from "@/components/real-multiplayer-lobby"
import RealMultiplayerGame from "@/components/real-multiplayer-game"

// Modifier la définition du type GameMode
export type GameMode = "solo" | "multiplayer" | "creative"
export type Theme = "all" | "prevention" | "securite" | "sante" | "risque" | "accidents" | "maladie-pro"
export type TimeLimit = 30 | 60 | 90
export type ShowAnswers = "after-round" | "end-game"

export interface GameConfig {
  mode: GameMode
  theme: Theme
  timeLimit: TimeLimit
  numberOfRounds: number
  showAnswers: ShowAnswers
  maxPlayers?: number
}

export interface Player {
  id: string
  name: string
  score: number
  isHost?: boolean
}

export interface GameSession {
  id: string
  config: GameConfig
  players: Player[]
  currentRound: number
  currentKeyword: string
  expectedWords: string[]
  roundResults: RoundResult[]
  gameFinished: boolean
}

export interface RoundResult {
  round: number
  keyword: string
  playerAnswers: { [playerId: string]: string[] }
  commonWords: string[]
  scores: { [playerId: string]: number }
  expectedWords?: string[]
}

export interface GameState {
  currentRound: number
  currentKeyword: string
  playerWords: string[]
  expectedWords: string[]
  score: number
  gameFinished: boolean
}

type GameScreen =
  | "welcome"
  | "setup"
  | "solo"
  | "multiplayer-lobby"
  | "multiplayer-game"
  | "creative"
  | "results"
  | "real-multiplayer-lobby"
  | "real-multiplayer-game"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome")
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [realRoomId, setRealRoomId] = useState<string>("")

  const handleModeSelect = (mode: GameMode) => {
    setCurrentScreen("setup")
    setGameConfig({ ...gameConfig, mode } as GameConfig)
  }

  // Modifier la fonction handleGameStart pour utiliser le mode multijoueur en ligne
  const handleGameStart = (config: GameConfig) => {
    setGameConfig(config)

    if (config.mode === "solo") {
      setCurrentScreen("solo")
    } else if (config.mode === "multiplayer") {
      setCurrentScreen("real-multiplayer-lobby")
    } else if (config.mode === "creative") {
      setCurrentScreen("creative")
    }
  }

  const handleGameEnd = (session: GameSession) => {
    setGameSession(session)
    setCurrentScreen("results")
  }

  const handleRestart = () => {
    setCurrentScreen("welcome")
    setGameConfig(null)
    setGameSession(null)
    setCurrentPlayer(null)
    setRealRoomId("")
  }

  // Modifier la fonction renderScreen pour supprimer le cas "multiplayer-lobby" et "multiplayer-game"
  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onModeSelect={handleModeSelect} />
      case "setup":
        return (
          <GameSetup
            initialMode={gameConfig?.mode}
            onGameStart={handleGameStart}
            onBack={() => setCurrentScreen("welcome")}
          />
        )
      case "solo":
        return <SoloGame config={gameConfig!} onGameEnd={handleGameEnd} onBack={() => setCurrentScreen("setup")} />
      case "creative":
        return <CreativeMode config={gameConfig!} onGameEnd={handleGameEnd} onBack={() => setCurrentScreen("setup")} />
      case "results":
        return <GameResults session={gameSession!} config={gameConfig!} onRestart={handleRestart} />
      case "real-multiplayer-lobby":
        return (
          <RealMultiplayerLobby
            config={gameConfig!}
            onGameStart={(roomId, player) => {
              setRealRoomId(roomId)
              setCurrentPlayer(player)
              setCurrentScreen("real-multiplayer-game")
            }}
            onBack={() => setCurrentScreen("setup")}
          />
        )
      case "real-multiplayer-game":
        return (
          <RealMultiplayerGame
            roomId={realRoomId}
            player={currentPlayer!}
            onGameEnd={() => {
              // Simuler une session pour les résultats
              const simulatedSession: GameSession = {
                id: realRoomId,
                config: gameConfig!,
                players: [currentPlayer!],
                currentRound: 0,
                currentKeyword: "",
                expectedWords: [],
                roundResults: [],
                gameFinished: true,
              }
              handleGameEnd(simulatedSession)
            }}
            onBack={() => setCurrentScreen("setup")}
          />
        )
      default:
        return <WelcomeScreen onModeSelect={handleModeSelect} />
    }
  }

  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">{renderScreen()}</div>
}
