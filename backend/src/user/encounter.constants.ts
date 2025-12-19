
/**
 * Enemy types for encounter calculation.
 */
export enum EnemyType {
  VeryWeak = 'Very Weak',
  Weak = 'Weak',
  Medium = 'Medium',
  Strong = 'Strong',
  VeryStrong = 'Very Strong',
  Legendary = 'Legendary',
}

/**
 * Enemy stats for each type.
 */
export interface EnemyStats {
  type: EnemyType;
  hp: number;
  attacksPerRound: number;
  threatPoints: number;
  extraControl?: number;
  extraAttack?: number;
}

export const ENEMY_STATS: EnemyStats[] = [
  { type: EnemyType.VeryWeak, hp: 1, attacksPerRound: 1, threatPoints: 0.5 },
  { type: EnemyType.Weak, hp: 2, attacksPerRound: 1, threatPoints: 1 },
  { type: EnemyType.Medium, hp: 5, attacksPerRound: 1, threatPoints: 3 },
  { type: EnemyType.Strong, hp: 8, attacksPerRound: 1, threatPoints: 6 },
  { type: EnemyType.VeryStrong, hp: 12, attacksPerRound: 1, threatPoints: 9, extraControl: 1 },
  { type: EnemyType.Legendary, hp: 15, attacksPerRound: 2, threatPoints: 18, extraAttack: 1 },
];

/**
 * Encounter difficulty levels.
 */
export enum EncounterDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Epic = 'Epic',
}

/**
 * Numeric mapping for each difficulty.
 */
export const DIFFICULTY_NUMERIC: Record<EncounterDifficulty, number> = {
  [EncounterDifficulty.Easy]: 2,
  [EncounterDifficulty.Medium]: 3,
  [EncounterDifficulty.Hard]: 4,
  [EncounterDifficulty.Epic]: 5,
};

/**
 * Threat Points target table by number of players and difficulty.
 */
export const THREAT_POINTS_TARGET_TABLE: Record<number, Record<EncounterDifficulty, number>> = {
  2: { [EncounterDifficulty.Easy]: 2, [EncounterDifficulty.Medium]: 4, [EncounterDifficulty.Hard]: 6, [EncounterDifficulty.Epic]: 12 },
  3: { [EncounterDifficulty.Easy]: 3, [EncounterDifficulty.Medium]: 6, [EncounterDifficulty.Hard]: 9, [EncounterDifficulty.Epic]: 12 },
  4: { [EncounterDifficulty.Easy]: 4, [EncounterDifficulty.Medium]: 8, [EncounterDifficulty.Hard]: 12, [EncounterDifficulty.Epic]: 16 },
  5: { [EncounterDifficulty.Easy]: 5, [EncounterDifficulty.Medium]: 10, [EncounterDifficulty.Hard]: 15, [EncounterDifficulty.Epic]: 20 },
};

/**
 * Attack per round limit factor by difficulty.
 */
export const APR_LIMIT_FACTOR: Record<number, number> = {
  2: 0.75, // Easy
  3: 1.0,  // Medium
  4: 1.5,  // Hard
  5: 2.0,  // Epic
};
