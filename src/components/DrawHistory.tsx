import type { Draw } from '../types';

interface Props {
  draws: Draw[];
  userAdded: Draw[];
  disabled: Draw[];
  onRemove: (index: number) => void;
  onToggle: (index: number) => void;
}

export function DrawHistory({ draws, userAdded, disabled, onRemove, onToggle }: Props) {
  function handleRemove(e: React.MouseEvent, index: number, draw: string) {
    e.stopPropagation();
    if (confirm(`¿Eliminar sorteo ${draw} permanentemente?`)) {
      onRemove(index);
    }
  }

  const disabledCount = disabled.length;
  const activeCount = draws.length - disabledCount;

  return (
    <>
      {disabledCount > 0 && (
        <div className="toggle-info">
          <strong>{activeCount}</strong> activos · <strong>{disabledCount}</strong> desactivados
        </div>
      )}
      <div className="raw-data">
        {draws.map((d, i) => {
          const isLatest = i === 0;
          const isUser = userAdded.includes(d);
          const isOff = disabled.includes(d);
          const cls = [
            'raw-num',
            isOff ? 'disabled' : '',
            isLatest && !isOff ? 'latest' : '',
            isUser && !isLatest && !isOff ? 'user-added' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`${d}-${i}`}
              className={cls}
              onClick={() => onToggle(i)}
              title={isOff ? 'Click para activar' : 'Click para desactivar'}
            >
              {isOff && <span className="toggle-icon off">○</span>}
              {!isOff && <span className="toggle-icon on">●</span>}
              {d}
              <span
                className="del"
                onClick={(e) => handleRemove(e, i, d)}
                title="Eliminar permanentemente"
              >
                ×
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
