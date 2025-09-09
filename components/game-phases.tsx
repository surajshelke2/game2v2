"use client"

import { PatternComparison } from "./pattern-display"
import { Button } from "@/components/ui/button"
import type { PatternChallenge } from "./pattern-generators"

interface DotPosition {
  x: number
  y: number
}

interface SymmetryPattern {
  dots: { x: number; y: number }[]
  isSymmetric: boolean
}

interface BlinkingDotsProps {
  dotPositions: DotPosition[]
  blinkingDots: number[]
  currentSequenceIndex: number
  blinkTimeLeft: number
  totalBlinkTime: number
}

export function BlinkingDots({
  dotPositions,
  blinkingDots,
  currentSequenceIndex,
  blinkTimeLeft,
  totalBlinkTime,
}: BlinkingDotsProps) {

  return (
    <>
      {dotPositions.map((pos, index) => {
        const isCurrentlyBlinking = blinkingDots[currentSequenceIndex] === index

        return (
          <div
            key={index}
            className={`absolute rounded-full transition-colors duration-200 ${
              isCurrentlyBlinking ? "bg-green-500" : "bg-gray-400"
            }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: "32px",
              height: "32px",
              transform: "translate(-50%, -50%)",
            }}
          />
        )
      })}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64">
        <div className="text-center mb-2">
          <div className="text-sm text-gray-600">Memorize the sequence</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div> */}
    </>
  )
}

interface PatternPhaseProps {
  patternChallenges: PatternChallenge[]
  symmetryPatterns: SymmetryPattern[]
  currentSequenceIndex: number
  symmetryTimeLeft: number
  onAnswer: (answer: boolean) => void
  showAnswers: boolean
}

export function PatternPhase({
  patternChallenges,
  symmetryPatterns,
  currentSequenceIndex,
  symmetryTimeLeft,
  onAnswer,
  showAnswers = false,
}: PatternPhaseProps) {
  const currentChallenge = patternChallenges[currentSequenceIndex]

  if (currentChallenge) {
    return (
      <PatternComparison
        patterns={currentChallenge.patterns}
        completion={currentChallenge.completion}
        question={
          currentChallenge.type === "grid-symmetry"
            ? "Is this pattern symmetric?"
            : currentChallenge.type === "rotation-check"
              ? "Are these patterns rotated but identical?"
              : currentChallenge.type === "pattern-arithmetic"
                ? "Is this pattern equation correct?"
                : "Is this pattern completion correct?"
        }
        onAnswer={onAnswer}
        timeLeft={symmetryTimeLeft}
        
      />
    )
  }

  // Fallback to old pattern display system
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 items-center">
        <div className="relative w-48 h-48 border-2 border-gray-300 bg-gray-50 p-4">
          {symmetryPatterns[currentSequenceIndex]?.dots.map((dot, index) => (
            <div
              key={`pattern1-${index}`}
              className="absolute w-6 h-6 bg-blue-500 rounded-full"
              style={{
                left: `${dot.x * 0.8 + 10}%`,
                top: `${dot.y * 0.8 + 10}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <div className="relative w-48 h-48 border-2 border-gray-300 bg-gray-50 p-4">
          {symmetryPatterns[currentSequenceIndex]?.dots.map((dot, index) => (
            <div
              key={`pattern2-${index}`}
              className="absolute w-6 h-6 bg-blue-500 rounded-full"
              style={{
                left: `${dot.x * 0.8 + 10}%`,
                top: `${dot.y * 0.8 + 10}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-medium mb-2">Are these patterns symmetric?</div>
        <div className="flex gap-4">
          <Button onClick={() => onAnswer(true)} className="bg-green-600 hover:bg-green-700" size="lg">
            Yes
          </Button>
          <Button onClick={() => onAnswer(false)} className="bg-red-600 hover:bg-red-700" size="lg">
            No
          </Button>
        </div>
      </div>
    </div>
  )
}

interface RecallPhaseProps {
  dotPositions: DotPosition[]
  playerSelections: number[]
  blinkingDots: number[]
  onDotClick: (index: number) => void
  showAnswers?: boolean
}

export function RecallPhase({ dotPositions, playerSelections, blinkingDots, onDotClick, showAnswers = false }: RecallPhaseProps) {
  return (
    <>
      {dotPositions.map((pos, index) => {
        const wasSelected = playerSelections.includes(index)
        const wasCorrect = wasSelected && blinkingDots.includes(index)
        const wasWrong = wasSelected && !blinkingDots.includes(index)
        const shouldShowCorrect = showAnswers && blinkingDots.includes(index) // show correct answers when showAnswers is true

        return (
          <div
            key={index}
              className={`absolute rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center ${
              wasCorrect
                ? "bg-green-600"
                : wasWrong
                  ? "bg-red-500"
                  : shouldShowCorrect
                    ? "bg-green-400"
                    : // highlight correct answers
                      "bg-gray-400 hover:bg-gray-500"
            }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: "30px",
              height: "30px",
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onDotClick(index)}
            >
            {wasWrong && <div className="text-white font-bold text-lg">×</div>}
          </div>
        )
      })}
    </>
  )
}


