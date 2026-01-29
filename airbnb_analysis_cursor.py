"""
ACTIVIDAD INTEGRADORA - MACHINE LEARNING
Análisis y Modelo Predictivo de Base de Datos Airbnb

Estudiante: José González
Curso: Machine Learning - Unidades 2 y 3
Institución: ADEN International Business School
Fecha: Enero 2026

INSTRUCCIONES PARA CURSOR:
1. Asegúrate de tener Python 3.8+ instalado
2. Instala las dependencias: pip install -r requirements.txt
3. Coloca el archivo 'Bases_de_datos_Airbnb.xlsx' en la misma carpeta
4. Ejecuta este script: python airbnb_analysis_cursor.py
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

# Configuración de estilo
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

print("="*100)
print("ACTIVIDAD INTEGRADORA - MACHINE LEARNING")
print("Análisis de Base de Datos Airbnb y Modelo Predictivo")
print("="*100)

# ============================================================================
# 1. CARGA Y EXPLORACIÓN DE DATOS
# ============================================================================
print("\n" + "="*100)
print("1. CARGA Y EXPLORACIÓN DE DATOS")
print("="*100)

# Cargar datos
try:
    df = pd.read_excel('Bases_de_datos_Airbnb.xlsx')
    print("\n✅ Archivo cargado exitosamente")
except FileNotFoundError:
    print("\n❌ ERROR: No se encontró el archivo 'Bases_de_datos_Airbnb.xlsx'")
    print("   Por favor, coloca el archivo en la misma carpeta que este script.")
    exit()

print(f"\n📊 Dimensiones del dataset: {df.shape[0]:,} filas × {df.shape[1]} columnas")
print(f"\n📋 Columnas del dataset:")
for i, col in enumerate(df.columns, 1):
    print(f"   {i}. {col}")

# Información de valores nulos
print(f"\n🔍 Valores nulos detectados:")
nulls = df.isnull().sum()
nulls_pct = (nulls / len(df)) * 100
null_df = pd.DataFrame({'Cantidad': nulls, 'Porcentaje (%)': nulls_pct})
print(null_df[null_df['Cantidad'] > 0])

# Estadísticas descriptivas
print(f"\n📈 Estadísticas descriptivas de variables clave:")
print(df[['price', 'minimum_nights', 'number_of_reviews', 'reviews_per_month', 
         'availability_365']].describe())

# Distribución de tipos de habitación
print(f"\n🏠 Distribución de tipos de habitación:")
room_counts = df['room_type'].value_counts()
for room, count in room_counts.items():
    pct = (count / len(df)) * 100
    avg_price = df[df['room_type'] == room]['price'].mean()
    print(f"   {room}: {count:,} ({pct:.1f}%) - Precio promedio: ${avg_price:.2f}")

# ============================================================================
# 2. VISUALIZACIONES
# ============================================================================
print(f"\n{'='*100}")
print("2. GENERANDO VISUALIZACIONES")
print("="*100)

fig = plt.figure(figsize=(20, 16))

# 1. Distribución de precios
ax1 = plt.subplot(3, 3, 1)
df['price'].hist(bins=50, edgecolor='black', alpha=0.7, ax=ax1)
ax1.axvline(df['price'].median(), color='red', linestyle='--', 
            label=f'Mediana: ${df["price"].median():.0f}')
ax1.set_xlabel('Precio (USD)', fontsize=11)
ax1.set_ylabel('Frecuencia', fontsize=11)
ax1.set_title('Distribución de Precios', fontsize=13, fontweight='bold')
ax1.legend()
ax1.grid(alpha=0.3)

# 2. Precios por tipo de habitación
ax2 = plt.subplot(3, 3, 2)
df.boxplot(column='price', by='room_type', ax=ax2)
ax2.set_xlabel('Tipo de Habitación', fontsize=11)
ax2.set_ylabel('Precio (USD)', fontsize=11)
ax2.set_title('Precios por Tipo de Habitación', fontsize=13, fontweight='bold')
plt.suptitle('')

# 3. Distribución de minimum_nights
ax3 = plt.subplot(3, 3, 3)
df[df['minimum_nights'] <= 30]['minimum_nights'].hist(
    bins=30, edgecolor='black', alpha=0.7, color='coral', ax=ax3)
ax3.axvline(df['minimum_nights'].median(), color='darkred', linestyle='--',
            label=f'Mediana: {df["minimum_nights"].median():.0f}')
ax3.set_xlabel('Mínimo de Noches', fontsize=11)
ax3.set_ylabel('Frecuencia', fontsize=11)
ax3.set_title('Distribución de Noches Mínimas (≤30)', fontsize=13, fontweight='bold')
ax3.legend()
ax3.grid(alpha=0.3)

# 4. Reviews por mes
ax4 = plt.subplot(3, 3, 4)
df['reviews_per_month'].dropna().hist(bins=40, edgecolor='black', alpha=0.7, 
                                       color='lightgreen', ax=ax4)
ax4.axvline(df['reviews_per_month'].median(), color='darkgreen', linestyle='--',
            label=f'Mediana: {df["reviews_per_month"].median():.2f}')
ax4.set_xlabel('Reviews por Mes', fontsize=11)
ax4.set_ylabel('Frecuencia', fontsize=11)
ax4.set_title('Distribución de Reviews Mensuales', fontsize=13, fontweight='bold')
ax4.legend()
ax4.grid(alpha=0.3)

# 5. Disponibilidad anual
ax5 = plt.subplot(3, 3, 5)
df['availability_365'].hist(bins=50, edgecolor='black', alpha=0.7, 
                             color='mediumpurple', ax=ax5)
ax5.axvline(df['availability_365'].median(), color='purple', linestyle='--',
            label=f'Mediana: {df["availability_365"].median():.0f}')
ax5.set_xlabel('Días Disponibles al Año', fontsize=11)
ax5.set_ylabel('Frecuencia', fontsize=11)
ax5.set_title('Disponibilidad Anual', fontsize=13, fontweight='bold')
ax5.legend()
ax5.grid(alpha=0.3)

# 6. Precio vs Reviews por mes
ax6 = plt.subplot(3, 3, 6)
mask = (df['price'] <= 500) & (df['reviews_per_month'].notna())
ax6.scatter(df[mask]['reviews_per_month'], df[mask]['price'], alpha=0.5, s=20)
ax6.set_xlabel('Reviews por Mes', fontsize=11)
ax6.set_ylabel('Precio (USD)', fontsize=11)
ax6.set_title('Relación: Precio vs Reviews Mensuales', fontsize=13, fontweight='bold')
ax6.grid(alpha=0.3)

# 7. Tipo de habitación (pie chart)
ax7 = plt.subplot(3, 3, 7)
colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99']
ax7.pie(room_counts.values, labels=room_counts.index, autopct='%1.1f%%',
        colors=colors[:len(room_counts)], startangle=90)
ax7.set_title('Distribución de Tipos de Habitación', fontsize=13, fontweight='bold')

# 8. Matriz de correlación
ax8 = plt.subplot(3, 3, 8)
corr_cols = ['price', 'minimum_nights', 'number_of_reviews', 
             'reviews_per_month', 'availability_365', 'calculated_host_listings_count']
corr_matrix = df[corr_cols].corr()
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', center=0,
            square=True, linewidths=1, ax=ax8, cbar_kws={"shrink": 0.8})
ax8.set_title('Matriz de Correlación', fontsize=13, fontweight='bold')

# 9. Precio promedio por rango de noches
ax9 = plt.subplot(3, 3, 9)
df_temp = df.copy()
df_temp['nights_range'] = pd.cut(df_temp['minimum_nights'], 
                                   bins=[0, 1, 3, 7, 30, 1000],
                                   labels=['1 noche', '2-3 noches', '4-7 noches',
                                          '1-4 semanas', '>1 mes'])
nights_price = df_temp.groupby('nights_range')['price'].mean()
nights_price.plot(kind='bar', ax=ax9, color='darkorange', edgecolor='black')
ax9.set_xlabel('Rango de Noches Mínimas', fontsize=11)
ax9.set_ylabel('Precio Promedio (USD)', fontsize=11)
ax9.set_title('Precio por Rango de Noches', fontsize=13, fontweight='bold')
ax9.tick_params(axis='x', rotation=45)
ax9.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('visualizaciones_airbnb.png', dpi=300, bbox_inches='tight')
print("\n✅ Visualizaciones guardadas: visualizaciones_airbnb.png")
plt.show()

# ============================================================================
# 3. CONCLUSIONES DEL ANÁLISIS EXPLORATORIO
# ============================================================================
print(f"\n{'='*100}")
print("3. CONCLUSIONES DEL ANÁLISIS EXPLORATORIO")
print("="*100)

print(f"""
📊 HALLAZGOS PRINCIPALES:

