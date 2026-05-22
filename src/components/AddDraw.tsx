import { useRef, useState } from 'react';
import type { Draw } from '../types';
import { exportJSON, parseImport } from '../utils/storage';

interface Props {
  draws: Draw[];
  userAdded: Draw[];
  onAdd: (raw: string) => { ok: boolean; msg: string };
  onImport: (draws: Draw[]) => void;
  onReset: () => void;
}

export function AddDraw({ draws, userAdded, onAdd, onImport, onReset }: Props) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: '' | 'ok' | 'err' }>({ msg: '', type: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function showFeedback(msg: string, type: 'ok' | 'err') {
    setFeedback({ msg, type });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFeedback({ msg: '', type: '' }), 4000);
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
    exportJSON({ draws, userAdded });
    showFeedback(`✓ Exportados ${draws.length} sorteos`, 'ok');
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const imported = parseImport(text);
      if (imported) {
        onImport(imported);
        showFeedback(`✓ Importados ${imported.length} sorteos`, 'ok');
      } else {
        showFeedback('✗ Formato inválido', 'err');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (confirm('¿Restaurar el histórico base? Se perderán los sorteos que hayas agregado.')) {
      onReset();
      showFeedback('✓ Histórico restaurado', 'ok');
    }
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
        <button className="btn btn-secondary" onClick={handleExport}>↓ Exportar JSON</button>
        <button className="btn btn-secondary" onClick={handleImportClick}>↑ Importar JSON</button>
        <button className="btn btn-danger" onClick={handleReset}>↺ Restaurar</button>
        <input ref={fileRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
      <div className="storage-info">
        <span className="dot" />
        <span>{draws.length} sorteos · {userAdded.length} añadidos por ti</span>
      </div>
    </div>
  );
}
