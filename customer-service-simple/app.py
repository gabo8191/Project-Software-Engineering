#!/usr/bin/env python3
"""
Simple Customer Service - # Health endpoint
@app.route('/health', methods=['GET'])
@app.route('/customer/health', methods=['GET'])
def health():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "customer-service-simple",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

# Root endpoint
@app.route('/', methods=['GET'])
@app.route('/customer', methods=['GET'])
@app.route('/customer/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "customer-service-simple",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/createcustomer",
            "/customers", 
            "/findcustomerbyid",
            "/updatecustomer"
        ]
    })

# Create customer endpoint
@app.route('/createcustomer', methods=['POST'])
@app.route('/customer/createcustomer', methods=['POST'])
def create_customer():o bullshit, just working code
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import json
import os
import requests
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# In-memory storage for now (could be upgraded to real DB later)
customers = {}

def register_with_consul():
    """Register this service with Consul"""
    try:
        consul_host = os.getenv('CONSUL_HOST', 'localhost')
        consul_port = os.getenv('CONSUL_PORT', '8500')
        service_name = os.getenv('SERVICE_NAME', 'customer-service')
        service_port = int(os.getenv('SERVICE_PORT', '3000'))
        
        registration_data = {
            "ID": f"{service_name}-1",
            "Name": service_name,
            "Tags": ["customer", "api", "microservice"],
            "Port": service_port,
            "Check": {
                "HTTP": f"http://{service_name}:{service_port}/health",
                "Interval": "30s"
            }
        }
        
        consul_url = f"http://{consul_host}:{consul_port}/v1/agent/service/register"
        response = requests.put(consul_url, json=registration_data)
        
        if response.status_code == 200:
            logger.info(f"✅ Service registered with Consul: {service_name}")
        else:
            logger.error(f"❌ Failed to register with Consul: {response.status_code}")
            
    except Exception as e:
        logger.error(f"❌ Error registering with Consul: {e}")

# Health endpoint
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "customer-service-simple",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

# Create customer endpoint
@app.route('/createcustomer', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        data = request.get_json()
        logger.info(f"Creating customer with data: {data}")
        
        # Basic validation
        required_fields = ['document', 'firstname', 'lastname', 'address', 'phone', 'email']
        for field in required_fields:
            if field not in data or not data[field]:
                logger.warning(f"Missing required field: {field}")
                return jsonify({"createCustomerValid": False}), 400
        
        document = data['document']
        
        # Check if customer already exists
        if document in customers:
            logger.warning(f"Customer {document} already exists")
            return jsonify({"createCustomerValid": False}), 400
        
        # Create customer
        customer = {
            "document": document,
            "firstname": data['firstname'],
            "lastname": data['lastname'],
            "address": data['address'],
            "phone": data['phone'],
            "email": data['email'],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        customers[document] = customer
        logger.info(f"Customer {document} created successfully")
        
        return jsonify({"createCustomerValid": True}), 200
        
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
        return jsonify({"createCustomerValid": False}), 500

# Get all customers endpoint
@app.route('/customers', methods=['GET'])
@app.route('/customer/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        logger.info(f"Getting all customers. Total: {len(customers)}")
        customer_list = list(customers.values())
        return jsonify(customer_list), 200
        
    except Exception as e:
        logger.error(f"Error getting customers: {e}")
        return jsonify([]), 500

# Find customer by ID endpoint
@app.route('/findcustomerbyid', methods=['GET'])
@app.route('/customer/findcustomerbyid', methods=['GET'])
def find_customer_by_id():
    """Find customer by document ID"""
    try:
        customer_id = request.args.get('customerid')
        if not customer_id:
            return jsonify({"error": "customerid parameter required"}), 400
        
        logger.info(f"Finding customer by ID: {customer_id}")
        
        if customer_id in customers:
            return jsonify(customers[customer_id]), 200
        else:
            return jsonify({"error": "Customer not found"}), 404
            
    except Exception as e:
        logger.error(f"Error finding customer: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Update customer endpoint
@app.route('/updatecustomer', methods=['PUT'])
@app.route('/customer/updatecustomer', methods=['PUT'])
def update_customer():
    """Update customer"""
    try:
        data = request.get_json()
        customer_id = request.args.get('customerid')
        
        if not customer_id:
            return jsonify({"updateCustomerValid": False}), 400
            
        if customer_id not in customers:
            return jsonify({"updateCustomerValid": False}), 404
        
        logger.info(f"Updating customer {customer_id}")
        
        # Update customer data
        customer = customers[customer_id]
        for field in ['firstname', 'lastname', 'address', 'phone', 'email']:
            if field in data:
                customer[field] = data[field]
        
        customer['updated_at'] = datetime.now().isoformat()
        customers[customer_id] = customer
        
        logger.info(f"Customer {customer_id} updated successfully")
        return jsonify({"updateCustomerValid": True}), 200
        
    except Exception as e:
        logger.error(f"Error updating customer: {e}")
        return jsonify({"updateCustomerValid": False}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Simple Customer Service...")
    logger.info("📍 Service: customer-service-simple")
    logger.info("🌐 Port: 3000")
    
    # Register with Consul
    register_with_consul()
    
    logger.info("✅ Service ready!")
    
    app.run(host='0.0.0.0', port=3000, debug=True)