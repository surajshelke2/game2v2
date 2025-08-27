"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LevelStats {
  level: number
  correctAnswers: number
  totalAnswers: number
  timeSpent: number
  score: number
}

interface StartScreenProps {
  onStartGame: () => void
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <Card className="p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Grid Challenge</h1>
        <p className="text-gray-600 mb-6">Power of Attention & Memory</p>
        <p className="text-sm text-gray-500 mb-6">
          Remember blinking dots while identifying symmetrical patterns in an interleaved sequence. You have 5 minutes
          to complete 6 progressively challenging levels!
        </p>
        <div className="text-xs text-gray-400 mb-4">
          <p>Level 1-2: Basic patterns</p>
          <p>Level 3-4: Rotations & arithmetic</p>
          <p>Level 5-6: Master challenge</p>
        </div>
        <Button onClick={onStartGame} size="lg">
          Start Game
        </Button>
      </Card>
    </div>
  )
}

interface LevelCompleteScreenProps {
  currentLevel: number
  levelStats: LevelStats[]
}

export function LevelCompleteScreen({ currentLevel, levelStats }: LevelCompleteScreenProps) {
  const currentLevelStat = levelStats[levelStats.length - 1]
  const accuracy = currentLevelStat ? (currentLevelStat.correctAnswers / currentLevelStat.totalAnswers) * 100 : 0

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <Card className="p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Level {currentLevel} Complete!</h1>
        <div className="space-y-2 mb-6">
          <p>Accuracy: {accuracy.toFixed(1)}%</p>
          <p>Points Earned: +{currentLevelStat?.score || 0}</p>
          <p>Time: {currentLevelStat ? (currentLevelStat.timeSpent / 1000).toFixed(1) : 0}s</p>
        </div>
        <div className="text-sm text-gray-500">Preparing Level {currentLevel + 1}...</div>
      </Card>
    </div>
  )
}

interface CompleteScreenProps {
  score: number
  currentLevel: number
  timeRemaining: number
  levelStats: LevelStats[]
  onPlayAgain: () => void
}

export function CompleteScreen({ score, currentLevel, timeRemaining, levelStats, onPlayAgain }: CompleteScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceGrade = () => {
    if (levelStats.length === 0) return "N/A"

    const totalCorrect = levelStats.reduce((sum, stat) => sum + stat.correctAnswers, 0)
    const totalQuestions = levelStats.reduce((sum, stat) => sum + stat.totalAnswers, 0)
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

    if (accuracy >= 90) return "A+"
    if (accuracy >= 80) return "A"
    if (accuracy >= 70) return "B"
    if (accuracy >= 60) return "C"
    return "D"
  }

  const totalCorrect = levelStats.reduce((sum, stat) => sum + stat.correctAnswers, 0)
  const totalQuestions = levelStats.reduce((sum, stat) => sum + stat.totalAnswers, 0)
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <Card className="p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
        <div className="space-y-3 mb-6">
          <p className="text-xl">
            Final Score: <span className="font-bold">{score}</span>
          </p>
          <p>Levels Completed: {currentLevel > 6 ? 6 : currentLevel - 1}/6</p>
          <p>Overall Accuracy: {overallAccuracy.toFixed(1)}%</p>
          <p>
            Performance Grade: <span className="font-bold text-lg">{getPerformanceGrade()}</span>
          </p>
          <p>Time Remaining: {formatTime(timeRemaining)}</p>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <h3 className="font-semibold mb-2">Level Breakdown:</h3>
          {levelStats.map((stat, index) => (
            <div key={index} className="flex justify-between">
              <span>Level {stat.level}:</span>
              <span>
                {stat.correctAnswers}/{stat.totalAnswers} (
                {((stat.correctAnswers / stat.totalAnswers) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>

        <Button onClick={onPlayAgain} size="lg">
          Play Again
        </Button>
      </Card>
    </div>
  )
}