1. PRECIOS:
   • Promedio: ${df['price'].mean():.2f} | Mediana: ${df['price'].median():.2f}
   • Asimetría positiva: propiedades de lujo elevan el promedio
   
2. TIPOS DE HABITACIÓN:
   • {room_counts.index[0]} domina con {(room_counts.iloc[0]/len(df)*100):.1f}%
   
3. REVIEWS:
   • {(df['number_of_reviews'] > 0).sum()/len(df)*100:.1f}% tienen historial
   
4. CORRELACIONES:
   • price vs reviews_per_month: {df['price'].corr(df['reviews_per_month']):.3f} (débil)
   • Precio depende más de características físicas que de popularidad
""")

# ============================================================================
# 4. PREPARACIÓN DE DATOS PARA ML
# ============================================================================
print(f"\n{'='*100}")
print("4. PREPARACIÓN DE DATOS PARA MACHINE LEARNING")
print("="*100)

df_ml = df.copy()

# Eliminar columnas sin valor predictivo
columns_to_drop = ['name', 'latitude', 'longitude', 'id', 'host_id', 'last_review']
df_ml.drop(columns_to_drop, axis=1, inplace=True, errors='ignore')

# Imputar valores nulos
df_ml['reviews_per_month'].fillna(0, inplace=True)

# Codificar room_type
le = LabelEncoder()
df_ml['room_type_encoded'] = le.fit_transform(df_ml['room_type'])
df_ml.drop('room_type', axis=1, inplace=True)

# Eliminar outliers extremos
price_99 = df_ml['price'].quantile(0.99)
df_ml_clean = df_ml[df_ml['price'] <= price_99].copy()

print(f"\n📊 Preparación completada:")
print(f"   • Registros: {len(df_ml):,} → {len(df_ml_clean):,}")
print(f"   • Variables: {df_ml_clean.shape[1]} (incluyendo 'price')")
print(f"   • Outliers removidos: precios > ${price_99:.2f}")

# ============================================================================
# 5. ENTRENAMIENTO DE MODELOS
# ============================================================================
print(f"\n{'='*100}")
print("5. ENTRENAMIENTO DE MODELOS DE MACHINE LEARNING")
print("="*100)

# Preparar X e y
X = df_ml_clean.drop('price', axis=1)
y = df_ml_clean['price']

# Split train-test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"\n✂️ División de datos:")
print(f"   • Entrenamiento: {len(X_train):,} ({len(X_train)/len(X)*100:.1f}%)")
print(f"   • Prueba: {len(X_test):,} ({len(X_test)/len(X)*100:.1f}%)")

# Escalado
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Entrenar múltiples modelos
print(f"\n🔄 Entrenando modelos...")

models = {
    'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=15, 
                                           min_samples_split=5, random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, max_depth=5, 
                                                    random_state=42),
    'Linear Regression': LinearRegression()
}

results = {}

for name, model in models.items():
    print(f"   • Entrenando {name}...")
    model.fit(X_train_scaled, y_train)
    
    # Predicciones
    y_pred = model.predict(X_test_scaled)
    
    # Métricas
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    
    results[name] = {
        'model': model,
        'predictions': y_pred,
        'r2': r2,
        'rmse': rmse,
        'mae': mae,
        'mape': mape
    }

print("\n✅ Todos los modelos entrenados")

# ============================================================================
# 6. COMPARACIÓN DE MODELOS
# ============================================================================
print(f"\n{'='*100}")
print("6. COMPARACIÓN DE MODELOS")
print("="*100)

comparison_df = pd.DataFrame({
    'Modelo': list(results.keys()),
    'R² Score': [results[m]['r2'] for m in results],
    'RMSE': [results[m]['rmse'] for m in results],
    'MAE': [results[m]['mae'] for m in results],
    'MAPE (%)': [results[m]['mape'] for m in results]
})

comparison_df = comparison_df.sort_values('R² Score', ascending=False)
print(f"\n{comparison_df.to_string(index=False)}")

# Seleccionar mejor modelo
best_model_name = comparison_df.iloc[0]['Modelo']
best_model = results[best_model_name]['model']
best_r2 = results[best_model_name]['r2']
best_rmse = results[best_model_name]['rmse']
best_mae = results[best_model_name]['mae']
best_mape = results[best_model_name]['mape']

print(f"\n🏆 MEJOR MODELO: {best_model_name}")
print(f"   • R²: {best_r2:.4f} ({best_r2*100:.2f}% de varianza explicada)")
print(f"   • RMSE: ${best_rmse:.2f}")
print(f"   • MAE: ${best_mae:.2f}")
print(f"   • MAPE: {best_mape:.2f}%")

# ============================================================================
# 7. VISUALIZACIONES DEL MODELO
# ============================================================================
print(f"\n{'='*100}")
print("7. GENERANDO VISUALIZACIONES DEL MODELO")
print("="*100)

fig2 = plt.figure(figsize=(18, 12))

# 1. Comparación de modelos
ax1 = plt.subplot(2, 3, 1)
comparison_df.plot(x='Modelo', y='R² Score', kind='bar', ax=ax1, 
                   color='skyblue', edgecolor='black', legend=False)
ax1.set_title('Comparación de Modelos: R² Score', fontsize=13, fontweight='bold')
ax1.set_xlabel('Modelo', fontsize=11)
ax1.set_ylabel('R² Score', fontsize=11)
ax1.tick_params(axis='x', rotation=45)
ax1.grid(alpha=0.3, axis='y')

# 2. Predicciones vs Valores Reales
ax2 = plt.subplot(2, 3, 2)
y_pred_best = results[best_model_name]['predictions']
ax2.scatter(y_test, y_pred_best, alpha=0.5, s=20)
ax2.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 
         'r--', lw=2, label='Predicción Perfecta')
ax2.set_xlabel('Precio Real (USD)', fontsize=11)
ax2.set_ylabel('Precio Predicho (USD)', fontsize=11)
ax2.set_title(f'{best_model_name}: Pred vs Real\nR² = {best_r2:.4f}', 
              fontsize=13, fontweight='bold')
ax2.legend()
ax2.grid(alpha=0.3)

# 3. Residuales
ax3 = plt.subplot(2, 3, 3)
residuals = y_test - y_pred_best
ax3.scatter(y_pred_best, residuals, alpha=0.5, s=20, color='green')
ax3.axhline(y=0, color='r', linestyle='--', lw=2)
ax3.set_xlabel('Precio Predicho (USD)', fontsize=11)
ax3.set_ylabel('Residuales (USD)', fontsize=11)
ax3.set_title('Análisis de Residuales', fontsize=13, fontweight='bold')
ax3.grid(alpha=0.3)

# 4. Distribución de residuales
ax4 = plt.subplot(2, 3, 4)
ax4.hist(residuals, bins=50, edgecolor='black', alpha=0.7, color='skyblue')
ax4.axvline(x=0, color='red', linestyle='--', lw=2, label='Error = 0')
ax4.set_xlabel('Residual (USD)', fontsize=11)
ax4.set_ylabel('Frecuencia', fontsize=11)
ax4.set_title('Distribución de Residuales', fontsize=13, fontweight='bold')
ax4.legend()

# 5. Importancia de variables (solo para Random Forest o Gradient Boosting)
ax5 = plt.subplot(2, 3, 5)
if hasattr(best_model, 'feature_importances_'):
    feature_importance = pd.DataFrame({
        'Variable': X.columns,
        'Importancia': best_model.feature_importances_
    }).sort_values('Importancia', ascending=True)
    
    ax5.barh(feature_importance['Variable'], feature_importance['Importancia'], 
             color='coral', edgecolor='black')
    ax5.set_xlabel('Importancia', fontsize=11)
    ax5.set_title('Importancia de Variables', fontsize=13, fontweight='bold')
    ax5.grid(axis='x', alpha=0.3)
else:
    ax5.text(0.5, 0.5, 'Feature Importance\nno disponible para\nRegresión Lineal', 
             ha='center', va='center', fontsize=12)
    ax5.axis('off')

# 6. Comparación de errores
ax6 = plt.subplot(2, 3, 6)
errors_all = {name: np.abs(y_test - results[name]['predictions']) 
              for name in results.keys()}
ax6.boxplot(errors_all.values(), labels=errors_all.keys())
ax6.set_ylabel('Error Absoluto (USD)', fontsize=11)
ax6.set_title('Distribución de Errores por Modelo', fontsize=13, fontweight='bold')
ax6.tick_params(axis='x', rotation=45)
ax6.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('resultados_modelo_ml.png', dpi=300, bbox_inches='tight')
print("\n✅ Visualizaciones guardadas: resultados_modelo_ml.png")
plt.show()

# ============================================================================
# 8. EVALUACIÓN DE CONFIABILIDAD
# ============================================================================
print(f"\n{'='*100}")
print("8. EVALUACIÓN DE CONFIABILIDAD Y APTITUD DEL MODELO")
print("="*100)

errors = np.abs(y_test - y_pred_best)
median_error = np.median(errors)
p75_error = np.percentile(errors, 75)
p90_error = np.percentile(errors, 90)

print(f"""
📊 MÉTRICAS DE CONFIABILIDAD:

