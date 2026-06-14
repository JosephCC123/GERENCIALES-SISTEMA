import os
from sqlalchemy import create_engine, text

# Connect to MySQL Data Warehouse
DB_URI = 'mysql+pymysql://root:12345@127.0.0.1:3307/cusco_turismo_dw'
engine = create_engine(DB_URI)

def setup_data_warehouse():
    print("Configurando esquema del Data Warehouse en MySQL...")
    
    with engine.connect() as conn:
        # Drop existing tables if they exist to recreate the schema (Full Load Prep)
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        tables = ['fact_visitor_flow', 'fact_daily_occupancy', 'dim_time', 'dim_geography', 'dim_demographics', 'dim_tourist_site', 'dim_accommodation']
        for table in tables:
            conn.execute(text(f"DROP TABLE IF EXISTS {table};"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
        # 1. Dimensiones
        
        # dim_time
        conn.execute(text("""
        CREATE TABLE dim_time (
            time_id INT PRIMARY KEY,
            date VARCHAR(20) UNIQUE NOT NULL,
            year INT NOT NULL,
            month INT NOT NULL,
            day INT NOT NULL,
            day_of_week VARCHAR(20) NOT NULL,
            is_weekend BOOLEAN NOT NULL
        )
        """))
        
        # dim_geography
        conn.execute(text("""
        CREATE TABLE dim_geography (
            geography_id INT PRIMARY KEY AUTO_INCREMENT,
            country VARCHAR(100) UNIQUE NOT NULL,
            region VARCHAR(100)
        )
        """))
        
        # dim_demographics
        conn.execute(text("""
        CREATE TABLE dim_demographics (
            demographic_id INT PRIMARY KEY AUTO_INCREMENT,
            age_group VARCHAR(50) NOT NULL,
            gender VARCHAR(50) NOT NULL,
            purpose_of_visit VARCHAR(100) NOT NULL,
            UNIQUE(age_group, gender, purpose_of_visit)
        )
        """))
        
        # dim_tourist_site
        conn.execute(text("""
        CREATE TABLE dim_tourist_site (
            site_id INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            location VARCHAR(255),
            capacity INT
        )
        """))
        
        # dim_accommodation
        conn.execute(text("""
        CREATE TABLE dim_accommodation (
            accommodation_id INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            category VARCHAR(100),
            total_rooms INT
        )
        """))
        
        # 2. Hechos
        
        # fact_visitor_flow
        conn.execute(text("""
        CREATE TABLE fact_visitor_flow (
            visit_id INT PRIMARY KEY AUTO_INCREMENT,
            time_id INT NOT NULL,
            site_id INT NOT NULL,
            geography_id INT NOT NULL,
            demographic_id INT NOT NULL,
            visit_count INT DEFAULT 1,
            duration_days INT NOT NULL,
            
            FOREIGN KEY (time_id) REFERENCES dim_time(time_id),
            FOREIGN KEY (site_id) REFERENCES dim_tourist_site(site_id),
            FOREIGN KEY (geography_id) REFERENCES dim_geography(geography_id),
            FOREIGN KEY (demographic_id) REFERENCES dim_demographics(demographic_id)
        )
        """))
        
        # fact_daily_occupancy
        conn.execute(text("""
        CREATE TABLE fact_daily_occupancy (
            occupancy_id INT PRIMARY KEY AUTO_INCREMENT,
            time_id INT NOT NULL,
            accommodation_id INT NOT NULL,
            occupied_rooms INT NOT NULL,
            available_rooms INT NOT NULL,
            occupancy_rate FLOAT NOT NULL,
            
            FOREIGN KEY (time_id) REFERENCES dim_time(time_id),
            FOREIGN KEY (accommodation_id) REFERENCES dim_accommodation(accommodation_id)
        )
        """))
        
        # Indices para performance BI
        conn.execute(text("CREATE INDEX idx_fact_time ON fact_visitor_flow(time_id)"))
        conn.execute(text("CREATE INDEX idx_fact_site ON fact_visitor_flow(site_id)"))
        conn.execute(text("CREATE INDEX idx_fact_geo ON fact_visitor_flow(geography_id)"))
        conn.execute(text("CREATE INDEX idx_fact_demo ON fact_visitor_flow(demographic_id)"))
        
        conn.commit()
    
    print("Esquema Data Warehouse creado exitosamente en MySQL.")

if __name__ == "__main__":
    setup_data_warehouse()
