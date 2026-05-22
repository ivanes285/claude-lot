import { useEffect, useRef } from 'react';

interface ReturnMapProps {
  data: number[];
  max: number;
  label: string;
}

export function ReturnMap({ data, max, label }: ReturnMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width, H = c.height;
    const pad = 40;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = pad + (W - 2 * pad) * i / 10;
      const y = pad + (H - 2 * pad) * i / 10;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Diagonal y=x
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, pad); ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    ctx.fillStyle = '#8b94a8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('n', pad - 8, pad - 12);
    ctx.fillText('n+1', W - pad - 18, H - pad + 24);

    if (data.length < 2) return;

    // Trajectory line
    ctx.strokeStyle = 'rgba(79,209,199,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < data.length - 1; i++) {
      const x = pad + (W - 2 * pad) * (data[i] / max);
      const y = H - pad - (H - 2 * pad) * (data[i + 1] / max);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Points
    for (let i = 0; i < data.length - 1; i++) {
      const x = pad + (W - 2 * pad) * (data[i] / max);
      const y = H - pad - (H - 2 * pad) * (data[i + 1] / max);
      const age = i / Math.max(data.length - 1, 1);
      const r = 4 + age * 3;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      grad.addColorStop(0, `rgba(255, ${179 - age * 70}, ${71 + age * 86}, 0.9)`);
      grad.addColorStop(1, 'rgba(255,179,71,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(255, ${179 - age * 70}, ${71 + age * 86}, 1)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }, [data, max]);

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} />
      <div className="chart-label">{label}</div>
    </div>
  );
}

interface TimeSeriesProps {
  sums: number[];
}

export function TimeSeries({ sums }: TimeSeriesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width, H = c.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 40 };
    const maxV = 54, minV = 0;
    const mean = sums.length ? sums.reduce((a, b) => a + b, 0) / sums.length : 0;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (H - pad.top - pad.bottom) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#8b94a8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(String(Math.round(maxV - (maxV - minV) * i / 5)), 8, y + 4);
    }

    if (sums.length < 1) return;

    // Mean line
    const meanY = pad.top + (H - pad.top - pad.bottom) * (1 - (mean - minV) / (maxV - minV));
    ctx.strokeStyle = 'rgba(255,107,157,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(pad.left, meanY); ctx.lineTo(W - pad.right, meanY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff6b9d';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`μ=${mean.toFixed(1)}`, W - pad.right - 50, meanY - 6);

    if (sums.length >= 2) {
      const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
      grad.addColorStop(0, 'rgba(255,179,71,0.25)');
      grad.addColorStop(1, 'rgba(255,179,71,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(pad.left, H - pad.bottom);
      sums.forEach((s, i) => {
        const x = pad.left + (W - pad.left - pad.right) * i / (sums.length - 1);
        const y = pad.top + (H - pad.top - pad.bottom) * (1 - (s - minV) / (maxV - minV));
        ctx.lineTo(x, y);
      });
      ctx.lineTo(W - pad.right, H - pad.bottom);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sums.forEach((s, i) => {
        const x = pad.left + (W - pad.left - pad.right) * i / (sums.length - 1);
        const y = pad.top + (H - pad.top - pad.bottom) * (1 - (s - minV) / (maxV - minV));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    sums.forEach((s, i) => {
      const x = sums.length === 1 ? W / 2 : pad.left + (W - pad.left - pad.right) * i / (sums.length - 1);
      const y = pad.top + (H - pad.top - pad.bottom) * (1 - (s - minV) / (maxV - minV));
      ctx.fillStyle = i === sums.length - 1 ? '#ff6b9d' : '#ffb347';
      ctx.beginPath(); ctx.arc(x, y, i === sums.length - 1 ? 5 : 3, 0, Math.PI * 2); ctx.fill();
    });
  }, [sums]);

  return (
    <div>
      <canvas ref={canvasRef} width={1100} height={320} />
      <div className="chart-label">Sorteos en orden cronológico (más antiguo → más reciente)</div>
    </div>
  );
}
