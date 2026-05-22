import type { Draw } from '../types';

interface Props {
  draws: Draw[];
  userAdded: Draw[];
  onRemove: (index: number) => void;
}

export function DrawHistory({ draws, userAdded, onRemove }: Props) {
  function handleRemove(index: number, draw: string) {
    if (confirm(`¿Eliminar sorteo ${draw}?`)) {
      onRemove(index);
    }
  }

  return (
    <div className="raw-data">
      {draws.map((d, i) => {
        const isLatest = i === 0;
        const isUser = userAdded.includes(d);
        const cls = isLatest ? 'latest' : isUser ? 'user-added' : '';
        return (
          <div key={`${d}-${i}`} className={`raw-num ${cls}`}>
            {d}
            <span className="del" onClick={() => handleRemove(i, d)} title="Eliminar">×</span>
          </div>
        );
      })}
    </div>
  );
}
