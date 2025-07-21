"use client"

import { useState } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import GameSetup from "@/components/game-setup"
import SoloGame from "@/components/solo-game"
import MultiplayerLobby from "@/components/multiplayer-lobby"
import MultiplayerGame from "@/components/multiplayer-game"
import CreativeMode from "@/components/creative-mode"
import GameResults from "@/components/game-results"

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

type GameScreen = "welcome" | "setup" | "solo" | "multiplayer-lobby" | "multiplayer-game" | "creative" | "results"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome")
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [gameSession, setGameSession] = useState<GameSession | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  const handleModeSelect = (mode: GameMode) => {
    setCurrentScreen("setup")
    setGameConfig({ ...gameConfig, mode } as GameConfig)
  }

  const handleGameStart = (config: GameConfig) => {
    setGameConfig(config)

    if (config.mode === "solo") {
      setCurrentScreen("solo")
    } else if (config.mode === "multiplayer") {
      setCurrentScreen("multiplayer-lobby")
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
  }

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
      case "multiplayer-lobby":
        return (
          <MultiplayerLobby
            config={gameConfig!}
            onGameStart={(session, player) => {
              setGameSession(session)
              setCurrentPlayer(player)
              setCurrentScreen("multiplayer-game")
            }}
            onBack={() => setCurrentScreen("setup")}
          />
        )
      case "multiplayer-game":
        return <MultiplayerGame session={gameSession!} player={currentPlayer!} onGameEnd={handleGameEnd} />
      case "creative":
        return <CreativeMode config={gameConfig!} onGameEnd={handleGameEnd} onBack={() => setCurrentScreen("setup")} />
      case "results":
        return <GameResults session={gameSession!} config={gameConfig!} onRestart={handleRestart} />
      default:
        return <WelcomeScreen onModeSelect={handleModeSelect} />
    }
  }

  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">{renderScreen()}</div>
}
