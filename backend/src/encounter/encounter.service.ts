import { Injectable } from '@nestjs/common';
import {
  APR_LIMIT_FACTOR,
  DIFFICULTY_NUMERIC,
  ENEMY_STATS,
  EnemyType,
  THREAT_POINTS_TARGET_TABLE,
} from './encounter.constants';
import {
  ComputeEncountersInput,
  ComputeEncountersOutput,
  EncounterComposition,
} from './dto/compute-encounters.dto';

/**
 * Utility: round up to the nearest 0.5.
 */
function roundUpToNearestHalf(num: number): number {
  return Math.ceil(num * 2) / 2;
}

/**
 * Utility: create a zeroed encounter composition.
 */
function getDefaultComposition(): EncounterComposition {
  return Object.values(EnemyType).reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as EncounterComposition);
}

@Injectable()
export class EncounterService {
  /**
   * Compute optimal enemy encounter combinations based on input parameters.
   */
  computeEncounters(input: ComputeEncountersInput): ComputeEncountersOutput[] {
    const {
      numPlayers,
      difficulty,
      enemyPool,
      maxResults = 20,
      allowSwarmTax = true,
    } = input;

    const enemyTypes = enemyPool && enemyPool.length > 0 ? enemyPool : Object.values(EnemyType);
    const threatTarget = THREAT_POINTS_TARGET_TABLE[numPlayers]?.[difficulty];
    if (!threatTarget) return [];

    const difficultyNumeric = DIFFICULTY_NUMERIC[difficulty];
    const aprLimit = Math.ceil(APR_LIMIT_FACTOR[difficultyNumeric] * numPlayers);

    const maxEnemies = Math.min(10, Math.ceil(threatTarget / 0.5));
    const results: ComputeEncountersOutput[] = [];
    const seen = new Set<string>();

    const self = this;
    function backtrack(idx: number, current: number[], total: number) {
      if (total > threatTarget * 1.5) return;
      const sum = current.reduce((a, b) => a + b, 0);
      if (sum > maxEnemies) return;
      if (sum > 0) {
        const comp: EncounterComposition = getDefaultComposition();
        enemyTypes.forEach((type, i) => (comp[type] = current[i]));
        const key = enemyTypes.map((type, i) => `${type}:${current[i]}`).join(',');
        if (!seen.has(key)) {
          seen.add(key);
          const out = self.evaluateComposition(
            comp,
            enemyTypes,
            threatTarget,
            aprLimit,
            difficultyNumeric,
            allowSwarmTax,
          );
          if (out) results.push(out);
        }
      }
      for (let i = idx; i < enemyTypes.length; i++) {
        current[i]++;
        const enemy = ENEMY_STATS.find((e) => e.type === enemyTypes[i]);
        backtrack(i, current, total + (enemy?.threatPoints || 0));
        current[i]--;
      }
    }
    backtrack(0, Array(enemyTypes.length).fill(0), 0);

    results.sort((a, b) => {
      const catOrder = ['Perfect', 'Good', 'Challenging', 'Risky', 'Weak'];
      const ca = catOrder.indexOf(a.category);
      const cb = catOrder.indexOf(b.category);
      if (ca !== cb) return ca - cb;
      return Math.abs(a.diffPercent) - Math.abs(b.diffPercent);
    });
    return results.slice(0, maxResults);
  }

  /**
   * Evaluate a single encounter composition and compute all metrics.
   */
  evaluateComposition(
    comp: EncounterComposition,
    enemyTypes: EnemyType[],
    threatTarget: number,
    aprLimit: number,
    difficultyNumeric: number,
    allowSwarmTax: boolean,
  ): ComputeEncountersOutput | null {
    let baseThreatPoints = 0;
    let totalAPR = 0;
    const enemyStatsArr = enemyTypes.map((type) => ENEMY_STATS.find((e) => e.type === type)!);
    for (let i = 0; i < enemyTypes.length; i++) {
      baseThreatPoints += comp[enemyTypes[i]] * enemyStatsArr[i].threatPoints;
      totalAPR += comp[enemyTypes[i]] * enemyStatsArr[i].attacksPerRound;
    }

    let effectiveThreatPoints = baseThreatPoints;
    let nExtras = 0;
    let explanation = '';
    let aprStatus = 'Within limit';

    if (totalAPR > aprLimit) {
      aprStatus = 'Above limit';
      nExtras = totalAPR - aprLimit;
      if (!allowSwarmTax) return null;

      const penalizables: { type: EnemyType; threat: number; count: number }[] = enemyTypes.map(
        (type, i) => ({
          type,
          threat: enemyStatsArr[i].threatPoints,
          count: comp[type],
        }),
      );
      penalizables.sort((a, b) => a.threat - b.threat);

      let extrasLeft = nExtras;
      let penalizedThreat = 0;
      let removedThreat = 0;
      const penalized: { type: EnemyType; base: number; penal: number; qty: number }[] = [];

      for (const p of penalizables) {
        if (extrasLeft <= 0) break;
        const toPenalize = Math.min(p.count, extrasLeft);
        for (let j = 0; j < toPenalize; j++) {
          const base = p.threat;
          const penal = roundUpToNearestHalf(base * 1.5);
          penalizedThreat += penal;
          removedThreat += base;
          penalized.push({ type: p.type, base, penal, qty: 1 });
        }
        extrasLeft -= toPenalize;
      }

      effectiveThreatPoints = baseThreatPoints - removedThreat + penalizedThreat;
      explanation += `Swarm Tax: ${nExtras} penalized enemies (${penalized
        .map((p) => `${p.type} +${(p.penal - p.base).toFixed(1)}`)
        .join(', ')}). `;
    }

    const diffThreatPoints = effectiveThreatPoints - threatTarget;
    const diffPercent = (effectiveThreatPoints / threatTarget - 1) * 100;

    let category = '';
    if (Math.abs(diffPercent) <= 5 && totalAPR <= aprLimit) category = 'Perfect';
    else if (Math.abs(diffPercent) <= 10 && totalAPR <= aprLimit) category = 'Good';
    else if (diffPercent > 10 && diffPercent <= 25) category = 'Challenging';
    else if (diffPercent > 25 || nExtras >= 2) category = 'Risky';
    else if (diffPercent < -10) category = 'Weak';
    else category = 'Good';

    explanation = `${Object.entries(comp)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${v} ${k}`)
      .join(' + ')} = ${baseThreatPoints} TP; APR ${totalAPR}; ${aprStatus}. ${explanation}`.trim();

    return {
      composition: comp,
      baseThreatPoints,
      totalAPR,
      aprLimit,
      effectiveThreatPoints,
      diffThreatPoints,
      diffPercent,
      category,
      aprStatus,
      explanation,
    };
  }
}