1. CAPACIDAD PREDICTIVA:
   • R² Score: {best_r2:.4f} ({best_r2*100:.2f}% de varianza explicada)
   • {'✅ EXCELENTE' if best_r2 > 0.7 else '✅ BUENO' if best_r2 > 0.5 else '⚠️ ACEPTABLE' if best_r2 > 0.3 else '❌ LIMITADO'}

2. PRECISIÓN DE PREDICCIONES:
   • MAE: ${best_mae:.2f}
   • MAPE: {best_mape:.2f}%
   • {'✅ EXCELENTE' if best_mape < 20 else '✅ BUENA' if best_mape < 30 else '⚠️ ACEPTABLE' if best_mape < 40 else '❌ LIMITADA'}

3. DISTRIBUCIÓN DE ERRORES:
   • 50% con error < ${median_error:.2f}
   • 75% con error < ${p75_error:.2f}
   • 90% con error < ${p90_error:.2f}

4. RESIDUALES:
   • Media: ${residuals.mean():.2f}
   • {'✅ Sin sesgo' if abs(residuals.mean()) < 1 else '⚠️ Ligeramente sesgado'}
""")

# Confiabilidad general
if best_r2 >= 0.5 and best_mape < 35:
    reliability = "✅ MODELO CONFIABLE Y APTO"
elif best_r2 >= 0.3 and best_mape < 50:
    reliability = "⚠️ MODELO PARCIALMENTE CONFIABLE"
else:
    reliability = "❌ MODELO REQUIERE MEJORAS"

print(f"\n{'='*100}")
print("CONCLUSIÓN SOBRE CONFIABILIDAD")
print("="*100)
print(f"\n{reliability}")

# ============================================================================
# 9. CONCLUSIONES FINALES
# ============================================================================
print(f"\n{'='*100}")
print("9. CONCLUSIONES FINALES Y RECOMENDACIONES")
print("="*100)

print(f"""
🎯 RESUMEN EJECUTIVO:

