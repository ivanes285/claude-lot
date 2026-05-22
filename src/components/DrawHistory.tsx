import type { Draw } from '../types';

interface Props {
  draws: Draw[];
  userAdded: Draw[];
  disabled: Draw[];
  onToggle: (index: number) => void;
}

export function DrawHistory({ draws, userAdded, disabled, onToggle }: Props) {
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
            </div>
          );
        })}
      </div>
    </>
  );
}
