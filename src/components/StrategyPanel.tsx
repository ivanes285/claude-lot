import { useMemo, useState } from 'react';
import type { Draw, StrategyName } from '../types';
import { strategies, computeConsensus, STRAT_KEYS } from '../utils/strategies';

interface Props {
  draws: Draw[];
}

function generateVariations(base: number[], range: number): string[] {
  const baseNum = parseInt(base.join(''));
  const variations: Set<string> = new Set();
  
  // Add exact +range and -range
  for (let delta = -range; delta <= range; delta++) {
    if (delta === 0) continue;
    const v = baseNum + delta;
    if (v >= 0 && v <= 999999) {
      variations.add(String(v).padStart(6, '0'));
    }
  }

  // Also vary individual positions ±1 and ±2 for more spread
  for (let p = 0; p < 6; p++) {
    for (const offset of [-2, -1, 1, 2]) {
      const newDigit = base[p] + offset;
      if (newDigit >= 0 && newDigit <= 9) {
        const copy = [...base];
        copy[p] = newDigit;
        variations.add(copy.join(''));
      }
    }
  }

  // Remove the base number itself
  variations.delete(base.join(''));

  // Sort by distance from base and take top entries
  const sorted = [...variations].sort((a, b) => {
    const distA = Math.abs(parseInt(a) - baseNum);
    const distB = Math.abs(parseInt(b) - baseNum);
    return distA - distB;
  });

  return sorted;
}

export function StrategyPanel({ draws }: Props) {
  const [active, setActive] = useState<StrategyName>('hot');
  const [showComparison, setShowComparison] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [varRange, setVarRange] = useState(5);

  const strat = strategies[active];
  const result = useMemo(() => strat.compute(draws), [draws, active]);
  const sum = result.num.reduce((a, b) => a + b, 0);
  const pairs = result.num.filter(d => d % 2 === 0).length;

  const variations = useMemo(
    () => generateVariations(result.num, varRange),
    [result.num, varRange]
  );

  const allResults = useMemo(() => {
    return STRAT_KEYS.map(key => {
      const s = strategies[key];
      const r = s.compute(draws);
      const rSum = r.num.reduce((a, b) => a + b, 0);
      const rPairs = r.num.filter(d => d % 2 === 0).length;
      return { key, label: `${s.icon} ${s.label}`, num: r.num, sum: rSum, pairs: rPairs, explain: s.explain };
    });
  }, [draws]);

  const consensus = useMemo(() => computeConsensus(draws), [draws]);
  const avgAgreement = consensus.agreement.reduce((a, b) => a + b, 0) / 6;

  return (
    <>
      <div className="strategy-selector">
        {STRAT_KEYS.map(key => (
          <button
            key={key}
            className={`strat-btn ${active === key ? 'active' : ''}`}
            onClick={() => setActive(key)}
          >
            {strategies[key].icon} {strategies[key].label}
          </button>
        ))}
      </div>

      <div className="prediction-card">
        <div className="pred-label">{strat.icon} {strat.label}</div>
        <div className="pred-explanation">{strat.explain}</div>
        <div className="pred-number">{result.num.join('')}</div>

        <div className="pred-digits">
          {result.num.map((d, i) => (
            <div key={i} className="pred-digit">
              <strong>{d}</strong>
              P{i + 1} · {result.detail[i]}
            </div>
          ))}
        </div>

        <div className="pred-meta">
          <div className="pred-meta-item"><strong>{sum}</strong>SUMA</div>
          <div className="pred-meta-item"><strong>{pairs}/6</strong>PARES</div>
          <div className="pred-meta-item"><strong>{strat.logic}</strong>MÉTODO</div>
        </div>

        <div className="pred-actions">
          <button
            className={`pred-btn ${showVariations ? 'active-btn' : ''}`}
            onClick={() => setShowVariations(!showVariations)}
          >
            {showVariations ? '⊟ Ocultar variaciones' : '⊞ Ver variaciones'}
          </button>
          <button
            className="pred-btn secondary"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? '⊟ Ocultar' : '⊟ Comparar todas'}
          </button>
        </div>

        <p className="pred-note">Probabilidad real con cualquier combinación: <strong>1 entre 1,000,000</strong> (0.0001%).</p>
      </div>

      {showVariations && (
        <div className="variations-card">
          <div className="var-header">
            <div className="var-title">Variaciones de {result.num.join('')}</div>
            <div className="var-range-control">
              <span className="var-range-label">Rango: ±</span>
              {[3, 5, 7, 10].map(r => (
                <button
                  key={r}
                  className={`var-range-btn ${varRange === r ? 'active' : ''}`}
                  onClick={() => setVarRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="var-section">
            <div className="var-section-title">🎯 Numérico ±{varRange}</div>
            <div className="var-grid">
              {variations
                .filter(v => {
                  const dist = Math.abs(parseInt(v) - parseInt(result.num.join('')));
                  return dist <= varRange;
                })
                .map(v => (
                  <div key={v} className="var-num">
                    {v}
                    <span className="var-delta">
                      {parseInt(v) - parseInt(result.num.join('')) > 0 ? '+' : ''}
                      {parseInt(v) - parseInt(result.num.join(''))}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="var-section">
            <div className="var-section-title">🔀 Por posición (±1, ±2 en cada dígito)</div>
            <div className="var-grid">
              {variations
                .filter(v => {
                  const dist = Math.abs(parseInt(v) - parseInt(result.num.join('')));
                  return dist > varRange;
                })
                .slice(0, 24)
                .map(v => {
                  // Find which position changed
                  const baseStr = result.num.join('');
                  const diffs: string[] = [];
                  for (let i = 0; i < 6; i++) {
                    if (v[i] !== baseStr[i]) diffs.push(`P${i+1}`);
                  }
                  return (
                    <div key={v} className="var-num var-pos">
                      {v}
                      <span className="var-delta">{diffs.join(',')}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div className="var-note">
            {variations.length} variaciones generadas · base: {result.num.join('')}
          </div>
        </div>
      )}

      {showComparison && (
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Estrategia</th>
                <th>Predicción</th>
                <th>Suma</th>
                <th>Pares</th>
                <th>Lógica</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map(r => (
                <tr key={r.key}>
                  <td><strong>{r.label}</strong></td>
                  <td><span className="comp-pred">{r.num.join('')}</span></td>
                  <td>{r.sum}</td>
                  <td>{r.pairs}/6</td>
                  <td className="comp-logic">{r.explain.substring(0, 55)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="consensus">
            CONSENSO: <strong>{consensus.num.join('')}</strong> · concordancia {avgAgreement.toFixed(1)}/{STRAT_KEYS.length}
          </div>
        </div>
      )}
    </>
  );
}
