// Campaign system with chapters, story progression, and localStorage persistence

import {
    Chapter,
    CampaignProgress,
    GameState,
    DetectiveProfile,
    CaseResult,
    CaseGrade,
    calculateGrade,
    getRankForLevel,
    LEVEL_THRESHOLDS,
    THE_ARCHITECT,
    type CaseTheme
} from './game-types'

const STORAGE_KEY = 'detective-ai-game-state'

// Chapter definitions for the campaign
export const CHAPTERS: Chapter[] = [
    {
        id: 'chapter-1',
        number: 1,
        title: 'Primeros Pasos',
        description: 'Tu primer día como detective. Casos simples que esconden algo más oscuro...',
        casesRequired: 2,
        isUnlocked: true,
        isCompleted: false,
        mastermindClue: 'Un símbolo extraño aparece en la escena del crimen - un triángulo con un ojo.',
        theme: 'passion'
    },
    {
        id: 'chapter-2',
        number: 2,
        title: 'Sombras Corporativas',
        description: 'El crimen se infiltra en los rascacielos. Nada es lo que parece.',
        casesRequired: 2,
        isUnlocked: false,
        isCompleted: false,
        mastermindClue: 'Los crímenes están conectados por transferencias bancarias a una cuenta fantasma.',
        theme: 'corporate'
    },
    {
        id: 'chapter-3',
        number: 3,
        title: 'La Red',
        description: 'Una organización criminal emerge. Pero, ¿quién la dirige?',
        casesRequired: 3,
        isUnlocked: false,
        isCompleted: false,
        mastermindClue: 'Un informante menciona a "El Arquitecto" - alguien que diseña crímenes perfectos.',
        theme: 'organized'
    },
    {
        id: 'chapter-4',
        number: 4,
        title: 'Venganza Personal',
        description: 'Los casos se vuelven personales. El Arquitecto te tiene en la mira.',
        casesRequired: 3,
        isUnlocked: false,
        isCompleted: false,
        mastermindClue: 'Descubres que El Arquitecto tiene una conexión con tu pasado.',
        theme: 'revenge'
    },
    {
        id: 'chapter-5',
        number: 5,
        title: 'El Arquitecto',
        description: 'La confrontación final. Desentraña la conspiración o pierde todo.',
        casesRequired: 2,
        isUnlocked: false,
        isCompleted: false,
        mastermindClue: 'La verdadera identidad de El Arquitecto será revelada.',
        theme: 'conspiracy'
    }
]

// Create initial detective profile
export function createDetectiveProfile(name: string = 'Detective'): DetectiveProfile {
    return {
        id: `detective-${Date.now()}`,
        name,
        rank: 'Novato',
        experience: 0,
        level: 1,
        skills: {
            perception: 1,
            persuasion: 1,
            logic: 1,
            investigation: 1
        },
        casesCompleted: 0,
        casesWon: 0,
        achievements: [],
        createdAt: Date.now()
    }
}

// Create initial game state
export function createInitialGameState(): GameState {
    return {
        detective: createDetectiveProfile(),
        campaign: {
            currentChapter: 1,
            chaptersCompleted: [],
            casesInChapter: 0,
            totalCasesCompleted: 0,
            mastermindCluesFound: [],
            storyProgress: {
                introductionComplete: false,
                mastermindRevealed: false,
                finalConfrontation: false,
                endingType: null
            }
        },
        currentCase: null,
        caseHistory: [],
        settings: {
            difficulty: 'medium',
            timerEnabled: true,
            hintsEnabled: true,
            soundEnabled: true,
            autoSave: true
        }
    }
}

// Save game state to localStorage
export function saveGameState(state: GameState): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
        console.error('Error saving game state:', error)
    }
}

// Load game state from localStorage
export function loadGameState(): GameState | null {
    if (typeof window === 'undefined') return null
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            return JSON.parse(saved)
        }
    } catch (error) {
        console.error('Error loading game state:', error)
    }
    return null
}

