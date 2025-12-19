import { EnemyType, EncounterDifficulty } from '../encounter.constants';

/**
 * Input DTO for encounter computation.
 */
export interface ComputeEncountersInput {
  numPlayers: number;
  difficulty: EncounterDifficulty;
  enemyPool?: EnemyType[];
  maxResults?: number;
  allowSwarmTax?: boolean;
}

/**
 * Canonical encounter composition (enemy type → count).
 */
export type EncounterComposition = Record<EnemyType, number>;

/**
 * Output DTO for a single encounter result.
 */
export interface ComputeEncountersOutput {
  composition: EncounterComposition;
  baseThreatPoints: number;
  totalAPR: number;
  aprLimit: number;
  effectiveThreatPoints: number;
  diffThreatPoints: number;
  diffPercent: number;
  category: string;
  aprStatus: string;
  explanation: string;
}
