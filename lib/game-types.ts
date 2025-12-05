// Campaign and game state types for the Detective AI Game

export interface DetectiveSkills {
  perception: number      // Spot hidden clues, notice details
  persuasion: number      // Get suspects to reveal information
  logic: number           // Solve puzzles, deduce connections
  investigation: number   // Find evidence, analyze crime scenes
}

export interface DetectiveProfile {
  id: string
  name: string
  rank: DetectiveRank
  experience: number
  level: number
  skills: DetectiveSkills
  casesCompleted: number
  casesWon: number
  achievements: string[]
  createdAt: number
}

export type DetectiveRank =
  | 'Novato'
  | 'Detective Junior'
  | 'Detective'
  | 'Detective Senior'
  | 'Inspector'
  | 'Inspector Jefe'
  | 'Comisario'

export interface Chapter {
  id: string
  number: number
  title: string
  description: string
  casesRequired: number
  isUnlocked: boolean
  isCompleted: boolean
  mastermindClue: string  // Clue about the recurring antagonist
  theme: CaseTheme
}

export type CaseTheme =
  | 'corporate'     // Corporate crime, embezzlement
  | 'passion'       // Crimes of passion, relationships
  | 'organized'     // Organized crime, mafia
  | 'revenge'       // Revenge plots
  | 'conspiracy'    // Political/conspiracy

export interface CampaignProgress {
  currentChapter: number
  chaptersCompleted: number[]
  casesInChapter: number
  totalCasesCompleted: number
  mastermindCluesFound: string[]
  storyProgress: StoryProgress
}

export interface StoryProgress {
  introductionComplete: boolean
  mastermindRevealed: boolean
  finalConfrontation: boolean
  endingType: EndingType | null
}

export type EndingType =
  | 'perfect'       // All chapters A-rank, mastermind caught
  | 'good'          // Mastermind caught, good performance
  | 'neutral'       // Mastermind caught, mixed performance  
  | 'bittersweet'   // Mastermind escapes but cases solved

export interface CaseResult {
  caseId: string
  chapterId: string
  grade: CaseGrade
  timeSpent: number
  questionsAsked: number
  hintsUsed: number
  correctAccusation: boolean
  minigamesCompleted: number
  experienceGained: number
  achievementsUnlocked: string[]
}

export type CaseGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface ActiveSession {
  caseData: any
  startTime: number
  notes: string
  stats: {
    questionsAsked: number
    hintsUsed: number
    minigamesCompleted: number
  }
}

export interface GameState {
  detective: DetectiveProfile
  campaign: CampaignProgress
  currentCase: any | null  // CaseData from case-generator
  activeSession?: ActiveSession | null // Persisted session data
  caseHistory: CaseResult[]
  settings: GameSettings
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  timerEnabled: boolean
  hintsEnabled: boolean
  soundEnabled: boolean
  autoSave: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement: AchievementRequirement
  isSecret: boolean
}

export type AchievementCategory =
  | 'cases'         // Case completion achievements
  | 'interrogation' // Interrogation-related
  | 'minigames'     // Minigame mastery
  | 'skills'        // Skill-related achievements
  | 'campaign'      // Story progression
  | 'special'       // Hidden/special achievements

export interface AchievementRequirement {
  type: 'count' | 'single' | 'condition'
  target: number | string
  current?: number
}

// Mastermind "El Arquitecto" - recurring antagonist
export interface MastermindProfile {
  name: string
  alias: string
  description: string
  motivations: string[]
  connectionToCase: string  // How they connect to current case
  hiddenClues: string[]     // Clues scattered through cases
}

export const THE_ARCHITECT: MastermindProfile = {
  name: 'Desconocido',
  alias: 'El Arquitecto',
  description: 'Un criminal mastermind que orquesta crímenes desde las sombras. Cada caso resuelto revela una pieza más del rompecabezas.',
  motivations: [
    'Control absoluto del submundo criminal',
    'Venganza contra el sistema de justicia',
    'Una red criminal que abarca toda la ciudad'
  ],
  connectionToCase: '',
  hiddenClues: []
}

// Experience thresholds for leveling
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 800,
  6: 1200,
  7: 1700,
  8: 2300,
  9: 3000,
  10: 4000,
  11: 5200,
  12: 6600,
  13: 8200,
  14: 10000,
  15: 12000
}

// Rank thresholds based on level
export const RANK_THRESHOLDS: Record<number, DetectiveRank> = {
  1: 'Novato',
  3: 'Detective Junior',
  5: 'Detective',
  7: 'Detective Senior',
  10: 'Inspector',
  12: 'Inspector Jefe',
  15: 'Comisario'
}

export function getRankForLevel(level: number): DetectiveRank {
  const levels = Object.keys(RANK_THRESHOLDS).map(Number).sort((a, b) => b - a)
  for (const threshold of levels) {
    if (level >= threshold) {
      return RANK_THRESHOLDS[threshold]
    }
  }
  return 'Novato'
}

export function calculateGrade(result: Partial<CaseResult>): CaseGrade {
  let score = 100

  // Deductions
  if (!result.correctAccusation) score -= 40
  if ((result.hintsUsed || 0) > 0) score -= (result.hintsUsed || 0) * 5
  if ((result.timeSpent || 0) > 1800000) score -= 10 // More than 30 mins
  if ((result.questionsAsked || 0) > 20) score -= 5

  // Bonuses
  if ((result.minigamesCompleted || 0) >= 3) score += 10

  if (score >= 95) return 'S'
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}
