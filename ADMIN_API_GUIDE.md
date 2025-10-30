# Admin Panel API Integration Guide

This guide describes how to integrate your admin panel with the Savings Management System backend API.

**Base URL:** `https://savings-ms-client-api.onrender.com/api/v1`

---

## Authentication Flow

### 1. Admin Login

Login to get an access token that's required for all admin endpoints.

**Endpoint:** `POST /admin/login`

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "admin-id",
    "fullName": "System Admin",
    "email": "admin@example.com"
  }
}
```

**Usage:**

- Store the `accessToken` from the response
- Include it in all subsequent API requests as: `Authorization: Bearer <accessToken>`
- Token expires after 15 minutes (you'll need to re-login)

---

## Dashboard

### Get Dashboard Statistics

Fetch summary statistics for the dashboard overview.

**Endpoint:** `GET /admin/stats`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

```json
{
  "totalUsers": 150,
  "verifiedUsers": 120,
  "totalBalance": 45000.5,
  "totalTransactions": 542
}
```

**Usage:**

- Call this endpoint on dashboard load
- Display the statistics in cards/widgets
- Refresh periodically to keep data updated

---

## Customers Management

### List All Customers

Get paginated list of all customers with search functionality.

**Endpoint:** `GET /admin/users`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Parameters:**

- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20
- `search` (optional): Search by name or email (case-insensitive)

**Examples:**

```
GET /admin/users
GET /admin/users?page=2&limit=50
GET /admin/users?search=john&page=1
```

**Response:**

```json
{
  "users": [
    {
      "_id": "user-id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "balance": 1250.0,
      "deviceVerified": true,
      "deviceId": "abc123xyz",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "user-id-2",
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "balance": 0,
      "deviceVerified": false,
      "deviceId": "def456uvw",
      "createdAt": "2024-01-20T14:15:00.000Z"
    }
  ],
  "total": 150,
  "totalPages": 8,
  "currentPage": 1
}
```

**Usage:**

- Display users in a table with columns: `fullName`, `email`, `balance`, `deviceVerified`
- For unverified users (`deviceVerified: false`), show a "View Details & Verify" button
- Implement pagination controls using `total`, `totalPages`, `currentPage`
- Add search input that queries with the `search` parameter

---

### Get Customer Details

Fetch detailed information for a specific customer.

**Endpoint:** `GET /admin/users/:userId`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**URL Parameters:**

- `userId`: The customer's unique ID

**Example:**

```
GET /admin/users/507f1f77bcf86cd799439011
```

**Response:**

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "balance": 0,
    "deviceVerified": false,
    "deviceId": "def456uvw",
    "createdAt": "2024-01-20T14:15:00.000Z"
  }
}
```

**Usage:**

- Show this data when clicking "View Details" on unverified users
- Display full user information including the `deviceId`
- Show a prominent "Verify Device" button if `deviceVerified: false`

---

### Verify Customer Device

Activate a customer's account by verifying their device.

**Endpoint:** `POST /admin/users/:userId/verify-device`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**URL Parameters:**

- `userId`: The customer's unique ID

**Example:**

```
POST /admin/users/507f1f77bcf86cd799439011/verify-device
```

**Response:**

```json
{
  "message": "User device verified",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "deviceVerified": true
  }
}
```

**Important Notes:**

- This enables the user to log in and perform transactions
- A push notification is automatically sent to the user's device if they have registered one
- Verification is irreversible (you cannot un-verify)

**Usage:**

- Call this endpoint when admin clicks "Verify Device" button
- After successful verification, update the UI to reflect the new status
- Refresh the customer list to show updated verification status
- Show a success message to the admin

---

## Transactions Management

### List All Transactions

Get paginated list of all transactions across all customers.

**Endpoint:** `GET /admin/transactions`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Query Parameters:**

- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20
- `userId` (optional): Filter by specific customer ID

**Examples:**

```
GET /admin/transactions
GET /admin/transactions?page=2&limit=50
GET /admin/transactions?userId=507f1f77bcf86cd799439011
```

