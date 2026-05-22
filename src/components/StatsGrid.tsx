import type { SystemStats } from '../utils/analysis';

interface Props {
  stats: SystemStats;
}

export function StatsGrid({ stats }: Props) {
  const items = [
    { label: 'Suma media', value: stats.meanSum.toFixed(1), em: true, sub: `σ = ${stats.stdSum.toFixed(2)} · esperado μ=27` },
    { label: 'Pares por sorteo', value: stats.meanEvens.toFixed(2), em: false, sub: 'esperado ≈ 3.0' },
    { label: 'Media numérica', value: Math.round(stats.meanNumeric).toLocaleString(), em: false, sub: 'esperado ≈ 499,999' },
    { label: 'Autocorrelación', value: stats.autocorr1.toFixed(3), em: true, sub: 'lag-1 · 0 = aleatorio' },
    { label: 'Con dígito repetido', value: `${stats.repeatedDigitDraws}/${stats.totalDraws}`, em: false, sub: `${(stats.repeatedDigitDraws / Math.max(stats.totalDraws, 1) * 100).toFixed(0)}% del total` },
    { label: 'Rango de sumas', value: `${stats.sumMin}–${stats.sumMax}`, em: false, sub: 'mínima – máxima' },
  ];

  return (
    <div className="grid-3">
      {items.map(item => (
        <div key={item.label} className="stat-card">
          <div className="stat-label">{item.label}</div>
          <div className="stat-value">
            {item.em ? <em>{item.value}</em> : item.value}
          </div>
          <div className="stat-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}
