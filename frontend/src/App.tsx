
import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Locale = 'en' | 'pt-BR';

const TRANSLATIONS = {
  en: {
    title: 'Encounter Generator',
    playersLabel: 'Players',
    difficultyLabel: 'Difficulty',
    enemyTypesLabel: 'Enemy Types',
    generating: 'Generating...',
    generate: 'Generate Encounters',
    failedFetch: 'Failed to fetch results',
    unknownError: 'Unknown error',
    emptySuggestions: 'No suggestions found with the current filters.',
    theme: {
      light: 'Light',
      dark: 'Dark',
      title: 'Theme',
    },
    language: {
      title: 'Language',
      short: 'EN',
    },
    difficulties: {
      Easy: 'Easy',
      Medium: 'Medium',
      Hard: 'Hard',
      Epic: 'Epic',
    },
    enemyTypes: {
      'Very Weak': 'Very Weak',
      'Weak': 'Weak',
      'Medium': 'Medium',
      'Strong': 'Strong',
      'Very Strong': 'Very Strong',
      'Legendary': 'Legendary',
    },
    categories: {
      Balanced: 'Balanced',
      Challenging: 'Challenging',
    },
    hints: {
      Balanced: 'Good pick for most groups.',
      Challenging: 'Expect a tougher fight.',
    },
  },
  'pt-BR': {
    title: 'Gerador de Encontros',
    playersLabel: 'Jogadores',
    difficultyLabel: 'Dificuldade',
    enemyTypesLabel: 'Tipos de Inimigo',
    generating: 'Gerando...',
    generate: 'Gerar Encontros',
    failedFetch: 'Falha ao buscar os resultados',
    unknownError: 'Erro desconhecido',
    emptySuggestions: 'Nenhuma sugestão encontrada com os filtros atuais.',
    theme: {
      light: 'Claro',
      dark: 'Escuro',
      title: 'Tema',
    },
    language: {
      title: 'Idioma',
      short: 'PT-BR',
    },
    difficulties: {
      Easy: 'Fácil',
      Medium: 'Médio',
      Hard: 'Difícil',
      Epic: 'Épico',
    },
    enemyTypes: {
      'Very Weak': 'Muito Fraco',
      'Weak': 'Fraco',
      'Medium': 'Médio',
      'Strong': 'Forte',
      'Very Strong': 'Muito Forte',
      'Legendary': 'Lendário',
    },
    categories: {
      Balanced: 'Balanceado',
      Challenging: 'Desafiador',
    },
    hints: {
      Balanced: 'Boa escolha para a maioria dos grupos.',
      Challenging: 'Espere uma luta mais difícil.',
    },
  },
} as const;

const ENEMY_TYPES = [
  'Very Weak',
  'Weak',
  'Medium',
  'Strong',
  'Very Strong',
  'Legendary',
];
const PLAYER_COUNTS = [2, 3, 4, 5] as const;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Epic'];

type EncounterComposition = Record<string, number>;
type EncounterResult = {
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
};

type DisplayCategory = 'Balanced' | 'Challenging';

const DROPDOWN_ANIMATION_MS = 280;

function getDisplayCategory(category: string): DisplayCategory {
  if (category === 'Challenging' || category === 'Risky') return 'Challenging';
  return 'Balanced';
}

function compositionSignature(comp: EncounterComposition): string {
  return Object.entries(comp)
    .filter(([, qty]) => qty > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, qty]) => `${type}:${qty}`)
    .join('|');
}

function primaryEnemyType(comp: EncounterComposition): string {
  let bestType = '';
  let bestQty = -1;
  for (const [type, qty] of Object.entries(comp)) {
    if (qty > bestQty) {
      bestQty = qty;
      bestType = type;
    }
  }
  return bestType;
}

