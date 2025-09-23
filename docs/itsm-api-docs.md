# ITSM API Documentation

## Overview
This document provides detailed information about the RESTful API endpoints for the Internal Service Hub (ITSM) module. The API follows standard REST conventions and uses JSON for request/response payloads.

## Authentication
All API endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Base URL
```
/api/itsm
```

## Service Catalog

### Get All Services
```
GET /service-catalog
```
**Query Parameters:**
- `status` (optional): Filter by service status
- `division` (optional): Filter by division
- `categoryId` (optional): Filter by category ID

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### Create Service
```
POST /service-catalog
```
**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category_id": "integer",
  "division": "string",
  "cost_type": "string",
  "cost_amount": "number",
  "sla_days": "integer",
  "tags": ["string"],
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

### Get Service by ID
```
GET /service-catalog/{id}
```

### Update Service
```
PUT /service-catalog/{id}
```

### Delete Service
```
DELETE /service-catalog/{id}
```

### Approve Service
```
POST /service-catalog/{id}/approve
```

### Reject Service
```
POST /service-catalog/{id}/reject
```

## Service Categories

### Get All Categories
```
GET /service-categories
```

### Create Category
```
POST /service-categories
```
**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

### Get Category by ID
```
GET /service-categories/{id}
```

### Update Category
```
PUT /service-categories/{id}
```

### Delete Category
```
DELETE /service-categories/{id}
```

## Service Requests

### Get All Service Requests
```
GET /service-requests
```
**Query Parameters:**
- `status` (optional): Filter by request status
- `requesterId` (optional): Filter by requester ID
- `providerId` (optional): Filter by provider ID

### Create Service Request
```
POST /service-requests
```
**Request Body:**
```json
{
  "service_id": "integer",
  "title": "string",
  "description": "string",
  "priority": "string",
  "requested_for": "integer",
  "metadata": {}
}
```

### Get Service Request by ID
```
GET /service-requests/{id}
```

### Update Service Request
```
PUT /service-requests/{id}
```

### Delete Service Request
```
DELETE /service-requests/{id}
```

### Approve Service Request
```
POST /service-requests/{id}/approve
```

### Complete Service Request
```
POST /service-requests/{id}/complete
```

## Internal Billing

### Get All Billing Records
```
GET /billing
```
**Query Parameters:**
- `status` (optional): Filter by billing status
- `requesterDivision` (optional): Filter by requester division
- `providerDivision` (optional): Filter by provider division
- `startDate` & `endDate` (optional): Filter by billing period

### Create Billing Record
```
POST /billing
```
**Request Body:**
```json
{
  "service_request_id": "integer",
  "amount": "number",
  "billing_period": "date",
  "due_date": "date",
  "notes": "string",
  "metadata": {}
}
```

### Get Billing Record by ID
```
GET /billing/{id}
```

### Update Billing Record
```
PUT /billing/{id}
```

### Delete Billing Record
```
DELETE /billing/{id}
```

### Confirm Payment
```
POST /billing/{id}/confirm-payment
```

## Change Management

### Get All Change Requests
```
GET /change-requests
```
**Query Parameters:**
- `status` (optional): Filter by request status
- `requesterId` (optional): Filter by requester ID
- `changeManagerId` (optional): Filter by change manager ID
- `implementerId` (optional): Filter by implementer ID

### Create Change Request
```
POST /change-requests
```
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "reason": "string",
  "impact": "string",
  "rollback_plan": "string",
  "schedule_date": "date",
  "priority": "string",
  "risk_level": "string",
  "metadata": {}
}
```

### Get Change Request by ID
```
GET /change-requests/{id}
```

### Update Change Request
```
PUT /change-requests/{id}
```

### Delete Change Request
```
DELETE /change-requests/{id}
```

### Approve Change Request
```
POST /change-requests/{id}/approve
```

### Complete Change Request
```
POST /change-requests/{id}/complete
```

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error