1. DATASET ANALIZADO:
   • {len(df):,} propiedades de Airbnb
   • {df['room_type'].value_counts().index[0]} domina ({(df['room_type'].value_counts().iloc[0]/len(df)*100):.1f}%)
   • Precio promedio: ${df['price'].mean():.2f}

2. MODELO DESARROLLADO:
   • Algoritmo: {best_model_name}
   • R²: {best_r2:.4f} | MAE: ${best_mae:.2f} | MAPE: {best_mape:.2f}%
   • {reliability}

3. APLICACIONES RECOMENDADAS:
   ✅ Estimaciones iniciales de precio para hosts
   ✅ Comparación relativa entre propiedades
   ✅ Identificación de drivers de valor
   ✅ Análisis de sensibilidad de variables
   ⚠️ Complementar con análisis de ubicación detallada

4. LIMITACIONES:
   • No incluye datos geográficos procesados
   • Falta información de amenidades específicas
   • No considera estacionalidad ni eventos
   
5. VALOR AGREGADO:
   • Base cuantitativa para decisiones vs intuición
   • Framework extensible para mejoras futuras
   • Proceso replicable con datos actualizados

El modelo es APTO como herramienta de APOYO a la toma de decisiones,
especialmente cuando se combina con conocimiento del mercado local
y análisis cualitativo de características específicas.
""")

print(f"\n{'='*100}")
print("✅ ANÁLISIS COMPLETADO EXITOSAMENTE")
print("="*100)
print(f"""
📊 Archivos generados:
   1. visualizaciones_airbnb.png - Análisis exploratorio
   2. resultados_modelo_ml.png - Evaluación del modelo

🎓 Actividad Integradora - Machine Learning
   Estudiante: José González
   ADEN International Business School
""")

# Guardar resultados en CSV (RMSE y MAE son distintos)
results_summary = pd.DataFrame({
    'Métrica': ['R² Score', 'RMSE', 'MAE', 'MAPE (%)', 'Error Mediano', 
                'Error P75', 'Error P90'],
    'Valor': [f'{best_r2:.4f}', f'${best_rmse:.2f}', f'${best_mae:.2f}', 
              f'{best_mape:.2f}%', f'${median_error:.2f}', 
              f'${p75_error:.2f}', f'${p90_error:.2f}']
})
results_summary.to_csv('metricas_modelo.csv', index=False)
print("\n📄 Métricas guardadas: metricas_modelo.csv")

# Guardar comparación de los 3 modelos para la web
comparison_df.to_csv('model_comparison.csv', index=False)
print("📄 Comparación de modelos guardada: model_comparison.csv")

print("\n🎉 ¡Todo listo! Revisa los archivos generados.")
