import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary to prevent blank screen
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  handleReset = () => {
    // Clear corrupted data
    try { localStorage.removeItem('lottoEcuador_draws_v2'); } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '40px', maxWidth: '600px', margin: '0 auto',
          fontFamily: '"JetBrains Mono", monospace', color: '#e8ecf5',
          background: '#0a0e1a', minHeight: '100vh',
        }}>
          <h1 style={{ color: '#ff6b9d', fontSize: '24px', marginBottom: '16px' }}>
            ⚠ Error en la aplicación
          </h1>
          <p style={{ color: '#8b94a8', marginBottom: '20px', fontSize: '14px' }}>
            Probablemente datos corruptos en el almacenamiento. 
            Click en el botón para limpiar y recargar con los datos base.
          </p>
          <pre style={{
            background: '#161f33', padding: '16px', borderRadius: '4px',
            fontSize: '11px', color: '#ff6b9d', overflowX: 'auto', marginBottom: '20px',
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px', background: '#4fd1c7', color: '#0a0e1a',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
              fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase',
            }}
          >
            Limpiar datos y recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
