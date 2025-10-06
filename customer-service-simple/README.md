# Customer Service Simple

Simple Flask-based customer service with no bullshit.

## Features
- ✅ Create customers
- ✅ Get all customers
- ✅ Find customer by ID
- ✅ Update customers
- ✅ Health check
- ✅ No database complexity
- ✅ In-memory storage

## Endpoints
- `GET /health` - Health check
- `POST /createcustomer` - Create customer
- `GET /customers` - Get all customers
- `GET /findcustomerbyid?customerid=123` - Find customer by ID
- `PUT /updatecustomer?customerid=123` - Update customer

## Run locally
```bash
pip install -r requirements.txt
python app.py
```

## Run with Docker
```bash
docker build -t customer-service-simple .
docker run -p 3000:3000 customer-service-simple
```