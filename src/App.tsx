import { useMemo, useState } from 'react';
import { useDraws } from './hooks/useDraws';
import { computeStats, digitSum } from './utils/analysis';
import { AddDraw } from './components/AddDraw';
import { TopPicks } from './components/TopPicks';
import { FrequencyChart } from './components/FrequencyChart';
import { ReturnMap, TimeSeries } from './components/Charts';
import { StatsGrid } from './components/StatsGrid';
import { StrategyPanel } from './components/StrategyPanel';
import { DrawHistory } from './components/DrawHistory';

export default function App() {
  const {
    draws, activeDraws, userAdded, disabled,
    addDraw, toggleDraw,
  } = useDraws();
  const [posTab, setPosTab] = useState(0);

  const stats = useMemo(() => computeStats(activeDraws), [activeDraws]);

  const chronological = useMemo(() => [...activeDraws].reverse(), [activeDraws]);
  const numsChron = useMemo(() => chronological.map(d => parseInt(d)), [chronological]);
  const sumsChron = useMemo(() => chronological.map(d => digitSum(d)), [chronological]);

  return (
    <div className="container">
      <header>
        <div className="eyebrow">Análisis Experimental · Teoría del Caos</div>
        <h1>Patrones <em>ocultos</em><br />en el azar</h1>
        <p className="subtitle">
          Análisis estadístico y visual de sorteos consecutivos de Lotto Ecuador
          (6 dígitos, 0–9). Seis estrategias de predicción matemática y
          reconstrucción de pseudo-atractores.
        </p>
        <div className="meta-strip">
          <span><strong>{stats.totalDraws}</strong> sorteos activos</span>
          <span><strong>{stats.totalDigits}</strong> dígitos</span>
          <span><strong>6</strong> series temporales</span>
          {disabled.length > 0 && (
            <span><strong>{disabled.length}</strong> desactivados</span>
          )}
          <span><strong>Quito</strong> · Ecuador</span>
        </div>
      </header>

      <div className="warning">
        <strong>⚠ Advertencia honesta</strong>
        Con muestras pequeñas NO existe poder estadístico real para predecir
        sorteos genuinamente aleatorios. Este análisis tiene valor{' '}
        <em>educativo y visual</em>, no predictivo.
      </div>

      <AddDraw
        draws={draws}
        userAdded={userAdded}
        disabled={disabled}
        onAdd={addDraw}
      />

      <TopPicks draws={activeDraws} />

      {/* 01. Frecuencia Global */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">01 ·</span>
          <h2 className="section-title">Frecuencia global de dígitos</h2>
        </div>
        <p className="section-desc">
          ¿Aparece cada dígito (0–9) con la misma frecuencia? Las desviaciones
          revelan posibles sesgos.
        </p>
        <div className="card">
          <FrequencyChart draws={activeDraws} mode="global" />
        </div>
      </section>

      {/* 02. Frecuencia por Posición */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">02 ·</span>
          <h2 className="section-title">Frecuencia por posición</h2>
        </div>
        <p className="section-desc">
          Cada una de las 6 posiciones es una serie temporal independiente.
        </p>
        <div className="card">
          <div className="tabs">
            {[0, 1, 2, 3, 4, 5].map(p => (
              <button
                key={p}
                className={`tab ${posTab === p ? 'active' : ''}`}
                onClick={() => setPosTab(p)}
              >
                POS {p + 1}
              </button>
            ))}
          </div>
          <FrequencyChart draws={activeDraws} mode={posTab} />
        </div>
      </section>

      {/* 03. Mapa de Retorno */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">03 ·</span>
          <h2 className="section-title">Mapa de retorno · Pseudo-atractor</h2>
        </div>
        <p className="section-desc">
          Técnica clásica de teoría del caos. Si hubiera patrón determinista,
          los puntos formarían estructura geométrica.
        </p>
        <div className="grid-2">
          <div className="card">
            <ReturnMap data={numsChron} max={1000000} label="Número completo · 6 dígitos" />
          </div>
          <div className="card">
            <ReturnMap data={sumsChron} max={54} label="Suma de dígitos · n vs n+1" />
          </div>
        </div>
      </section>

      {/* 04. Estadísticas */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">04 ·</span>
          <h2 className="section-title">Métricas del sistema</h2>
        </div>
        <StatsGrid stats={stats} />
      </section>

      {/* 05. Serie Temporal */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">05 ·</span>
          <h2 className="section-title">Serie temporal</h2>
        </div>
        <p className="section-desc">
          Evolución de la suma total de dígitos a lo largo de los sorteos.
        </p>
        <div className="card">
          <TimeSeries sums={sumsChron} />
        </div>
      </section>

      {/* 06. Generador */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">06 ·</span>
          <h2 className="section-title">Generador multi-estrategia</h2>
        </div>
        <p className="section-desc">
          Seis métodos matemáticos diferentes para "predecir" el próximo número.
          Si varios coinciden en un dígito, es una señal interesante.
        </p>
        <StrategyPanel draws={activeDraws} />
      </section>

      {/* 07. Historial */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">07 ·</span>
          <h2 className="section-title">Historial completo</h2>
        </div>
        <p className="section-desc">
          Click en un sorteo para desactivarlo/activarlo (se excluye del análisis sin eliminarse).
          Naranja = último. Verde = añadido por ti. Gris tachado = desactivado.
        </p>
        <div className="card">
          <DrawHistory
            draws={draws}
            userAdded={userAdded}
            disabled={disabled}
            onToggle={toggleDraw}
          />
        </div>
      </section>

      <footer>
        Análisis Caótico · Lotto Ecuador · Datos persistentes localmente
      </footer>
    </div>
  );
}
