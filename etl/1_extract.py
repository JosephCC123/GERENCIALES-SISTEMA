import sqlite3
import pandas as pd
import os
from sqlalchemy import create_engine

def extract_to_staging():
    print("Iniciando Fase 1: Extracción a Staging Area...")
    
    db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'database'))
    staging_db_path = os.path.join(db_dir, 'staging.sqlite')
    
    if os.path.exists(staging_db_path):
        os.remove(staging_db_path)
        
    # MySQL Connection using SQLAlchemy
    mysql_uri = "mysql+pymysql://root:12345@127.0.0.1:3307/cusco_turismo_db"
    source_engine = create_engine(mysql_uri)
    
    conn_staging = sqlite3.connect(staging_db_path)
    
    # Tablas pesadas y transaccionales a extraer
    tables_to_extract = [
        'visitors',
        'tourist_sites',
        'accommodations',
        'daily_occupancy'
    ]
    
    for table in tables_to_extract:
        print(f"Extrayendo tabla '{table}'...")
        # Leer todo desde el origen
        df = pd.read_sql_query(f"SELECT * FROM {table}", source_engine)
        
        # Guardar crudo en el staging
        df.to_sql(table, conn_staging, if_exists='replace', index=False)
        print(f"-> Cargados {len(df)} registros en staging.{table}")
        
    source_engine.dispose()
    conn_staging.close()
    
    print("Extracción a Staging completada exitosamente.")

if __name__ == "__main__":
    extract_to_staging()
