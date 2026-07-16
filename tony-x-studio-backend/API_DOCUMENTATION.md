# TonyX Studio Backend API Documentation

## Overview

Complete REST API for the TonyX Studio photography platform. All endpoints follow RESTful conventions with JSON request/response format.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* validation errors if any */ }
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "role": "user" // or "photographer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65abc123...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as Register (with token and refreshToken)

---

## User Endpoints

### Get Profile
**GET** `/users/profile`

Retrieve authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profileImage": "https://...",
    "bio": "Professional photographer",
    "role": "photographer",
    "status": "active",
    "socialLinks": {
      "instagram": "https://instagram.com/john",
      "facebook": "https://facebook.com/john"
    }
  }
}
```

### Update Profile
**PUT** `/users/profile`

Update authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Professional photographer",
  "socialLinks": {
    "instagram": "https://instagram.com/john",
    "facebook": "https://facebook.com/john"
  }
}
```

---

## Gallery Endpoints

### Get Photos
**GET** `/gallery/photos`

Retrieve all photos with optional filtering.

**Query Parameters:**
- `albumId` (optional): Filter by album
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 50, max: 100)
- `skip` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "_id": "65abc123...",
        "title": "Beautiful Sunset",
        "url": "https://...",
        "category": "landscape",
        "tags": ["sunset", "nature"],
        "views": 150,
        "likes": 25,
        "photographer": {
          "id": "65def456...",
          "firstName": "Jane",
          "lastName": "Smith",
          "profileImage": "https://..."
        }
      }
    ],
    "pagination": {
      "total": 250,
      "limit": 50,
      "skip": 0
    }
  }
}
```

### Create Photo
**POST** `/gallery/photos`

Upload and create a new photo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Beautiful Sunset",
  "description": "Captured at the beach",
  "url": "https://storage.example.com/photo.jpg",
  "category": "landscape",
  "tags": ["sunset", "nature"],
  "albumId": "65abc123..." // optional
}
```

### Get Photo
**GET** `/gallery/photos/:id`

Retrieve a single photo by ID.

### Update Photo
**PUT** `/gallery/photos/:id`

Update a photo (photographer only).

**Headers:**
```
Authorization: Bearer <token>
```

### Delete Photo
**DELETE** `/gallery/photos/:id`

Delete a photo (photographer only).

**Headers:**
```
Authorization: Bearer <token>
```

---

### Get Albums
**GET** `/gallery/albums`

Retrieve all public albums.

**Query Parameters:**
- `photographerId` (optional): Filter by photographer
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Album
**POST** `/gallery/albums`

Create a new album (authenticated users).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Summer 2024",
  "description": "Summer vacation photos",
  "isPublic": true
}
```

### Get Album
**GET** `/gallery/albums/:id`

Retrieve album details with photos.

### Update Album
**PUT** `/gallery/albums/:id`

Update album (owner only).

### Delete Album
**DELETE** `/gallery/albums/:id`

Delete album (owner only).

---

## Bookings Endpoints

### Get Photography Sessions
**GET** `/bookings/sessions`

Retrieve available photography sessions.

**Query Parameters:**
- `photographerId` (optional): Filter by photographer
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Photography Session
**POST** `/bookings/sessions`

Create a new photography session (photographers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Professional Portrait Session",
  "description": "1-hour professional portrait photography",
  "duration": 60,
  "basePrice": 150,
  "maxBookings": 5
}
```

### Get Bookings
**GET** `/bookings`

Retrieve user's bookings (as client or photographer).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Booking
**POST** `/bookings`

Create a new booking request.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sessionId": "65abc123...",
  "scheduledDate": "2024-08-15T10:00:00Z",
  "scheduledTime": "10:00 AM",
  "notes": "Please bring casual clothes",
  "location": "Central Park, NYC"
}
```

### Get Booking
**GET** `/bookings/:id`

Retrieve booking details.

**Headers:**
```
Authorization: Bearer <token>
```

### Update Booking
**PUT** `/bookings/:id`

Update booking (photographer can update status, client can update notes/location).

**Headers:**
```
Authorization: Bearer <token>
```

### Cancel Booking
**DELETE** `/bookings/:id`

Cancel a booking (client only, cannot cancel completed bookings).

---

## Blog Endpoints

### Get Blog Categories
**GET** `/blog/categories`

Retrieve all blog categories.

### Create Blog Category
**POST** `/blog/categories`

Create a new category (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Photography Tips",
  "slug": "photography-tips",
  "description": "Tips and tricks for better photography"
}
```

