"use client";

import { useState, useEffect, useCallback } from "react";
import {
  generatePatternChallenge,
  type PatternChallenge,
} from "./pattern-generators";
import { GameHUD } from "./game-hud";
import {
  StartScreen,
  LevelCompleteScreen,
  CompleteScreen,
} from "./game-screens";
import { BlinkingDots, PatternPhase, RecallPhase } from "./game-phases";

const LEVELS = {
  1: {
    dots: 3,
    patternChecks: 3,
    blinkDuration: 2500,
    patternTime: 7000,
    description: "Basic Rotation",
    gridSize: 4,
    trickyChance: 0,
  },
  2: {
    dots: 4,
    patternChecks: 4,
    blinkDuration: 2200,
    patternTime: 6500,
    description: "Pattern Addition",
    gridSize: 4,
    trickyChance: 0.1,
  },
  3: {
    dots: 5,
    patternChecks: 5,
    blinkDuration: 2000,
    patternTime: 6000,
    description: "Advanced Rotation",
    gridSize: 5,
    trickyChance: 0.2,
  },
  4: {
    dots: 4,
    patternChecks: 5,
    blinkDuration: 1800,
    patternTime: 5500,
    description: "Pattern Arithmetic",
    gridSize: 5,
    trickyChance: 0.3,
  },
  5: {
    dots: 5,
    patternChecks: 6,
    blinkDuration: 1600,
    patternTime: 5000,
    description: "Complex Patterns",
    gridSize: 6,
    trickyChance: 0.4,
  },
  6: {
    dots: 6,
    patternChecks: 7,
    blinkDuration: 1400,
    patternTime: 4500,
    description: "Master Challenge",
    gridSize: 6,
    trickyChance: 0.5,
  },
};

const TOTAL_GAME_TIME = 240;
const TOTAL_DOTS = 30;

type GamePhase =
  | "start"
  | "interleaved"
  | "recall"
  | "complete"
  | "level-complete";

interface DotPosition {
  x: number;
  y: number;
}

interface LevelStats {
  level: number;
  correctAnswers: number;
  totalAnswers: number;
  timeSpent: number;
  score: number;
}

