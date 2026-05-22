import { useMemo } from 'react';
import type { Draw } from '../types';
import { globalFrequency, positionFrequency } from '../utils/analysis';

interface Props {
  draws: Draw[];
  mode: 'global' | number; // 'global' or position index 0-5
}

export function FrequencyChart({ draws, mode }: Props) {
  const counts = useMemo(() => {
    return mode === 'global'
      ? globalFrequency(draws)
      : positionFrequency(draws, mode);
  }, [draws, mode]);

  const total = mode === 'global' ? draws.length * 6 : draws.length;
  const expected = total / 10;
  const max = Math.max(...counts, 1);

  return (
    <div className="freq-chart">
      {counts.map((count, digit) => {
        const pct = (count / max) * 100;
        const isHot = count > expected * 1.25;
        const isCold = count < expected * 0.75;
        const cls = isHot ? 'hot' : isCold ? 'cold' : '';
        return (
          <div key={digit} className="freq-row">
            <div className="freq-digit">{digit}</div>
            <div className="freq-bar-wrap">
              <div
                className={`freq-bar ${cls}`}
                style={{ width: `${pct}%` }}
              />
              {digit === 0 && (
                <div className="freq-mark" style={{ left: `${(expected / max) * 100}%` }} />
              )}
            </div>
            <div className="freq-count">{count}×</div>
          </div>
        );
      })}
    </div>
  );
}
