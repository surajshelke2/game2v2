export interface GridPattern {
  grid: boolean[][]
  size: number
  type: "rotational" | "non-rotational"
}

export interface LinePattern {
  dots: { x: number; y: number }[]
  lines: { from: number; to: number }[]
  type: "completion" | "transformation"
}

export interface PatternCompletion {
  patternA: LinePattern
  patternB: LinePattern
  result: LinePattern
  isCorrect: boolean
  operation: "add" | "subtract" | "transform"
}

export interface PatternChallenge {
  id: string
  type: "rotation-check" | "pattern-arithmetic" | "grid-symmetry"
  patterns: (GridPattern | LinePattern)[]
  completion?: PatternCompletion
  correctAnswer: boolean | number
  difficulty: number
}

export function generateGridPattern(size: number, type: "rotational" | "non-rotational"): GridPattern {
  const grid: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  if (type === "rotational") {
    // Generate rotationally symmetric pattern (180 degrees)
    const centerRow = Math.floor(size / 2)
    const centerCol = Math.floor(size / 2)

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row < centerRow || (row === centerRow && col <= centerCol)) {
          if (Math.random() > 0.6) {
            grid[row][col] = true
            // Add rotated counterpart
            const rotatedRow = size - 1 - row
            const rotatedCol = size - 1 - col
            if (rotatedRow !== row || rotatedCol !== col) {
              grid[rotatedRow][rotatedCol] = true
            }
          }
        }
      }
    }
  } else {
    // Generate non-rotational pattern
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        grid[row][col] = Math.random() > 0.65
      }
    }
    // Ensure it's actually non-rotational by breaking rotational symmetry
    if (isGridRotationallySymmetric(grid)) {
      grid[0][size - 1] = !grid[size - 1][0]
    }
  }

  return { grid, size, type }
}

// Generate line-based pattern completion challenges
export function generateLinePattern(difficulty: number, operation?: "simple" | "complex"): LinePattern {
  const dots: { x: number; y: number }[] = []

  // Create 3x3 grid of dots
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      dots.push({
        x: col * 40 + 20,
        y: row * 40 + 20,
      })
    }
  }

  const lines: { from: number; to: number }[] = []

  if (operation === "complex") {
    // More complex patterns for higher levels
    const complexPatterns = [
      // Cross patterns
      [1, 4, 7, 3, 4, 5], // vertical + horizontal cross
      [0, 4, 8, 2, 4, 6], // diagonal cross
      // L-shapes and corners
      [0, 1, 2, 2, 5, 8], // top row + right column
      [6, 3, 0, 0, 1, 2], // left column + top row
      // Triangular patterns
      [0, 2, 6, 0], // triangle
      [1, 3, 5, 7, 1], // diamond
    ]

    const selectedPattern = complexPatterns[Math.floor(Math.random() * complexPatterns.length)]
    for (let i = 0; i < selectedPattern.length - 1; i++) {
      lines.push({
        from: selectedPattern[i],
        to: selectedPattern[i + 1],
      })
    }
  } else {
    // Simple patterns for basic levels
    const simplePatterns = [
      [0, 4, 8], // diagonal
      [2, 4, 6], // other diagonal
      [0, 3, 6], // left column
      [1, 4, 7], // middle column
      [2, 5, 8], // right column
      [0, 1, 2], // top row
      [3, 4, 5], // middle row
      [6, 7, 8], // bottom row
    ]

    const selectedPattern = simplePatterns[Math.floor(Math.random() * simplePatterns.length)]
    for (let i = 0; i < selectedPattern.length - 1; i++) {
      lines.push({
        from: selectedPattern[i],
        to: selectedPattern[i + 1],
      })
    }
  }

  return { dots, lines, type: "completion" }
}

export function isGridRotationallySymmetric(grid: boolean[][]): boolean {
  const size = grid.length

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const rotatedRow = size - 1 - row
      const rotatedCol = size - 1 - col
      if (grid[row][col] !== grid[rotatedRow][rotatedCol]) {
        return false
      }
    }
  }

  return true
}

function gridsEqual(a: boolean[][], b: boolean[][]): boolean {
  const size = a.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (a[r][c] !== b[r][c]) return false
    }
  }
  return true
}


