"use client"

import type { GridPattern, LinePattern, PatternCompletion } from "./pattern-generators"

interface GridPatternDisplayProps {
  pattern: GridPattern
  className?: string
  title?: string
}

export function GridPatternDisplay({ pattern, className = "", title }: GridPatternDisplayProps) {
  const cellSize = Math.max(20, Math.min(40, 200 / pattern.size))

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && <div className="text-sm font-medium mb-2 text-gray-600">{title}</div>}
      <div
        className="border-2 border-gray-300 bg-gray-50 p-2"
        style={{
          width: pattern.size * cellSize + 16,
          height: pattern.size * cellSize + 16,
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${pattern.size}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${pattern.size}, ${cellSize}px)`,
          }}
        >
          {pattern.grid.flat().map((filled, index) => (
            <div
              key={index}
              className={`border border-gray-200 ${filled ? "bg-gray-800" : "bg-white"}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface LinePatternDisplayProps {
  pattern: LinePattern
  className?: string
  title?: string
}

export function LinePatternDisplay({ pattern, className = "", title }: LinePatternDisplayProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && <div className="text-sm font-medium mb-2 text-gray-600">{title}</div>}
      <div className="relative w-24 h-24 border-2 border-gray-300 bg-white">
        <svg className="absolute inset-0 w-full h-full">
          {/* Draw lines */}
          {pattern.lines.map((line, index) => {
            const fromDot = pattern.dots[line.from]
            const toDot = pattern.dots[line.to]
            return (
              <line
                key={index}
                x1={fromDot.x}
                y1={fromDot.y}
                x2={toDot.x}
                y2={toDot.y}
                stroke="#374151"
                strokeWidth="2"
              />
            )
          })}

          {/* Draw dots */}
          {pattern.dots.map((dot, index) => (
            <circle key={index} cx={dot.x} cy={dot.y} r="3" fill="#1f2937" />
          ))}
        </svg>
      </div>
    </div>
  )
}

interface PatternArithmeticDisplayProps {
  completion: PatternCompletion
  className?: string
}

export function PatternArithmeticDisplay({ completion, className = "" }: PatternArithmeticDisplayProps) {
  const { patternA, patternB, result, operation } = completion

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="text-lg font-medium text-center">
        {operation === "add" ? "Pattern Addition" : "Pattern Transformation"}
      </div>

      <div className="flex items-center gap-6">
        <LinePatternDisplay pattern={patternA} title="A" />

        <div className="text-3xl font-bold text-gray-600">{operation === "add" ? "+" : "→"}</div>

        <LinePatternDisplay pattern={patternB} title="B" />

        <div className="text-3xl font-bold text-gray-600">=</div>

        <LinePatternDisplay pattern={result} title="?" />
      </div>

      <div className="text-sm text-gray-500 text-center">
        {operation === "add" ? "Does A + B equal the result?" : "Is this transformation correct?"}
      </div>
    </div>
  )
}

interface PatternComparisonProps {
  patterns: (GridPattern | LinePattern)[]
  completion?: PatternCompletion
  question: string
  onAnswer: (answer: boolean) => void
  timeLeft: number
}

export function PatternComparison({ patterns, completion, question, onAnswer, timeLeft }: PatternComparisonProps) {
  if (completion) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <PatternArithmeticDisplay completion={completion} />

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-3">Time left: {timeLeft}s</div>
          <div className="flex gap-4">
            <button
              onClick={() => onAnswer(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Correct
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Wrong
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-lg font-medium text-center">{question}</div>

      <div className="flex gap-8 items-center">
        {patterns.map((pattern, index) => (
          <div key={index}>
            {"grid" in pattern ? <GridPatternDisplay pattern={pattern} /> : <LinePatternDisplay pattern={pattern} />}
          </div>
        ))}

        {patterns.length === 2 && <div className="text-2xl font-bold text-gray-500">vs</div>}
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">Time left: {timeLeft}s</div>
        <div className="flex gap-4">
          <button
            onClick={() => onAnswer(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Yes
          </button>
          <button
            onClick={() => onAnswer(false)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
