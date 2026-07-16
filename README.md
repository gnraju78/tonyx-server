# TonyX Backend API

Professional barber shop booking and management system API built with Express.js and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Architecture](#architecture)

## Features

✓ User Authentication (Register, Login, JWT)
✓ Role-based Authorization (Customer, Barber, Manager, Admin)
✓ Service Management
✓ Booking Management
✓ Payment Processing
✓ Review & Rating System
✓ Availability Management
✓ Real-time Notifications
✓ Promotion/Discount System
✓ Barber Profiles & Ratings
✓ Advanced Search & Filtering

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with jwt-simple
- **Password Hashing**: bcryptjs
- **Image Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi & express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Data Sanitization**: mongo-sanitize, xss-clean

## Project Structure

```
tonyx-backend/
├── config/
│   └── index.js                 # Configuration management
├── src/
│   ├── controllers/             # Request handlers
│   │   ├── AuthController.js
│   │   ├── BookingController.js
│   │   └── ServiceController.js
│   ├── models/                  # MongoDB schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Notification.js
│   │   ├── Promotion.js
│   │   ├── TimeSlot.js
│   │   └── Location.js
│   ├── repositories/            # Data access layer
│   │   ├── BaseRepository.js
│   │   ├── UserRepository.js
│   │   ├── ServiceRepository.js
│   │   ├── BookingRepository.js
│   │   └── PaymentRepository.js
│   ├── services/                # Business logic layer
│   │   ├── AuthService.js
│   │   └── BookingService.js
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/                   # Utility functions
│   │   ├── AppError.js
│   │   ├── response.js
│   │   ├── pagination.js
│   │   └── database.js
│   ├── app.js                   # Express app setup
│   └── index.js                 # Server entry point
├── public/
│   └── uploads/                 # Uploaded files
├── logs/                        # Log files
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB
- Cloudinary account (for image uploads)
- Email service (Gmail or similar)

### Steps

1. **Clone or navigate to the project directory**

```bash
cd tonyx-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Copy environment file**

```bash
cp .env.example .env
```

## Configuration

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=5000
PROTOCOL=http
HOST=localhost

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tonyx

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start at `http://localhost:5000`

### Health Check

```bash
curl http://localhost:5000/health
```

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/v1/auth/register
Body: {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
  role?: 'customer' | 'barber' | 'manager' | 'admin'
}
```

#### Login
```
POST /api/v1/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: {...},
  token: string
}
```

#### Get Profile
```
GET /api/v1/auth/profile
Headers: Authorization: Bearer {token}
```

### Services Endpoints

#### Get All Services
```
GET /api/v1/services
Query: ?page=1&limit=10&sort=-createdAt
```

#### Get Services by Category
```
GET /api/v1/services/category/:category
```

#### Search Services
```
GET /api/v1/services/search?term=haircut
```

#### Get Popular Services
```
GET /api/v1/services/popular?limit=10
```

#### Create Service (Admin/Manager only)
```
POST /api/v1/services
Body: {
  name: string,
  description: string,
  category: string,
  basePrice: number,
  duration: number,
  ...
}
```

### Booking Endpoints

#### Create Booking
```
POST /api/v1/bookings
Headers: Authorization: Bearer {token}
Body: {
  barberId: string,
  serviceIds: string[],
  scheduledDate: date,
  startTime: string,
  endTime: string,
  notes?: string
}
```

#### Get My Bookings
```
GET /api/v1/bookings/my-bookings
Query: ?page=1&limit=10&status=pending
Headers: Authorization: Bearer {token}
```

#### Get Barber Bookings
```
GET /api/v1/bookings/barber/my-bookings
Headers: Authorization: Bearer {token}
```

#### Cancel Booking
```
PUT /api/v1/bookings/:id/cancel
Body: { reason: string }
```

#### Reschedule Booking
```
PUT /api/v1/bookings/:id/reschedule
Body: {
  newDate: date,
  newStartTime: string,
  newEndTime: string
}
```

## Database Models

### User
- firstName, lastName
- email, phone
- password (hashed)
- role (customer, barber, manager, admin)
- profileImage
- rating (average, count)
- availability
- specialization
- totalEarnings

### Service
- name, description
- category
- basePrice, duration
- image
- barberSpecialists
- requirements
- popularity
- tags

### Booking
- bookingNumber
- customer, barber
- services
- scheduledDate, startTime, endTime
- totalPrice, totalDuration
- status (pending, confirmed, in-progress, completed, cancelled)
- payment info
- rating & review
- location

### Payment
- transactionId
- booking reference
- payer, payee
- amount, method
- status (pending, processing, completed, failed, refunded)
- gateway info

### Review
- booking reference
- reviewer, reviewee
- rating, title, comment
- aspect ratings (professionalism, cleanliness, etc.)
- images, responses

### Notification
- recipient
- type (booking_confirmed, payment_received, etc.)
- title, message
- channels (inApp, email, sms)
- priority
- read status

## Architecture

### Pattern: MVC with Repository Pattern

**Model Layer**: Mongoose schemas with validation
**Repository Layer**: Data access abstraction (CRUD operations)
**Service Layer**: Business logic and validations
**Controller Layer**: Request/response handling
**Route Layer**: API endpoint definitions

### Error Handling

Custom `AppError` class with:
- HTTP status codes
- Operational vs non-operational errors
- Consistent error responses

### Security Features

- JWT authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Rate limiting
- CORS configuration
- Data sanitization (NoSQL injection prevention)
- XSS protection
- Input validation with Joi

### Performance

- Database indexes on frequently queried fields
- Pagination support
- Query optimization
- Aggregation pipelines for complex queries

## Best Practices Applied

✓ Async/await throughout codebase
✓ Separation of concerns
✓ DRY (Don't Repeat Yourself)
✓ SOLID principles
✓ Consistent error handling
✓ Comprehensive validation
✓ Security best practices
✓ Database indexing
✓ Pagination for list endpoints
✓ RESTful API design

## Environment Variables

Create a `.env` file in the root directory with all variables from `.env.example`

## License

MIT

## Author

TonyX Studio Development Team
