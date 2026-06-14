import sqlite3
import pandas as pd
import os
from sqlalchemy import create_engine

def load_to_dw():
    print("Iniciando Fase 3: Carga al Data Warehouse MySQL...")
    
    db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'database'))
    staging_db_path = os.path.join(db_dir, 'staging.sqlite')
    
    # Connect to MySQL Data Warehouse
    DB_URI = 'mysql+pymysql://root:12345@127.0.0.1:3307/cusco_turismo_dw'
    engine = create_engine(DB_URI)
    
    conn_staging = sqlite3.connect(staging_db_path)
    
    # Lista de tablas en orden (Primero dimensiones, luego hechos)
    tables = [
        ('stg_dim_time', 'dim_time'),
        ('stg_dim_geography', 'dim_geography'),
        ('stg_dim_demographics', 'dim_demographics'),
        ('stg_dim_tourist_site', 'dim_tourist_site'),
        ('stg_dim_accommodation', 'dim_accommodation'),
        ('stg_fact_visitor_flow', 'fact_visitor_flow'),
        ('stg_fact_daily_occupancy', 'fact_daily_occupancy')
    ]
    
    # In db_setup.py we already drop and recreate the tables cleanly.
    # So here we just append.
    
    for stg_table, dw_table in tables:
        print(f"Cargando {dw_table}...")
        df = pd.read_sql_query(f"SELECT * FROM {stg_table}", conn_staging)
        # Usamos to_sql con append porque la estructura ya fue creada en db_setup.py
        df.to_sql(dw_table, con=engine, if_exists='append', index=False)
        print(f"-> Insertados {len(df)} registros en {dw_table}.")
        
    conn_staging.close()
    
    print("Carga a Data Warehouse completada exitosamente.")

if __name__ == "__main__":
    load_to_dw()
