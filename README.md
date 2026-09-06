# RentNest Frontend

RentNest is a modern rental property marketplace connecting tenants and
landlords. This repository contains the frontend application built with
Next.js and TypeScript.

## Live Website

**Frontend:** https://rentnest-frontend-sigma.vercel.app

**Backend API:** https://rent-nest-backend-beryl.vercel.app/api

## Features

### Public

-   Browse available rental properties
-   View property details
-   Search by title or location
-   Filter properties
-   View amenities and landlord information
-   View tenant reviews and ratings
-   Property pagination
-   Responsive interface

### Tenant

-   Registration and login
-   Request to rent properties
-   Select preferred move-in date
-   Track rental request status
-   Stripe rental payments
-   Payment and rental history
-   Submit and view reviews
-   Tenant dashboard

### Landlord

-   Registration and login
-   Landlord dashboard
-   Add, edit, and delete properties
-   View tenant rental requests
-   Approve or reject rental requests
-   Manage property listings

### Admin

-   Admin dashboard
-   View platform statistics
-   Manage users
-   Block and unblock users
-   View properties and rentals
-   Monitor rental activity and revenue

## Role-Based Access Control

  Role       Access
  ---------- ----------------------------------------------------
  Tenant     Rental requests, payments, rental history, reviews
  Landlord   Property and rental request management
  Admin      Platform, user, property, and rental management

Protected routes are controlled according to the authenticated user's
role.

## Tech Stack

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Axios
-   Lucide React
-   React Hot Toast
-   js-cookie
-   Stripe Checkout
-   Vercel

## Authentication

The frontend uses JWT-based authentication. Authentication data is
stored in cookies and Axios interceptors attach the access token to
protected API requests.

Role-based dashboard routes:

``` text
/tenant
/landlord
/admin
```

## Property Types

``` text
APARTMENT
HOUSE
STUDIO
VILLA
OFFICE
```

## Rental Workflow

``` text
Tenant
  ↓
Browse Properties
  ↓
View Property Details
  ↓
Request to Rent
  ↓
Select Move-in Date
  ↓
Landlord Approves / Rejects
  ↓
Tenant Makes Payment
  ↓
Rental Becomes Active
  ↓
Tenant Can Submit Review
```

Rental statuses:

``` text
PENDING
APPROVED
REJECTED
ACTIVE
COMPLETED
```

## Payment Integration

RentNest uses Stripe Checkout for rental payments.

Payment statuses:

``` text
PENDING
COMPLETED
FAILED
REFUNDED
```

## Project Structure

``` text
rentnest-frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (public)/
│   ├── payment/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── context/
├── hooks/
├── lib/
├── providers/
├── public/
├── proxy.ts
├── package.json
└── README.md
```

## Environment Variables

Create `.env.local` in the project root:

``` env
NEXT_PUBLIC_API_URL=https://rent-nest-backend-beryl.vercel.app/api
```

## Getting Started

``` bash
git clone <frontend-repository-url>
cd rentnest-frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

``` bash
npm run lint
npm run build
npm start
```

## Deployment

The frontend is deployed on Vercel.

Production URL:

``` text
https://rentnest-frontend-sigma.vercel.app
```

Configure this environment variable in Vercel:

``` env
NEXT_PUBLIC_API_URL=https://rent-nest-backend-beryl.vercel.app/api
```

## Backend Repository

https://github.com/Tanzeem74/RentNest-Backend

## API Integration

``` text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh-token

GET    /properties
GET    /properties/:id

POST   /rentals
GET    /rentals
GET    /rentals/:id

POST   /payments/create
POST   /payments/confirm
GET    /payments

POST   /reviews
GET    /reviews/my
GET    /reviews/property/:propertyId

POST   /landlord/properties
PATCH  /landlord/properties/:id
DELETE /landlord/properties/:id
GET    /landlord/requests
PATCH  /landlord/requests/:id

GET    /admin/users
PATCH  /admin/users/:id
GET    /admin/properties
GET    /admin/rentals
GET    /admin/dashboard
```

## Author

**Shah Tanzeem Afsar**

Computer Science & Engineering

GitHub: https://github.com/Tanzeem74

## License

This project was developed for educational and academic purposes.
