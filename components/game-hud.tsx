"use client"

interface GameHUDProps {
  currentLevel: number
  timeRemaining: number
  score: number
  levelDescription: string
  currentLevelCorrect: number
  currentLevelTotal: number
  gameProgress: number // 0-100 percentage of game completion
  maxScore: number // Maximum possible score for score progress
}

export function GameHUD({
  currentLevel,
  timeRemaining,
  score,
  levelDescription,
  currentLevelCorrect,
  currentLevelTotal,
  gameProgress,
  maxScore,
}: GameHUDProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeRemaining > 180) return "text-green-600"
    if (timeRemaining > 90) return "text-orange-500"
    return "text-red-500"
  }

  const scoreProgress = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0

  return (
    <div className="flex justify-between items-center mb-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 rounded-lg shadow-lg">
      {/* Left section - Level info */}
      <div className="text-lg font-semibold flex-1">
        Level {currentLevel}/6
        <div className="text-xs text-purple-100">{levelDescription}</div>
      </div>

      <div className="flex-1 px-4">
        <div className="text-sm text-center mb-1">Score Progress</div>
        <div className="w-full bg-purple-900/50 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${scoreProgress}%` }}
          />
        </div>
        <div className="text-xs text-center mt-1 text-purple-100">Score: {score}</div>
      </div>

      <div className="flex-1 text-right">
        <div className={`text-xl font-bold ${getTimerColor()}`}>{formatTime(timeRemaining)}</div>
        <div className="text-xs text-purple-100">
          {currentLevelCorrect}/{currentLevelTotal} correct
        </div>
      </div>
    </div>
  )
}
