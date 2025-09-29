#!/usr/bin/env python3
"""
Script de prueba para el User Service
Ejecuta pruebas básicas de los endpoints
"""
import requests
import json
import time
import sys

# Configuración
BASE_URL = "http://localhost:8000"
CUSTOMER_URL = f"{BASE_URL}/customer"

def test_health_checks():
    """Prueba los health checks"""
    print("🔍 Probando health checks...")
    
    endpoints = [
        ("/health", "Health Check"),
        ("/ready", "Readiness Check"),
        ("/live", "Liveness Check")
    ]
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {name}: OK")
            else:
                print(f"❌ {name}: FAILED ({response.status_code})")
        except Exception as e:
            print(f"❌ {name}: ERROR - {e}")

def test_create_customer():
    """Prueba crear un cliente"""
    print("\n👤 Probando crear cliente...")
    
    customer_data = {
        "document": "12345678",
        "firstname": "Juan",
        "lastname": "Pérez",
        "address": "Calle 123 #45-67, Bogotá",
        "phone": "+57-300-123-4567",
        "email": "juan.perez@email.com"
    }
    
    try:
        response = requests.post(
            f"{CUSTOMER_URL}/createcustomer",
            json=customer_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("createCustomerValid"):
                print("✅ Cliente creado exitosamente")
                return customer_data["document"]
            else:
                print("❌ Fallo al crear cliente")
                return None
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_find_customer(customer_id):
    """Prueba buscar un cliente"""
    print(f"\n🔍 Probando buscar cliente: {customer_id}")
    
    try:
        response = requests.get(
            f"{CUSTOMER_URL}/findcustomerbyid",
            params={"customerid": customer_id}
        )
        
        if response.status_code == 200:
            customer = response.json()
            print(f"✅ Cliente encontrado: {customer['firstname']} {customer['lastname']}")
            return True
        elif response.status_code == 404:
            print("❌ Cliente no encontrado")
            return False
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_update_customer(customer_id):
    """Prueba actualizar un cliente"""
    print(f"\n✏️ Probando actualizar cliente: {customer_id}")
    
    update_data = {
        "firstname": "Juan Carlos",
        "phone": "+57-300-987-6543"
    }
    
    try:
        response = requests.put(
            f"{CUSTOMER_URL}/updatecustomer",
            json=update_data,
            params={"customerid": customer_id},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("updateCustomerValid"):
                print("✅ Cliente actualizado exitosamente")
                return True
            else:
                print("❌ Fallo al actualizar cliente")
                return False
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_all_customers():
    """Prueba obtener todos los clientes"""
    print("\n📋 Probando obtener todos los clientes...")
    
    try:
        response = requests.get(f"{CUSTOMER_URL}/customers")
        
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ Se encontraron {len(customers)} clientes")
            return True
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_service_info():
    """Prueba obtener información del servicio"""
    print("\nℹ️ Probando información del servicio...")
    
    try:
        response = requests.get(f"{BASE_URL}/info")
        
        if response.status_code == 200:
            info = response.json()
            print(f"✅ Servicio: {info['service']} v{info['version']}")
            print(f"   Framework: {info['framework']}")
            print(f"   Base de datos: {info['database']}")
            return True
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del User Service...")
    print("=" * 50)
    
    # Esperar un poco para que el servicio esté listo
    print("⏳ Esperando que el servicio esté listo...")
    time.sleep(5)
    
    # Ejecutar pruebas
    test_health_checks()
    test_service_info()
    
    # Probar operaciones CRUD
    customer_id = test_create_customer()
    if customer_id:
        test_find_customer(customer_id)
        test_update_customer(customer_id)
        test_find_customer(customer_id)  # Verificar actualización
    
    test_get_all_customers()
    
    print("\n" + "=" * 50)
    print("✅ Pruebas completadas!")
    print("\n📚 Documentación disponible en:")
    print(f"   Swagger UI: {BASE_URL}/docs")
    print(f"   ReDoc: {BASE_URL}/redoc")

if __name__ == "__main__":
    main()

