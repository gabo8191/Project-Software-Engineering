#!/usr/bin/env python3
"""
Script de inicialización de la base de datos
Crea las tablas y datos de prueba
"""
import logging
from app.core.database import create_tables, check_database_connection
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        logger.info("🎉 Inicialización de la base de datos completada!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error durante la inicialización: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

