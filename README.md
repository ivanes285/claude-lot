# 🎯 Análisis Caótico · Lotto Ecuador

Análisis estadístico y visual de sorteos de Lotto Ecuador (6 dígitos, 0–9) con teoría del caos, cadenas de Markov y múltiples estrategias de predicción.

## ✨ Features

- 📊 **Frecuencia global y por posición** de cada dígito
- 🌀 **Mapas de retorno** (pseudo-atractores de teoría del caos)
- 📈 **Serie temporal** de suma de dígitos
- 🎯 **6 estrategias de predicción:**
  - 🔥 HOT — dígito más frecuente
  - ❄️ COLD — dígito menos frecuente
  - ⛓ MARKOV — cadena de transición
  - 📊 MEDIA — regresión al promedio
  - ⏱ GAP — dígitos atrasados
  - 🧬 HÍBRIDO — consenso ponderado
- ➕ **Agregar nuevos sorteos** con persistencia en localStorage
- 📥 **Exportar/Importar** historial en JSON
- 🗑️ **Eliminar** sorteos individuales

## 🚀 Setup

```bash
npm install
npm run dev
```

## 📦 Deploy a GitHub Pages

```bash
# 1. Asegúrate que el nombre del repo coincida con `base` en vite.config.ts
# 2. Deploy:
npm run deploy
```

Esto ejecuta `build` y sube la carpeta `dist` al branch `gh-pages`.

Luego en tu repo: **Settings → Pages → Source: "gh-pages" branch → Save**.

Tu app estará en: `https://TU_USUARIO.github.io/lotto-ecuador/`

## 🛠 Stack

- React 18 + TypeScript
- Vite
- Canvas API (gráficos)
- localStorage (persistencia)

## ⚠️ Disclaimer

Este proyecto es un **ejercicio educativo** sobre estadística y teoría del caos. Las predicciones NO tienen valor real — cada combinación tiene exactamente **1 entre 1,000,000** de probabilidad de ganar, sin importar la estrategia utilizada.

---

Hecho con 🧠 y Claude · Quito, Ecuador