function pickVariedEncountersGrouped(all: EncounterResult[]): Record<DisplayCategory, EncounterResult[]> {
  const caps: Record<DisplayCategory, number> = { Balanced: 3, Challenging: 3 };
  const buckets: Record<DisplayCategory, EncounterResult[]> = { Balanced: [], Challenging: [] };
  for (const r of all) buckets[getDisplayCategory(r.category)].push(r);

  const usedSignatures = new Set<string>();
  const usedPrimary = new Set<string>();

  const pick = (cat: DisplayCategory, count: number): EncounterResult[] => {
    const list = buckets[cat]
      .slice()
      .sort((a, b) => {
        const ap = primaryEnemyType(a.composition);
        const bp = primaryEnemyType(b.composition);
        const aNew = usedPrimary.has(ap) ? 1 : 0;
        const bNew = usedPrimary.has(bp) ? 1 : 0;
        if (aNew !== bNew) return aNew - bNew;
        return Math.abs(a.diffPercent) - Math.abs(b.diffPercent);
      });

    const out: EncounterResult[] = [];
    for (const r of list) {
      if (out.length >= count) break;
      const sig = compositionSignature(r.composition);
      if (usedSignatures.has(sig)) continue;
      out.push(r);
      usedSignatures.add(sig);
      usedPrimary.add(primaryEnemyType(r.composition));
    }
    return out;
  };

  return {
    Balanced: pick('Balanced', caps.Balanced),
    Challenging: pick('Challenging', caps.Challenging),
  };
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale');
    return saved === 'en' || saved === 'pt-BR' ? saved : 'pt-BR';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  const [numPlayers, setNumPlayers] = useState(3);
  const [difficulty, setDifficulty] = useState('Medium');
  const [enemyPool, setEnemyPool] = useState<string[]>([...ENEMY_TYPES]);
  const [results, setResults] = useState<Record<DisplayCategory, EncounterResult[]>>({ Balanced: [], Challenging: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openByCategory, setOpenByCategory] = useState<Record<DisplayCategory, boolean>>({
    Balanced: false,
    Challenging: false,
  });
  const [closingByCategory, setClosingByCategory] = useState<Record<DisplayCategory, boolean>>({
    Balanced: false,
    Challenging: false,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = TRANSLATIONS[locale];

  const themeLabel = useMemo(() => (theme === 'dark' ? t.theme.dark : t.theme.light), [theme, t.theme.dark, t.theme.light]);
  const languageLabel = useMemo(() => t.language.short, [t.language.short]);

  const handleEnemyToggle = (type: string) => {
    setEnemyPool((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults({ Balanced: [], Challenging: [] });
    try {
      const res = await fetch('/encounter/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numPlayers,
          difficulty,
          enemyPool,
          maxResults: 30,
        }),
      });
      if (!res.ok) throw new Error(t.failedFetch);
      const data = await res.json();
      setResults(pickVariedEncountersGrouped(data));
    } catch (err: any) {
      setError(err.message || t.unknownError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="appHeader">
        <div className="headerActions">
          <button
            type="button"
            onClick={() => setLocale((prev) => (prev === 'pt-BR' ? 'en' : 'pt-BR'))}
            aria-label="Toggle language"
            title={t.language.title}
          >
            {languageLabel}
          </button>
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
            title={t.theme.title}
          >
            {themeLabel}
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="panel">
        <div className="row">
          <label className="field">
            {t.playersLabel}:
            <select value={numPlayers} onChange={(e) => setNumPlayers(Number(e.target.value))}>
              {PLAYER_COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t.difficultyLabel}:
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{t.difficulties[d as keyof typeof t.difficulties] ?? d}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="enemySection">
          <span className="enemyTitle">{t.enemyTypesLabel}:</span>
          <div className="enemyGrid">
            {ENEMY_TYPES.map(type => (
              <label key={type} className="checkChip">
                <input
                  type="checkbox"
                  checked={enemyPool.includes(type)}
                  onChange={() => handleEnemyToggle(type)}
                />
                {t.enemyTypes[type as keyof typeof t.enemyTypes] ?? type}
              </label>
            ))}
          </div>
        </div>
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? t.generating : t.generate}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {(['Balanced', 'Challenging'] as const).map((cat) => (
          <details
            key={cat}
            className="resultCard"
            open={openByCategory[cat] || closingByCategory[cat]}
            data-state={
              openByCategory[cat] ? 'open' : closingByCategory[cat] ? 'closing' : 'closed'
            }
          >
            <summary
              className="resultSummary"
              onClick={(e) => {
                e.preventDefault();
                const isOpen = openByCategory[cat];
                const isClosing = closingByCategory[cat];
                if (isClosing) return;

                if (isOpen) {
                  setOpenByCategory((prev) => ({ ...prev, [cat]: false }));
                  setClosingByCategory((prev) => ({ ...prev, [cat]: true }));
                  window.setTimeout(() => {
                    setClosingByCategory((prev) => ({ ...prev, [cat]: false }));
                  }, DROPDOWN_ANIMATION_MS);
                } else {
                  setOpenByCategory((prev) => ({ ...prev, [cat]: true }));
                }
              }}
            >
              <div className="resultHeader">
                <div className="resultLeft">
                  <div className="resultTitle">{t.categories[cat]}</div>
                  <div className="resultSubtitle">{t.hints[cat]}</div>
                </div>
              </div>
            </summary>

            <div className="resultBody">
              <div className="resultBodyInner">
                <div className="suggestions">
                  {results[cat].map((r, idx) => (
                    <div key={idx} className="suggestionRow" style={{ ['--i' as any]: idx }}>
                      <div className="badges">
                        {ENEMY_TYPES.map(type => r.composition[type] > 0 && (
                          <span key={type} className="badge">
                            {r.composition[type]} × {t.enemyTypes[type as keyof typeof t.enemyTypes] ?? type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {results[cat].length === 0 && (
                    <div className="emptyState">{t.emptySuggestions}</div>
                  )}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default App;
