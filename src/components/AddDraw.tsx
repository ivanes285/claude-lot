import { useState } from 'react';
import type { Draw } from '../types';
import { exportJSON } from '../utils/storage';

interface Props {
  draws: Draw[];
  userAdded: Draw[];
  disabled: Draw[];
  onAdd: (raw: string) => { ok: boolean; msg: string };
}

export function AddDraw({ draws, userAdded, disabled, onAdd }: Props) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: '' | 'ok' | 'err' }>({ msg: '', type: '' });

  function showFeedback(msg: string, type: 'ok' | 'err') {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
  }

  function handleAdd() {
    const result = onAdd(input);
    if (result.ok) {
      setInput('');
      showFeedback(result.msg, 'ok');
    } else {
      showFeedback(result.msg, 'err');
    }
  }

  function handleExport() {
    exportJSON({ draws, userAdded, disabled });
    showFeedback(`✓ Exportados ${draws.length} sorteos`, 'ok');
  }

  return (
    <div className="add-draw-card">
      <div className="form-title">➕ Agregar nuevo sorteo</div>
      <div className="form-row">
        <input
          type="text"
          className="draw-input"
          value={input}
          onChange={e => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
        />
        <button className="btn" onClick={handleAdd}>Guardar sorteo</button>
      </div>
      {feedback.msg && (
        <div className={`form-feedback ${feedback.type}`}>{feedback.msg}</div>
      )}
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleExport}>↓ Exportar JSON (backup)</button>
      </div>
      <div className="storage-info">
        <span className="dot" />
        <span>
          {draws.length - disabled.length} activos de {draws.length} sorteos
          {disabled.length > 0 && ` · ${disabled.length} desactivados`}
          {' · '}🔥 Firebase sincronizado
        </span>
      </div>
    </div>
  );
}