export default function GridChallengeGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("start");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_GAME_TIME);
  const [dotPositions, setDotPositions] = useState<DotPosition[]>([]);
  const [blinkingDots, setBlinkingDots] = useState<number[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [isShowingBlink, setIsShowingBlink] = useState(true);
  const [blinkTimeLeft, setBlinkTimeLeft] = useState(0);
  const [playerSelections, setPlayerSelections] = useState<number[]>([]);
  const [clicksRemaining, setClicksRemaining] = useState(0);
  const [patternChallenges, setPatternChallenges] = useState<
    PatternChallenge[]
  >([]);
  const [patternTimeLeft, setPatternTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [levelStartTime, setLevelStartTime] = useState(0);
  const [currentLevelCorrect, setCurrentLevelCorrect] = useState(0);
  const [currentLevelTotal, setCurrentLevelTotal] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "correct" | "incorrect" } | null>(null)

  const generateDotPositions = useCallback(() => {
    const positions: DotPosition[] = [];
    const minDistance = 40;
    const containerWidth = 1000;
    const containerHeight = 500;
    const dotSize = 32;
    const margin = dotSize / 2;

    for (let i = 0; i < TOTAL_DOTS; i++) {
      let attempts = 0;
      let newPos: DotPosition;

      do {
        newPos = {
          x: Math.random() * (containerWidth - 2 * margin) + margin,
          y: Math.random() * (containerHeight - 2 * margin) + margin,
        };
        attempts++;
      } while (
        attempts < 100 &&
        positions.some(
          (pos) =>
            Math.sqrt(
              Math.pow(pos.x - newPos.x, 2) + Math.pow(pos.y - newPos.y, 2)
            ) < minDistance
        )
      );

      positions.push(newPos);
    }

    return positions;
  }, []);

  const generatePatternChallenges = useCallback(
    (level: number, numChallenges: number) => {
      const challenges: PatternChallenge[] = [];

      for (let i = 0; i < numChallenges; i++) {
        let challengeType: "rotation-check" | "pattern-arithmetic";

        if (level <= 3) {
          challengeType = "rotation-check";
        } else {
          challengeType = "pattern-arithmetic";
        }

        challenges.push(generatePatternChallenge(level, challengeType));
      }

      return challenges;
    },
    []
  );

  useEffect(() => {
    if (
      !gameStarted ||
      gamePhase === "complete" ||
      gamePhase === "start" ||
      gamePhase === "level-complete"
    )
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGamePhase("complete");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gamePhase]);

  const startGame = () => {
    setGameStarted(true);
    setGamePhase("interleaved");
    setCurrentLevel(1);
    setScore(0);
    setTimeRemaining(TOTAL_GAME_TIME);
    setLevelStats([]);
    startLevel(1);
  };

  const startLevel = (level: number) => {
    const levelConfig = LEVELS[level as keyof typeof LEVELS];
    setLevelStartTime(Date.now());
    setCurrentLevelCorrect(0);
    setCurrentLevelTotal(0);

    const positions = generateDotPositions();
    setDotPositions(positions);

    const dotsToSelect = levelConfig.dots;
    const selectedIndices: number[] = [];

    while (selectedIndices.length < dotsToSelect) {
      const randomIndex = Math.floor(Math.random() * TOTAL_DOTS);
      if (!selectedIndices.includes(randomIndex)) {
        selectedIndices.push(randomIndex);
      }
    }

    setBlinkingDots(selectedIndices);

    const numChecks = levelConfig.patternChecks;
    const challenges = generatePatternChallenges(level, numChecks);
    setPatternChallenges(challenges);

    setCurrentSequenceIndex(0);
    setIsShowingBlink(true);
    setBlinkTimeLeft(levelConfig.blinkDuration / 1000);
    setPatternTimeLeft(levelConfig.patternTime / 1000);
    setPlayerSelections([]);
    setClicksRemaining(dotsToSelect);
    setGamePhase("interleaved");
  };

  useEffect(() => {
    if (gamePhase !== "interleaved") return;

    const levelConfig = LEVELS[currentLevel as keyof typeof LEVELS];
    let timer: NodeJS.Timeout;

    if (isShowingBlink) {
      timer = setInterval(() => {
        setBlinkTimeLeft((prev) => {
          if (prev <= 1) {
            setIsShowingBlink(false);
            setPatternTimeLeft(levelConfig.patternTime / 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      timer = setInterval(() => {
        setPatternTimeLeft((prev) => {
          if (prev <= 1) {
            handlePatternAnswer(false,true); // Treat as incorrect due to timeout
            return levelConfig.patternTime / 1000;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gamePhase, isShowingBlink, currentSequenceIndex, currentLevel]);

  const handlePatternAnswer = (playerAnswer: boolean, isTimeout = false) => {
    const currentChallenge = patternChallenges[currentSequenceIndex];
     const isCorrect = !isTimeout && playerAnswer === currentChallenge.correctAnswer;

    const basePoints = isCorrect ? 3 : -1;
    const levelMultiplier = 1 + (currentLevel - 1) * 0.2;
    const points = Math.floor(basePoints * levelMultiplier);

    setScore((prev) => prev + points);
    setCurrentLevelTotal((prev) => prev + 1);
    if (isCorrect) {
      setCurrentLevelCorrect((prev) => prev + 1);
    }

  setToastMessage({
    message: isCorrect ? "Correct!" : isTimeout ? "Time Out!" : "Incorrect!",
    type: isCorrect ? "correct" : "incorrect",
  });


    setShowAnswers(true);
    setTimeout(() => {
      setShowAnswers(false);
        setToastMessage(null)

      const nextIndex = currentSequenceIndex + 1;

      if (nextIndex < blinkingDots.length) {
        setCurrentSequenceIndex(nextIndex);
        setIsShowingBlink(true);
        const levelConfig = LEVELS[currentLevel as keyof typeof LEVELS];
        setBlinkTimeLeft(levelConfig.blinkDuration / 1000);
      } else {
        setGamePhase("recall");
      }
    }, 1000);
  };

  const handleDotClick = (dotIndex: number) => {
    if (gamePhase !== "recall" || clicksRemaining <= 0) return;

    if (playerSelections.includes(dotIndex)) return;

    const isCorrect = blinkingDots.includes(dotIndex);
    const basePoints = isCorrect ? 3 : -1;
    const levelMultiplier = 1 + (currentLevel - 1) * 0.2;
    const points = Math.floor(basePoints * levelMultiplier);

    setScore((prev) => prev + points);
    setPlayerSelections((prev) => [...prev, dotIndex]);

    const newClicksRemaining = clicksRemaining - 1;
    setClicksRemaining(newClicksRemaining);

    if (newClicksRemaining <= 0) {
      setTimeout(() => {
        completeLevel();
      }, 500);
    }
  };

  const completeLevel = () => {
    const timeSpent = Date.now() - levelStartTime;
    const levelScore =
      score - levelStats.reduce((sum, stat) => sum + stat.score, 0);

    const newLevelStat: LevelStats = {
      level: currentLevel,
      correctAnswers: currentLevelCorrect,
      totalAnswers: currentLevelTotal,
      timeSpent,
      score: levelScore,
    };

    setLevelStats((prev) => [...prev, newLevelStat]);

    if (currentLevel >= 6) {
      setGamePhase("complete");
    } else {
      setCurrentLevel((prev) => prev + 1);
      startLevel(currentLevel + 1);
    }
  };

  const levelConfig = LEVELS[currentLevel as keyof typeof LEVELS];

  useEffect(() => {
    let totalMaxScore = 0;
    Object.values(LEVELS).forEach((level, index) => {
      const levelNumber = index + 1;
      const levelMultiplier = 1 + (levelNumber - 1) * 0.2;
      // Max points per pattern challenge (3 points) + max points per dot recall (3 points per dot)
      const maxPatternPoints = level.patternChecks * 3 * levelMultiplier;
      const maxDotPoints = level.dots * 3 * levelMultiplier;
      totalMaxScore += Math.floor(maxPatternPoints + maxDotPoints);
    });
    setMaxPossibleScore(totalMaxScore);
  }, []);

  const gameProgress =
    ((TOTAL_GAME_TIME - timeRemaining) / TOTAL_GAME_TIME) * 100;

  if (gamePhase === "start") {
    return <StartScreen onStartGame={startGame} />;
  }

  if (gamePhase === "level-complete") {
    return (
      <LevelCompleteScreen
        currentLevel={currentLevel}
        levelStats={levelStats}
      />
    );
  }

  if (gamePhase === "complete") {
    return (
      <CompleteScreen
        score={score}
        currentLevel={currentLevel}
        timeRemaining={timeRemaining}
        levelStats={levelStats}
        onPlayAgain={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="h-screen bg-white p-2 overflow-hidden flex flex-col">
      <GameHUD
        currentLevel={currentLevel}
        timeRemaining={timeRemaining}
        score={score}
        levelDescription={levelConfig.description}
        currentLevelCorrect={currentLevelCorrect}
        currentLevelTotal={currentLevelTotal}
        gameProgress={gameProgress}
        maxScore={maxPossibleScore}
      />

      {/* Phase indicator */}
      <div className="text-center mb-2">
        <div className="text-lg font-medium capitalize">
          {gamePhase === "interleaved" &&
            isShowingBlink &&
            `Blink ${currentSequenceIndex + 1}/${
              blinkingDots.length
            } - Watch and Remember`}
          {gamePhase === "interleaved" &&
            !isShowingBlink &&
            `Pattern ${currentSequenceIndex + 1}/${
              patternChallenges.length
            } - Analyze the Pattern`}
          {gamePhase === "recall" &&
            "Recall Phase - Click the dots that blinked"}
        </div>

        {toastMessage && (
        <div className="fixed bottom-2 right-[30px] transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-lg text-white font-semibold text-lg shadow-lg ${
              toastMessage.type === "correct" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toastMessage.message}
          </div>
        </div>
      )}

        {gamePhase === "interleaved" && isShowingBlink && (
          <div className="mt-2 max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${((LEVELS[currentLevel as keyof typeof LEVELS].blinkDuration / 1000 - blinkTimeLeft) / (LEVELS[currentLevel as keyof typeof LEVELS].blinkDuration / 1000)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {gamePhase === "interleaved" && !isShowingBlink && (
          <div className="mt-2 max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${
                    ((LEVELS[currentLevel as keyof typeof LEVELS].patternTime /
                      1000 -
                      patternTimeLeft) /
                      (LEVELS[currentLevel as keyof typeof LEVELS].patternTime /
                        1000)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center">
       <div className="relative" style={{ width: "1000px", height: "500px", border: "2px solid #e5e7eb" }}>
        
          {gamePhase === "interleaved" && isShowingBlink ? (
            <BlinkingDots
              dotPositions={dotPositions}
              blinkingDots={blinkingDots}
              currentSequenceIndex={currentSequenceIndex}
              blinkTimeLeft={blinkTimeLeft}
              totalBlinkTime={levelConfig.blinkDuration / 1000}
            />
          ) : gamePhase === "interleaved" && !isShowingBlink ? (
            <div className="flex items-center justify-center h-full">
              <PatternPhase
                patternChallenges={patternChallenges}
                symmetryPatterns={[]}
                currentSequenceIndex={currentSequenceIndex}
                symmetryTimeLeft={patternTimeLeft}
                onAnswer={handlePatternAnswer}
                showAnswers={showAnswers}
              />
            </div>
          ) : gamePhase === "recall" ? (
            <RecallPhase
              dotPositions={dotPositions}
              playerSelections={playerSelections}
              blinkingDots={blinkingDots}
              onDotClick={handleDotClick}
              showAnswers={showAnswers}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
