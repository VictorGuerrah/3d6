import { Test, TestingModule } from '@nestjs/testing';
import { EncounterService } from './encounter.service';
import { EncounterDifficulty, EnemyType } from './encounter.constants';

describe('EncounterService', () => {
  let service: EncounterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncounterService],
    }).compile();
    service = module.get<EncounterService>(EncounterService);
  });

  it('includes a Perfect option for 4 players on Medium', () => {
    const results = service.computeEncounters({
      numPlayers: 4,
      difficulty: EncounterDifficulty.Medium,
      enemyPool: Object.values(EnemyType),
      maxResults: 50,
    });

    expect(
      results.some(
        (r) =>
          r.composition[EnemyType.Medium] === 2 &&
          r.composition[EnemyType.Weak] === 2 &&
          r.baseThreatPoints === 8 &&
          r.totalAPR === 4 &&
          r.category === 'Perfect',
      ),
    ).toBeTruthy();
  });

  it('includes a Risky option when APR is above limit (swarm tax)', () => {
    const results = service.computeEncounters({
      numPlayers: 4,
      difficulty: EncounterDifficulty.Medium,
      enemyPool: Object.values(EnemyType),
      maxResults: 200,
    });

    expect(
      results.some(
        (r) =>
          r.composition[EnemyType.Weak] === 8 &&
          r.totalAPR > r.aprLimit &&
          r.category === 'Risky',
      ),
    ).toBeTruthy();
  });

  it('includes a reasonable Epic option for 2 players', () => {
    const results = service.computeEncounters({
      numPlayers: 2,
      difficulty: EncounterDifficulty.Epic,
      enemyPool: Object.values(EnemyType),
      maxResults: 200,
    });

    expect(
      results.some(
        (r) =>
          r.composition[EnemyType.VeryStrong] === 1 &&
          r.composition[EnemyType.Weak] === 1 &&
          r.composition[EnemyType.VeryWeak] === 2 &&
          r.totalAPR === 4,
      ),
    ).toBeTruthy();
  });
});
