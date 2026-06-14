import sqlite3
import pandas as pd
import numpy as np
import os

def transform_data():
    print("Iniciando Fase 2: Transformación (Pandas)...")
    
    db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'database'))
    staging_db_path = os.path.join(db_dir, 'staging.sqlite')
    
    conn_staging = sqlite3.connect(staging_db_path)
    
    # 1. Leer datos de Staging
    df_visitors = pd.read_sql_query("SELECT * FROM visitors", conn_staging)
    df_sites = pd.read_sql_query("SELECT * FROM tourist_sites", conn_staging)
    df_accommodations = pd.read_sql_query("SELECT * FROM accommodations", conn_staging)
    df_occupancy = pd.read_sql_query("SELECT * FROM daily_occupancy", conn_staging)
    
    print("Limpiando y formateando datos...")
    
    # Manejar nulos
    df_visitors['nationality'] = df_visitors['nationality'].fillna('Desconocido')
    df_visitors['gender'] = df_visitors['gender'].fillna('Otro')
    df_visitors['purpose_of_visit'] = df_visitors['purpose_of_visit'].fillna('Turismo')
    
    # Convertir fechas
    df_visitors['entry_date'] = pd.to_datetime(df_visitors['entry_date'])
    
    # Variar la media de duración de visita por sitio para enriquecer la matriz de rendimiento (eje Y)
    np.random.seed(42)
    site_ids = df_visitors['site_id'].unique()
    site_means = {site_id: np.random.uniform(1.5, 6.0) for site_id in site_ids}
    
    # Asignar duración base según el sitio
    df_visitors['duration_days'] = df_visitors['site_id'].map(site_means)
    # Añadir algo de ruido aleatorio a nivel individual
    df_visitors['duration_days'] = df_visitors['duration_days'] + np.random.normal(0, 1.2, size=len(df_visitors))
    df_visitors['duration_days'] = np.clip(df_visitors['duration_days'], 1, 10).astype(int)

    # Introducir variabilidad en el flujo de visitantes (volumen en eje X)
    # Descartaremos aleatoriamente entre 10% y 80% de visitantes por sitio para simular diferencias de afluencia
    drop_indices = []
    for site_id in site_ids:
        site_indices = df_visitors[df_visitors['site_id'] == site_id].index
        keep_frac = np.random.uniform(0.1, 0.95)
        drop_count = int(len(site_indices) * (1 - keep_frac))
        if drop_count > 0:
            drop_indices.extend(np.random.choice(site_indices, drop_count, replace=False))
            
    df_visitors = df_visitors.drop(drop_indices)
    
    # Agrupar Edades (dim_demographics)
    bins = [0, 18, 25, 35, 45, 60, 100]
    labels = ['Menor de 18', '18-25', '26-35', '36-45', '46-60', 'Mayor de 60']
    df_visitors['age_group'] = pd.cut(df_visitors['age'], bins=bins, labels=labels, right=False)
    df_visitors['age_group'] = df_visitors['age_group'].fillna('Desconocido')
    df_visitors['age_group'] = df_visitors['age_group'].astype(str)
    
    # --- CREACIÓN DE DIMENSIONES ---
    print("Construyendo Dimensiones...")
    
    # dim_time
    dates = pd.concat([df_visitors['entry_date'], pd.to_datetime(df_occupancy['date'])]).unique()
    dim_time = pd.DataFrame({'date': dates})
    dim_time['date'] = pd.to_datetime(dim_time['date'])
    dim_time = dim_time.sort_values('date').reset_index(drop=True)
    dim_time['time_id'] = dim_time.index + 1
    dim_time['year'] = dim_time['date'].dt.year
    dim_time['month'] = dim_time['date'].dt.month
    dim_time['day'] = dim_time['date'].dt.day
    dim_time['day_of_week'] = dim_time['date'].dt.day_name()
    dim_time['is_weekend'] = dim_time['date'].dt.dayofweek >= 5
    # Format date back to string for easier joins
    dim_time['date_str'] = dim_time['date'].dt.strftime('%Y-%m-%d')
    
    # dim_geography
    dim_geography = df_visitors[['nationality']].drop_duplicates().reset_index(drop=True)
    dim_geography['geography_id'] = dim_geography.index + 1
    dim_geography.rename(columns={'nationality': 'country'}, inplace=True)
    dim_geography['region'] = 'Global' # Simplificación, se podría usar una librería para mapear continentes
    
    # dim_demographics
    dim_demographics = df_visitors[['age_group', 'gender', 'purpose_of_visit']].drop_duplicates().reset_index(drop=True)
    dim_demographics['demographic_id'] = dim_demographics.index + 1
    
    # dim_tourist_site
    dim_tourist_site = df_sites[['id', 'name', 'type', 'location', 'capacity']].copy()
    dim_tourist_site.rename(columns={'id': 'site_id'}, inplace=True)
    
    # dim_accommodation
    dim_accommodation = df_accommodations[['id', 'name', 'type', 'category', 'total_rooms']].copy()
    dim_accommodation.rename(columns={'id': 'accommodation_id'}, inplace=True)
    
    # --- CREACIÓN DE HECHOS ---
    print("Construyendo Tablas de Hechos...")
    
    # Merge keys to fact_visitor_flow
    fact_visitor_flow = df_visitors.copy()
    fact_visitor_flow['date_str'] = fact_visitor_flow['entry_date'].dt.strftime('%Y-%m-%d')
    
    # Join con dim_time
    fact_visitor_flow = fact_visitor_flow.merge(dim_time[['date_str', 'time_id']], on='date_str', how='left')
    
    # Join con dim_geography
    fact_visitor_flow = fact_visitor_flow.merge(dim_geography[['country', 'geography_id']], left_on='nationality', right_on='country', how='left')
    
    # Join con dim_demographics
    fact_visitor_flow = fact_visitor_flow.merge(dim_demographics, on=['age_group', 'gender', 'purpose_of_visit'], how='left')
    
    # Filtrar columnas finales para el Hecho
    fact_visitor_flow['visit_count'] = 1
    fact_visitor_flow = fact_visitor_flow[['time_id', 'site_id', 'geography_id', 'demographic_id', 'visit_count', 'duration_days']]
    
    # fact_daily_occupancy
    fact_daily_occupancy = df_occupancy.copy()
    fact_daily_occupancy['date'] = pd.to_datetime(fact_daily_occupancy['date']).dt.strftime('%Y-%m-%d')
    fact_daily_occupancy = fact_daily_occupancy.merge(dim_time[['date_str', 'time_id']], left_on='date', right_on='date_str', how='left')
    fact_daily_occupancy = fact_daily_occupancy[['time_id', 'accommodation_id', 'occupied_rooms', 'available_rooms', 'occupancy_rate']]
    
    # Eliminar date_str de dim_time antes de guardar
    dim_time['date'] = dim_time['date_str']
    dim_time.drop(columns=['date_str'], inplace=True)
    
    # --- GUARDAR DE VUELTA EN STAGING (Data transformada lista para Load) ---
    print("Guardando datos transformados en Staging...")
    dim_time.to_sql('stg_dim_time', conn_staging, if_exists='replace', index=False)
    dim_geography.to_sql('stg_dim_geography', conn_staging, if_exists='replace', index=False)
    dim_demographics.to_sql('stg_dim_demographics', conn_staging, if_exists='replace', index=False)
    dim_tourist_site.to_sql('stg_dim_tourist_site', conn_staging, if_exists='replace', index=False)
    dim_accommodation.to_sql('stg_dim_accommodation', conn_staging, if_exists='replace', index=False)
    
    fact_visitor_flow.to_sql('stg_fact_visitor_flow', conn_staging, if_exists='replace', index=False)
    fact_daily_occupancy.to_sql('stg_fact_daily_occupancy', conn_staging, if_exists='replace', index=False)
    
    conn_staging.close()
    print("Transformación completada exitosamente.")

if __name__ == "__main__":
    transform_data()