**Response:**

```json
{
  "transactions": [
    {
      "_id": "transaction-id",
      "userId": {
        "_id": "user-id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "type": "deposit",
      "amount": 500,
      "balanceAfter": 1750.0,
      "description": "Deposit of $500",
      "createdAt": "2024-01-25T09:20:00.000Z",
      "updatedAt": "2024-01-25T09:20:00.000Z"
    },
    {
      "_id": "transaction-id-2",
      "userId": {
        "_id": "user-id",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "type": "withdraw",
      "amount": 250,
      "balanceAfter": 1500.0,
      "description": "Withdrawal of $250",
      "createdAt": "2024-01-Pi24T15:45:00.000Z",
      "updatedAt": "2024-01-24T15:45:00.000Z"
    }
  ],
  "total": 542,
  "totalPages": 28,
  "currentPage": 1
}
```

**Transaction Types:**

- `deposit`: Money added to the account
- `withdraw`: Money removed from the account

**Usage:**

- Display transactions in a table with columns: date, customer name, type, amount, balance after
- Color-code transaction types (green for deposits, red for withdrawals)
- Implement pagination
- Optionally add a filter by customer dropdown
- Sort by `createdAt` (most recent first)

---

## Error Handling

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (not an admin user)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Error Response Format

```json
{
  "message": "Error description here"
}
```

### Handling Token Expiration

When you receive a `401` response:

1. Show a "Session expired" message to the admin
2. Clear the stored access token
3. Redirect to the login page
4. Admin must re-login to continue

---

## Implementation Checklist

### Dashboard Page

- [ ] Fetch and display total users, verified users, total balance, total transactions
- [ ] Implement refresh functionality
- [ ] Show loading states

### Customers Page

- [ ] Display customers in a table
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Show verification status clearly
- [ ] For unverified users: add "View Details" button
- [ ] Display customer details modal/sidebar
- [ ] Add "Verify Device" button for unverified users
- [ ] Show success message after verification
- [ ] Refresh customer list after verification

### Transactions Page

- [ ] Display all transactions in a table
- [ ] Implement pagination
- [ ] Optionally filter by customer
- [ ] Color-code transaction types
- [ ] Format dates and amounts properly

---

## Example API Client Setup

### JavaScript/TypeScript Example

```typescript
const API_BASE_URL = "https://savings-ms-client-api.onrender.com/api/v1";

class AdminAPI {
  private accessToken: string | null = null;

  // Login and store token
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    return data;
  }

  // Make authenticated request
  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      this.accessToken = null;
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  // Admin API methods
  getStats() {
    return this.request("/admin/stats");
  }

  getUsers(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request(`/admin/users?${params}`);
  }

  getUser(userId: string) {
    return this.request(`/admin/users/${userId}`);
  }

  verifyDevice(userId: string) {
    return this.request(`/admin/users/${userId}/verify-device`, {
      method: "POST",
    });
  }

  getTransactions(page = 1, limit = 20, userId?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(userId && { userId }),
    });
    return this.request(`/admin/transactions?${params}`);
  }
}

// Usage
const adminAPI = new AdminAPI();

// Login
await adminAPI.login("admin@example.com", "password");

// Fetch dashboard stats
const stats = await adminAPI.getStats();

// Get customers
const users = await adminAPI.getUsers(1, 20, "john");

// Verify customer
await adminAPI.verifyDevice("user-id");
```

---

## Summary

Your admin panel should implement:

1. **Login Screen**: Authenticate and store access token
2. **Dashboard**: Show statistics using `/admin/stats`
3. **Customers Table**: List users with `/admin/users`, show verification status
4. **Customer Details**: View user details with `/admin/users/:userId`
5. **Verify Device**: Activate accounts with `/admin/users/:userId/verify-device`
6. **Transactions**: Display all transactions with `/admin/transactions`

Remember to:

- Include the access token in all API requests
- Handle token expiration (401 errors)
- Implement loading states and error handling
- Show user-friendly success/error messages

Good luck with your admin panel! 🚀