// Clear game state (new game)
export function clearGameState(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

// Calculate experience from case result
export function calculateExperience(result: CaseResult, difficulty: 'easy' | 'medium' | 'hard'): number {
    const baseXP = { easy: 50, medium: 100, hard: 150 }[difficulty]
    const gradeMultiplier: Record<CaseGrade, number> = {
        'S': 2.0,
        'A': 1.5,
        'B': 1.2,
        'C': 1.0,
        'D': 0.8,
        'F': 0.5
    }

    let xp = baseXP * gradeMultiplier[result.grade]

    // Bonus for minigames
    xp += result.minigamesCompleted * 10

    // Bonus for correct accusation
    if (result.correctAccusation) xp += 25

    return Math.round(xp)
}

// Level up detective if enough XP
export function checkLevelUp(detective: DetectiveProfile): DetectiveProfile {
    const nextLevel = detective.level + 1
    const threshold = LEVEL_THRESHOLDS[nextLevel]

    if (threshold && detective.experience >= threshold) {
        return {
            ...detective,
            level: nextLevel,
            rank: getRankForLevel(nextLevel),
            // Grant skill point on level up
            skills: {
                ...detective.skills,
                // Rotate skill improvements
                perception: detective.skills.perception + (nextLevel % 4 === 1 ? 1 : 0),
                persuasion: detective.skills.persuasion + (nextLevel % 4 === 2 ? 1 : 0),
                logic: detective.skills.logic + (nextLevel % 4 === 3 ? 1 : 0),
                investigation: detective.skills.investigation + (nextLevel % 4 === 0 ? 1 : 0)
            }
        }
    }

    return detective
}

// Complete a case and update game state
export function completeCase(
    state: GameState,
    caseData: any,
    wasCorrect: boolean,
    stats: { timeSpent: number; questionsAsked: number; hintsUsed: number; minigamesCompleted: number }
): GameState {
    const chapter = CHAPTERS[state.campaign.currentChapter - 1]

    const result: CaseResult = {
        caseId: caseData.caseId,
        chapterId: chapter.id,
        grade: calculateGrade({ ...stats, correctAccusation: wasCorrect }),
        timeSpent: stats.timeSpent,
        questionsAsked: stats.questionsAsked,
        hintsUsed: stats.hintsUsed,
        correctAccusation: wasCorrect,
        minigamesCompleted: stats.minigamesCompleted,
        experienceGained: 0,
        achievementsUnlocked: []
    }

    result.experienceGained = calculateExperience(result, state.settings.difficulty)

    // Update detective
    let detective = {
        ...state.detective,
        experience: state.detective.experience + result.experienceGained,
        casesCompleted: state.detective.casesCompleted + 1,
        casesWon: wasCorrect ? state.detective.casesWon + 1 : state.detective.casesWon
    }
    detective = checkLevelUp(detective)

    // Update campaign progress
    const newCasesInChapter = state.campaign.casesInChapter + 1
    const chapterComplete = newCasesInChapter >= chapter.casesRequired

    let newChaptersCompleted = [...state.campaign.chaptersCompleted]
    let newCurrentChapter = state.campaign.currentChapter
    let mastermindClues = [...state.campaign.mastermindCluesFound]

    if (chapterComplete) {
        newChaptersCompleted.push(state.campaign.currentChapter)
        newCurrentChapter = Math.min(state.campaign.currentChapter + 1, CHAPTERS.length)
        mastermindClues.push(chapter.mastermindClue)

        // Unlock next chapter
        if (newCurrentChapter <= CHAPTERS.length) {
            CHAPTERS[newCurrentChapter - 1].isUnlocked = true
        }
    }

    const campaign: CampaignProgress = {
        ...state.campaign,
        casesInChapter: chapterComplete ? 0 : newCasesInChapter,
        totalCasesCompleted: state.campaign.totalCasesCompleted + 1,
        chaptersCompleted: newChaptersCompleted,
        currentChapter: newCurrentChapter,
        mastermindCluesFound: mastermindClues,
        storyProgress: {
            ...state.campaign.storyProgress,
            introductionComplete: true,
            mastermindRevealed: newCurrentChapter >= 4,
            finalConfrontation: newCurrentChapter === 5 && chapterComplete
        }
    }

    const newState: GameState = {
        ...state,
        detective,
        campaign,
        caseHistory: [...state.caseHistory, result],
        currentCase: null
    }

    // Auto-save
    if (state.settings.autoSave) {
        saveGameState(newState)
    }

    return newState
}

// Get current chapter
export function getCurrentChapter(state: GameState): Chapter {
    return CHAPTERS[state.campaign.currentChapter - 1] || CHAPTERS[0]
}

// Get chapter-specific case generation params
export function getChapterCaseParams(chapter: Chapter): { theme: CaseTheme; mastermindConnection: string } {
    return {
        theme: chapter.theme,
        mastermindConnection: chapter.mastermindClue
    }
}

// Get story intro for current chapter
export function getChapterIntro(chapter: Chapter): string {
    const intros: Record<number, string> = {
        1: `🔍 **CAPÍTULO 1: ${chapter.title}**\n\nBienvenido al departamento de homicidios. Como nuevo detective, te enfrentarás a tus primeros casos. Pero cuidado... hay patrones ocultos que conectan estos crímenes con algo más grande.`,
        2: `🏢 **CAPÍTULO 2: ${chapter.title}**\n\nEl crimen no solo habita en callejones oscuros. Los corredores de poder esconden secretos mortales. Tu investigación te llevará a la élite de la ciudad.`,
        3: `🕸️ **CAPÍTULO 3: ${chapter.title}**\n\nLos hilos se conectan. Una red criminal emerge de las sombras. En susurros escuchas un nombre: "El Arquitecto". ¿Quién está detrás de todo esto?`,
        4: `💀 **CAPÍTULO 4: ${chapter.title}**\n\nEl Arquitecto sabe quién eres. Los casos se vuelven personales. Cada crimen es un mensaje dirigido a ti. Es hora de la verdad.`,
        5: `⚔️ **CAPÍTULO 5: ${chapter.title}**\n\nLa confrontación final. Todo lo que has aprendido te ha llevado a este momento. Desentraña la verdad... o piérdelo todo. El Arquitecto te espera.`
    }
    return intros[chapter.number] || ''
}

// Check for achievements
export function checkAchievements(state: GameState): string[] {
    const newAchievements: string[] = []
    const detective = state.detective

    // Case completion achievements
    if (detective.casesCompleted === 1 && !detective.achievements.includes('first_case')) {
        newAchievements.push('first_case')
    }
    if (detective.casesCompleted >= 5 && !detective.achievements.includes('five_cases')) {
        newAchievements.push('five_cases')
    }
    if (detective.casesCompleted >= 10 && !detective.achievements.includes('ten_cases')) {
        newAchievements.push('ten_cases')
    }

    // Perfect accusation streak
    const recentCases = state.caseHistory.slice(-3)
    if (recentCases.length === 3 && recentCases.every(c => c.correctAccusation) && !detective.achievements.includes('streak_3')) {
        newAchievements.push('streak_3')
    }

    // S-rank achievement
    if (state.caseHistory.some(c => c.grade === 'S') && !detective.achievements.includes('s_rank')) {
        newAchievements.push('s_rank')
    }

    // Level achievements
    if (detective.level >= 5 && !detective.achievements.includes('level_5')) {
        newAchievements.push('level_5')
    }
    if (detective.level >= 10 && !detective.achievements.includes('level_10')) {
        newAchievements.push('level_10')
    }

    // Chapter completion
    if (state.campaign.chaptersCompleted.length >= 1 && !detective.achievements.includes('chapter_1_complete')) {
        newAchievements.push('chapter_1_complete')
    }
    if (state.campaign.chaptersCompleted.length >= 5 && !detective.achievements.includes('campaign_complete')) {
        newAchievements.push('campaign_complete')
    }

    return newAchievements
}

// Get achievement details
export function getAchievementDetails(id: string): { name: string; description: string; icon: string } {
    const achievements: Record<string, { name: string; description: string; icon: string }> = {
        first_case: { name: 'Primer Caso', description: 'Completa tu primer caso', icon: '🎯' },
        five_cases: { name: 'Detective Novato', description: 'Completa 5 casos', icon: '⭐' },
        ten_cases: { name: 'Veterano', description: 'Completa 10 casos', icon: '🏆' },
        streak_3: { name: 'Sin Errores', description: '3 acusaciones correctas seguidas', icon: '🔥' },
        s_rank: { name: 'Perfección', description: 'Obtén rango S en un caso', icon: '💎' },
        level_5: { name: 'En Ascenso', description: 'Alcanza nivel 5', icon: '📈' },
        level_10: { name: 'Maestro', description: 'Alcanza nivel 10', icon: '🌟' },
        chapter_1_complete: { name: 'Capítulo Cerrado', description: 'Completa el Capítulo 1', icon: '📖' },
        campaign_complete: { name: 'Justicia Servida', description: 'Completa toda la campaña', icon: '👑' },
        no_hints: { name: 'Intuición Pura', description: 'Completa un caso sin pistas', icon: '🧠' },
        speed_demon: { name: 'Velocidad', description: 'Completa un caso en menos de 10 min', icon: '⚡' },
        interrogator: { name: 'Interrogador', description: 'Haz 50 preguntas en interrogatorios', icon: '💬' },
        minigame_master: { name: 'Maestro de Minijuegos', description: 'Completa todos los minijuegos en un caso', icon: '🎮' }
    }
    return achievements[id] || { name: 'Desconocido', description: '', icon: '❓' }
}
