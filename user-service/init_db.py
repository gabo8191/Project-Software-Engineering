#!/usr/bin/env python3
"""
Script de inicialización de la base de datos
Crea las tablas y datos de prueba
"""
import logging
from app.core.database import create_tables, check_database_connection, get_db
from app.core.config import settings
from app.crud.customer import customer_crud

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_customers():
    """Crear customers de prueba"""
    logger.info("👥 Creando customers de prueba...")
    
    # Sample customers data
    sample_customers = [
        {
            "document": "12345678",
            "firstname": "Juan",
            "lastname": "Pérez",
            "address": "Calle 123 #45-67, Bogotá",
            "phone": "+57 300 123 4567",
            "email": "juan.perez@email.com"
        },
        {
            "document": "87654321",
            "firstname": "María",
            "lastname": "García",
            "address": "Carrera 15 #23-45, Medellín",
            "phone": "+57 300 555 1234",
            "email": "maria.garcia@email.com"
        },
        {
            "document": "11111111",
            "firstname": "Carlos",
            "lastname": "Rodríguez",
            "address": "Avenida 7 #12-34, Cali",
            "phone": "+57 310 987 6543",
            "email": "carlos.rodriguez@email.com"
        }
    ]
    
    try:
        db = next(get_db())
        created_count = 0
        
        for customer_data in sample_customers:
            # Check if customer already exists
            existing = customer_crud.get_customer_by_id(db, customer_data["document"])
            if existing:
                logger.info(f"👤 Customer {customer_data['document']} already exists, skipping...")
                continue
            
            # Create customer
            new_customer = customer_crud.create_customer(db, customer_data)
            if new_customer:
                logger.info(f"✅ Created customer: {new_customer.document} - {new_customer.firstname} {new_customer.lastname}")
                created_count += 1
            else:
                logger.warning(f"❌ Failed to create customer: {customer_data['document']}")
        
        logger.info(f"🎉 Successfully created {created_count} sample customers!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating sample customers: {e}")
        return False

def main():
    """Función principal de inicialización"""
    logger.info("🚀 Iniciando configuración de la base de datos...")
    
    try:
        # Verificar conexión a la base de datos
        logger.info("🔍 Verificando conexión a la base de datos...")
        if not check_database_connection():
            logger.error("❌ No se pudo conectar a la base de datos")
            return False
        
        logger.info("✅ Conexión a la base de datos exitosa")
        
        # Crear tablas
        logger.info("📋 Creando tablas...")
        create_tables()
        logger.info("✅ Tablas creadas exitosamente")
        
        # Crear customers de prueba
        create_sample_customers()
        
        logger.info("🎉 Inicialización de la base de datos completada!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error durante la inicialización: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

