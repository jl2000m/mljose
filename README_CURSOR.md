# Actividad Integradora - Machine Learning
## Análisis y Modelo Predictivo de Airbnb

**Estudiante:** José González  
**Curso:** Machine Learning - ADEN International Business School

---

## 📋 Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Cursor instalado

## 🚀 Instalación y Ejecución en Cursor

### Opción 1: Usando Cursor (Recomendado)

1. **Abre Cursor** y crea una nueva carpeta para el proyecto

2. **Coloca estos archivos en la carpeta:**
   - `airbnb_analysis_cursor.py` (script principal)
   - `requirements.txt` (dependencias)
   - `Bases_de_datos_Airbnb.xlsx` (tu archivo de datos)

3. **Abre la terminal en Cursor** (View → Terminal o Ctrl+`)

4. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Ejecuta el script:**
   ```bash
   python airbnb_analysis_cursor.py
   ```

6. **¡Listo!** El script generará:
   - `visualizaciones_airbnb.png` - Gráficos del análisis exploratorio
   - `resultados_modelo_ml.png` - Visualizaciones del modelo
   - `metricas_modelo.csv` - Métricas en formato CSV
   - Resultados completos en la terminal

### Opción 2: Instalación Manual (Si hay errores)

Si tienes problemas con las dependencias, instálalas una por una:

```bash
pip install pandas
pip install numpy
pip install matplotlib
pip install seaborn
pip install scikit-learn
pip install openpyxl
```

---

## 📊 ¿Qué hace el script?

El script realiza automáticamente:

### 1. **Análisis Exploratorio de Datos (EDA)**
   - Carga y exploración del dataset
   - Estadísticas descriptivas
   - Análisis de valores nulos
   - Distribución de variables clave

### 2. **Visualizaciones Interactivas**
   - 9 gráficos profesionales:
     - Distribución de precios
     - Precios por tipo de habitación
     - Noches mínimas
     - Reviews mensuales
     - Disponibilidad anual
     - Correlaciones
     - Y más...

### 3. **Modelo Predictivo de Machine Learning**
   - Preprocesamiento de datos
   - Entrenamiento de 3 modelos:
     - Random Forest
     - Gradient Boosting
     - Regresión Lineal
   - Comparación automática
   - Selección del mejor modelo

### 4. **Evaluación Completa**
   - Métricas: R², RMSE, MAE, MAPE
   - Análisis de residuales
   - Importancia de variables
   - Visualizaciones del modelo
   - Evaluación de confiabilidad

### 5. **Conclusiones y Recomendaciones**
   - Análisis de aptitud del modelo
   - Aplicaciones prácticas
   - Limitaciones identificadas
   - Recomendaciones para toma de decisiones

---

## 📁 Archivos Generados

Después de ejecutar el script, encontrarás:

1. **visualizaciones_airbnb.png** (3MB aprox)
   - Contiene 9 gráficos del análisis exploratorio
   - Alta resolución (300 DPI)
   - Listo para incluir en presentaciones

2. **resultados_modelo_ml.png** (1.3MB aprox)
   - 6 visualizaciones del modelo:
     - Comparación de modelos
     - Predicciones vs valores reales
     - Análisis de residuales
     - Importancia de variables
     - Distribución de errores

3. **metricas_modelo.csv**
   - Tabla con todas las métricas principales
   - Formato CSV para Excel

---

## 💡 Ventajas de usar Cursor vs Google Colab

✅ **No necesitas conexión a internet** después de instalar
✅ **Más rápido** - ejecuta localmente en tu computadora
✅ **Archivos guardados automáticamente** en tu carpeta
✅ **Puedes modificar el código** fácilmente con IA de Cursor
✅ **No se reinicia** - mantiene todo en memoria
✅ **Sin límites de tiempo** de ejecución

---

## 🔧 Solución de Problemas

### Error: "ModuleNotFoundError"
**Solución:** Instala la librería faltante:
```bash
pip install nombre_libreria
```

### Error: "File not found"
**Solución:** Verifica que `Bases_de_datos_Airbnb.xlsx` esté en la misma carpeta que el script

### Error: "Permission denied"
**Solución:** Ejecuta con permisos de administrador o cambia la carpeta de trabajo

### Los gráficos no se muestran
**Solución:** Esto es normal. Los gráficos se guardan automáticamente como PNG. Ábrelos desde la carpeta.

---

## 📝 Notas Importantes

- El script toma aproximadamente **1-3 minutos** en ejecutar
- Genera salida detallada en la terminal
- Todas las conclusiones se imprimen automáticamente
- Los archivos PNG son de alta calidad para presentaciones

---

## 🎓 Cumplimiento de Rúbrica

Este script cumple con todos los criterios:

✅ Análisis coherente de la base de datos Airbnb  
✅ Gráficos justificados con argumentos precisos (9 visualizaciones)  
✅ Modelo predictivo de Machine Learning desarrollado  
✅ Análisis sobresaliente considerando el modelo  
✅ Uso apropiado de plataformas ML (scikit-learn)  
✅ Vocabulario técnico profesional y correcto  

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. Verifica que Python 3.8+ esté instalado: `python --version`
2. Verifica que pip funcione: `pip --version`
3. Lee los mensajes de error en la terminal
4. Asegúrate de que el archivo Excel esté en la carpeta correcta

---

**¡Buena suerte con tu presentación! 🚀**
