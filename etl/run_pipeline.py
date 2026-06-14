import time

# Importar los modulos locales
from db_setup import setup_data_warehouse
from importlib import import_module

def main():
    print("="*50)
    print("BI ADVANCED ETL PIPELINE - INICIO")
    print("="*50)
    
    start_time = time.time()
    
    # Setup del Data Warehouse
    setup_data_warehouse()
    print("-" * 30)
    
    # 1. Extracción
    extract = import_module('1_extract')
    extract.extract_to_staging()
    print("-" * 30)
    
    # 2. Transformación
    transform = import_module('2_transform')
    transform.transform_data()
    print("-" * 30)
    
    # 3. Carga
    load = import_module('3_load')
    load.load_to_dw()
    print("-" * 30)
    
    end_time = time.time()
    elapsed = end_time - start_time
    
    print("="*50)
    print(f"PIPELINE COMPLETADO EXITOSAMENTE EN {elapsed:.2f} SEGUNDOS")
    print("El Data Warehouse está listo para ser consumido por el Dashboard.")
    print("="*50)

if __name__ == "__main__":
    main()
