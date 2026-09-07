# API Integration Documentation

This document maps the RentNest frontend pages and features to the backend API endpoints they consume.

## API Base URL

```env
NEXT_PUBLIC_API_URL=https://rent-nest-backend-beryl.vercel.app/api
```

All frontend API requests use this base URL.

## Authentication

### Login Page

**Frontend:** `/login`

```http
POST /auth/login
```

Authenticates TENANT, LANDLORD, and ADMIN users and returns access and refresh tokens.

### Register Page

**Frontend:** `/register`

```http
POST /auth/register
```

Creates a new user account.

### Refresh Token

```http
POST /auth/refresh-token
```

Refreshes the access token using the refresh token.

## Public Property Features

### Properties Listing

**Frontend:** `/properties`

```http
GET /properties
```

Used for property listing, search, filtering, and pagination.

### Property Details

**Frontend:** `/properties/[id]`

```http
GET /properties/:id
```

Loads the selected property's full details, including title, description, location, rent, rooms, type, status, images, amenities, category, and landlord information.

### Public Property Reviews

**Frontend:** `/properties/[id]`

```http
GET /reviews/property/:propertyId
```

Loads public reviews and ratings for the selected property.

## Tenant Features

### Tenant Dashboard

**Frontend:** `/tenant`

```http
GET /rentals
GET /payments
GET /reviews/my
```

Loads rental requests/history, payment history, and the tenant's submitted reviews.

### Submit Rental Request

**Frontend:** `/properties/[id]/request`

```http
POST /rentals
```

Request body:

```json
{
  "propertyId": "PROPERTY_ID",
  "requestedMoveInDate": "YYYY-MM-DD"
}
```

Allows a tenant to request a property for rent.

### Rental Details

```http
GET /rentals/:id
```

Loads a specific rental request.

## Payment Integration

RentNest uses Stripe Checkout.

### Create Checkout Session

**Frontend:** Tenant payment action

```http
POST /payments/create
```

Request body:

```json
{
  "rentalRequestId": "RENTAL_REQUEST_ID",
  "provider": "STRIPE"
}
```

Creates a Stripe Checkout session and returns the checkout URL.

### Confirm Payment

**Frontend:** `/payment/success`

```http
POST /payments/confirm
```

Confirms payment after Stripe redirects the user back to the frontend.

### Payment History

**Frontend:** `/tenant`

```http
GET /payments
```

Loads payment history.

### Payment Details

```http
GET /payments/:id
```

Loads a specific payment.

### Payment Success Page

**Frontend:** `/payment/success`

Handles successful Stripe redirects and payment confirmation.

### Payment Cancel Page

**Frontend:** `/payment/cancel`

Handles canceled Stripe Checkout redirects and displays cancellation feedback.

## Reviews

### Submit Review

**Frontend:** `/tenant/requests/[id]/review`

```http
POST /reviews
```

Request body:

```json
{
  "propertyId": "PROPERTY_ID",
  "rating": 5,
  "comment": "Review comment"
}
```

Allows eligible tenants to review a rented property.

### My Reviews

**Frontend:** `/tenant`

```http
GET /reviews/my
```

Loads reviews submitted by the authenticated tenant.

### Property Reviews

**Frontend:** `/properties/[id]`

```http
GET /reviews/property/:propertyId
```

Displays reviews associated with a property.

## Landlord Features

### Add Property

**Frontend:** `/landlord/properties/new`

```http
POST /landlord/properties
```

Creates a new rental property.

### Edit Property

**Frontend:** `/landlord/properties/[id]/edit`

```http
PATCH /landlord/properties/:id
```

Updates an existing property.

### Delete Property

**Frontend:** `/landlord`

```http
DELETE /landlord/properties/:id
```

Deletes a landlord-owned property.

### View Rental Requests

**Frontend:** `/landlord`

```http
GET /landlord/requests
```

Loads rental requests for the landlord's properties.

### Approve or Reject Request

**Frontend:** `/landlord`

```http
PATCH /landlord/requests/:id
```

Updates a rental request status, including APPROVED or REJECTED.

## Admin Features

### Admin Dashboard

**Frontend:** `/admin`

```http
GET /admin/dashboard
```

Loads platform statistics and overview data.

### User Management

**Frontend:** `/admin`

```http
GET /admin/users
PATCH /admin/users/:id
```

Loads users and updates user status, including block/unblock actions.

### Property Monitoring

**Frontend:** `/admin`

```http
GET /admin/properties
```

Loads properties for administrative monitoring.

### Rental Monitoring

**Frontend:** `/admin`

```http
GET /admin/rentals
```

Loads rental activity for administrators.

## Categories

```http
GET /categories
GET /categories/:id
```

Used where property category data is required.

## API Client

The frontend uses Axios through:

```text
lib/api-client.ts
```

Base URL:

```ts
baseURL: process.env.NEXT_PUBLIC_API_URL
```

Authenticated API requests include:

```http
Authorization: Bearer <accessToken>
```

If an authenticated request returns `401 Unauthorized`, the frontend clears authentication data and redirects the user to `/login`.

## UI Error Handling

API errors are presented through user-facing feedback such as:

- `react-hot-toast` success/error notifications
- Form validation messages
- Loading/submitting states
- Disabled buttons during requests
- Authentication redirects
- Fallback messages when API data is unavailable

## Role-Based API Access

| Role | Main API Access |
| --- | --- |
| Public | Properties and property reviews |
| Tenant | Rentals, payments, reviews |
| Landlord | Property management and rental requests |
| Admin | Dashboard, users, properties, rentals |

## Endpoint Summary

```text
AUTH
POST   /auth/register
POST   /auth/login
POST   /auth/refresh-token

PROPERTIES
GET    /properties
GET    /properties/:id

RENTALS
POST   /rentals
GET    /rentals
GET    /rentals/:id

PAYMENTS
POST   /payments/create
POST   /payments/confirm
GET    /payments
GET    /payments/:id

REVIEWS
POST   /reviews
GET    /reviews/my
GET    /reviews/property/:propertyId

LANDLORD
POST   /landlord/properties
PATCH  /landlord/properties/:id
DELETE /landlord/properties/:id
GET    /landlord/requests
PATCH  /landlord/requests/:id

ADMIN
GET    /admin/users
PATCH  /admin/users/:id
GET    /admin/properties
GET    /admin/rentals
GET    /admin/dashboard

CATEGORIES
GET    /categories
GET    /categories/:id
```

## Backend

Repository:

https://github.com/Tanzeem74/RentNest-Backend

API:

https://rent-nest-backend-beryl.vercel.app/api
