# Airbnb ML - Aplicación Web Full-Stack

Aplicación web para el proyecto de Machine Learning sobre Airbnb: análisis exploratorio, modelo predictivo y predictor interactivo de precios. Desplegable en Vercel.

**Estudiante:** Jose Luis Martinez Villegas (Pasaporte 164992615)  
**Institución:** ADEN Business School

## Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Recharts, Framer Motion, Lucide React, Zustand
- **API:** Next.js API Routes (TypeScript); opcional: Python serverless en Vercel para predicción con modelo scikit-learn
- **Deploy:** Vercel

## Requisitos

- Node.js 18+
- (Opcional) Python 3.10+ para exportar el modelo y usar la API Python de predicción

## Instalación local

1. Clona o descarga el proyecto y coloca `Bases_de_datos_Airbnb.xlsx` en la raíz o en `public/`.

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Genera el JSON de datos desde el Excel (necesario para análisis y predictor):

   ```bash
   npm run export-data
   ```

4. (Opcional) Genera artefactos del modelo para métricas y gráficos del modelo, y para la API Python de predicción:

   ```bash
   python scripts/export_model.py
   ```

   Esto crea la carpeta `model_artifacts/` con `model.joblib`, `scaler.joblib`, `label_encoder.json` y `metrics.json`.

5. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Build y deploy en Vercel

1. Conecta el repositorio a Vercel o usa la CLI:

   ```bash
   npm run build
   vercel
   ```

2. El script `build` ejecuta `export-data` antes de `next build`, así que el JSON se genera en cada deploy.

3. **Predicción:** Por defecto se usa la ruta TypeScript `/api/predict`, que estima el precio con promedios por tipo de habitación. Para usar el modelo scikit-learn en producción:
   - Ejecuta `python scripts/export_model.py` y sube la carpeta `model_artifacts/` al repositorio.
   - En Vercel, la función Python `api/predict.py` se usará si existe; en ese caso puedes eliminar o no usar `app/api/predict/route.ts` si quieres solo la predicción Python.

## Estructura principal

```
/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── analisis/     (análisis exploratorio con tabs)
│   ├── modelo/       (preprocesamiento, comparación de modelos, gráficos)
│   ├── predictor/    (formulario y resultado de predicción)
│   └── api/
│       ├── data/     (GET: datos para análisis)
│       ├── model-metrics/ (GET: métricas del modelo)
│       └── predict/   (POST: predicción de precio)
├── components/       (Navbar, Charts, ModelMetrics, PredictorForm, ui/)
├── lib/              (dataLoader, constants, store, utils, airbnb-data.json)
├── scripts/
│   ├── export-data.ts   (Excel → lib/airbnb-data.json)
│   └── export_model.py  (entrena y guarda model_artifacts/)
├── model_artifacts/   (generado por export_model.py)
├── public/            (Bases_de_datos_Airbnb.xlsx opcional)
├── vercel.json
└── package.json
```

## Scripts

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Exporta datos y construye para producción
- `npm run start` — Servidor de producción
- `npm run export-data` — Genera `lib/airbnb-data.json` desde el Excel
- `npm run lint` — ESLint

## Variables de entorno

No son obligatorias para el funcionamiento básico. Si añades APIs externas o claves, créalas en el proyecto de Vercel o en `.env.local` (no commitear).

## Licencia

Uso académico - Actividad Integradora Machine Learning, ADEN Business School.