### Get Blog Posts
**GET** `/blog/posts`

Retrieve published blog posts.

**Query Parameters:**
- `status` (optional): Filter by status (default: published)
- `categoryId` (optional): Filter by category
- `tag` (optional): Filter by tag
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Blog Post
**POST** `/blog/posts`

Create a new blog post (photographers/admins).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "10 Tips for Better Photography",
  "slug": "10-tips-for-better-photography",
  "content": "Detailed article content...",
  "excerpt": "Quick summary of the article",
  "categoryId": "65abc123...",
  "tags": ["photography", "tips", "beginner"],
  "status": "draft" // or "published"
}
```

### Get Blog Post
**GET** `/blog/posts/:id`

Retrieve a single blog post with comments.

### Update Blog Post
**PUT** `/blog/posts/:id`

Update blog post (author/admin only).

### Delete Blog Post
**DELETE** `/blog/posts/:id`

Delete blog post (author/admin only).

---

### Get Blog Comments
**GET** `/blog/comments?postId=:postId`

Retrieve approved comments for a post.

### Create Blog Comment
**POST** `/blog/comments?postId=:postId`

Add a comment to a blog post.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Great article! Very helpful.",
  "parentCommentId": "65abc123..." // optional, for replies
}
```

---

## Services Endpoints

### Get Services
**GET** `/services`

Retrieve all active services.

**Query Parameters:**
- `photographerId` (optional): Filter by photographer
- `category` (optional): Filter by category
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Service
**POST** `/services`

Create a new service (photographers only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Wedding Photography",
  "description": "Full-day wedding photography service",
  "category": "weddings",
  "basePrice": 2000,
  "pricePerHour": 250
}
```

---

## Reviews Endpoints

### Get Reviews
**GET** `/reviews?photographerId=:photographerId`

Retrieve reviews for a photographer.

**Query Parameters:**
- `photographerId` (required): Photographer to get reviews for
- `status` (optional): Filter by status (default: approved)
- `limit` (optional): Results per page
- `skip` (optional): Results offset

### Create Review
**POST** `/reviews?photographerId=:photographerId`

Leave a review for a photographer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent photographer!",
  "comment": "Wonderful experience, highly recommended",
  "bookingId": "65abc123..." // optional
}
```

---

## Notifications Endpoints

### Get Notifications
**GET** `/notifications`

Retrieve user's notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `isRead` (optional): Filter by read status (true/false)
- `limit` (optional): Results per page
- `skip` (optional): Results offset

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "65abc123...",
        "type": "booking",
        "title": "Booking Confirmed",
        "message": "Your booking has been confirmed",
        "isRead": false,
        "createdAt": "2024-08-10T15:30:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### Create Notification
**POST** `/notifications`

Create a new notification (system/admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recipientId": "65abc123...",
  "type": "booking",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed",
  "actionUrl": "/bookings/65def456..."
}
```

### Mark Notification as Read
**PATCH** `/notifications/:id`

Mark a notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isRead": true
}
```

### Delete Notification
**DELETE** `/notifications/:id`

Delete a notification.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters or validation failed |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks permissions for this action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Check response headers for rate limit info.

## Pagination

All list endpoints support pagination with `limit` and `skip` query parameters:
- `limit`: Number of results per page (default: 50, max: 100)
- `skip`: Number of results to skip (default: 0)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 250,
    "limit": 50,
    "skip": 0
  }
}
```

---

## Environment Variables

Create a `.env.local` file with:
```
MONGODB_URI=mongodb://localhost:27017/tonyx-studio
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
```

---

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up MongoDB connection

3. Configure environment variables in `.env.local`

4. Run development server:
```bash
pnpm dev
```

5. API available at `http://localhost:3000/api`

---

For more information or support, visit the project documentation.