// Generate a complete pattern challenge
export function generatePatternChallenge(
  level: number,
  type: "rotation-check" | "pattern-arithmetic",
): PatternChallenge {
  const difficulty = Math.min(level, 6)

  if (type === "pattern-arithmetic") {
    const completion = generatePatternCompletion(difficulty)

    return {
      id: `arithmetic-${Date.now()}-${Math.random()}`,
      type: "pattern-arithmetic",
      patterns: [completion.patternA, completion.patternB, completion.result],
      completion,
      correctAnswer: completion.isCorrect,
      difficulty,
    }
  } else {
    // rotation-check
    const isRotational = Math.random() > 0.5
    const size = 4 + Math.floor(difficulty / 2) // 4x4 to 7x7 grids

    const pattern1 = generateGridPattern(size, isRotational ? "rotational" : "non-rotational")

    // Create a second pattern that may or may not be a rotation of the first
    const pattern2 = JSON.parse(JSON.stringify(pattern1)) // Deep copy

    const shouldRotate = Math.random() > 0.5
    if (shouldRotate) {
      pattern2.grid = rotateGrid90(pattern2.grid)
    }

    const correctAnswer = gridsEqual(pattern1.grid, pattern2.grid);

    return {
      id: `rotation-${Date.now()}-${Math.random()}`,
      type: "rotation-check",
      patterns: [pattern1, pattern2],
      correctAnswer,
      difficulty,
    }
  }
}

function rotateGrid90(grid: boolean[][]): boolean[][] {
  const size = grid.length
  const rotated: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      rotated[col][size - 1 - row] = grid[row][col]
    }
  }

  return rotated
}

export function generateTrickyPattern(size: number): GridPattern {
  const pattern = generateGridPattern(size, "rotational")

  // Introduce subtle non-rotational asymmetry
  const row = Math.floor(Math.random() * size)
  const col = Math.floor(Math.random() * size)
  const rotatedRow = size - 1 - row
  const rotatedCol = size - 1 - col

  // Break rotational symmetry by making corresponding positions different
  if (row !== rotatedRow || col !== rotatedCol) {
    pattern.grid[row][col] = !pattern.grid[rotatedRow][rotatedCol]
  }
  pattern.type = "non-rotational"

  return pattern
}

export function generatePatternCompletion(difficulty: number): PatternCompletion {
  const operation = Math.random() > 0.5 ? "add" : "subtract"

  if (operation === "add") {
    // Generate A + B = C pattern
    const patternA = generateLinePattern(difficulty, "simple")
    const patternB = generateLinePattern(difficulty, "simple")

    // Create result by combining both patterns
    const combinedLines = [...patternA.lines, ...patternB.lines]
    // Remove duplicate lines
    const uniqueLines = combinedLines.filter(
      (line, index, arr) =>
        arr.findIndex(
          (l) => (l.from === line.from && l.to === line.to) || (l.from === line.to && l.to === line.from),
        ) === index,
    )

    const result: LinePattern = {
      dots: patternA.dots, // Same dot grid
      lines: uniqueLines,
      type: "completion",
    }

    // Sometimes generate wrong result for testing
    const isCorrect = Math.random() > 0.3 // 70% correct, 30% wrong
    if (!isCorrect) {
      // Add or remove a random line to make it wrong
      if (Math.random() > 0.5 && result.lines.length > 1) {
        result.lines.pop() // Remove a line
      } else {
        // Add a random line
        const randomFrom = Math.floor(Math.random() * 9)
        const randomTo = Math.floor(Math.random() * 9)
        if (randomFrom !== randomTo) {
          result.lines.push({ from: randomFrom, to: randomTo })
        }
      }
    }

    return {
      patternA,
      patternB,
      result,
      isCorrect,
      operation: "add",
    }
  } else {
    // Generate A - B = C pattern (subtraction)
    const patternA = generateLinePattern(difficulty, difficulty > 3 ? "complex" : "simple")
    const patternB = generateLinePattern(difficulty, "simple")

    // Create result by removing B's lines from A
    const resultLines = patternA.lines.filter(
      (lineA) =>
        !patternB.lines.some(
          (lineB) =>
            (lineA.from === lineB.from && lineA.to === lineB.to) ||
            (lineA.from === lineB.to && lineA.to === lineB.from),
        ),
    )

    const result: LinePattern = {
      dots: patternA.dots,
      lines: resultLines,
      type: "completion",
    }

    const isCorrect = Math.random() > 0.4 // 60% correct, 40% wrong
    if (!isCorrect) {
      // Add a random line that shouldn't be there
      const randomFrom = Math.floor(Math.random() * 9)
      const randomTo = Math.floor(Math.random() * 9)
      if (randomFrom !== randomTo) {
        result.lines.push({ from: randomFrom, to: randomTo })
      }
    }

    return {
      patternA,
      patternB,
      result,
      isCorrect,
      operation: "subtract",
    }
  }
}
