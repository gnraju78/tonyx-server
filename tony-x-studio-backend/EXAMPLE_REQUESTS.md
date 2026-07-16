# TonyX Studio API - Example Requests

This file contains cURL examples for testing all API endpoints.

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "photographer"
  }'
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
      "role": "photographer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## User Management

### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Professional photographer specializing in portraits",
    "socialLinks": {
      "instagram": "https://instagram.com/johndoe",
      "facebook": "https://facebook.com/johndoe",
      "twitter": "https://twitter.com/johndoe",
      "website": "https://johndoe.photography"
    }
  }'
```

---

## Gallery Management

### Get Photos
```bash
# Get all photos
curl -X GET "http://localhost:3000/api/gallery/photos" \
  -H "Content-Type: application/json"

# Get photos from specific album
curl -X GET "http://localhost:3000/api/gallery/photos?albumId=ALBUM_ID" \
  -H "Content-Type: application/json"

# Get photos by category
curl -X GET "http://localhost:3000/api/gallery/photos?category=landscape" \
  -H "Content-Type: application/json"

# Paginated results
curl -X GET "http://localhost:3000/api/gallery/photos?limit=10&skip=0" \
  -H "Content-Type: application/json"
```

### Create Photo
```bash
curl -X POST http://localhost:3000/api/gallery/photos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Mountain Sunset",
    "description": "Captured at Golden Hour near the mountains",
    "url": "https://storage.example.com/photo.jpg",
    "category": "landscape",
    "tags": ["sunset", "mountains", "nature", "golden-hour"],
    "albumId": "ALBUM_ID"
  }'
```

### Get Single Photo
```bash
curl -X GET http://localhost:3000/api/gallery/photos/PHOTO_ID \
  -H "Content-Type: application/json"
```

### Update Photo
```bash
curl -X PUT http://localhost:3000/api/gallery/photos/PHOTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["sunset", "mountains", "landscape"]
  }'
```

### Delete Photo
```bash
curl -X DELETE http://localhost:3000/api/gallery/photos/PHOTO_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Albums
```bash
# Get all public albums
curl -X GET "http://localhost:3000/api/gallery/albums" \
  -H "Content-Type: application/json"

# Get albums by photographer
curl -X GET "http://localhost:3000/api/gallery/albums?photographerId=PHOTOGRAPHER_ID" \
  -H "Content-Type: application/json"
```

### Create Album
```bash
curl -X POST http://localhost:3000/api/gallery/albums \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer 2024 Collection",
    "description": "My best summer photos",
    "isPublic": true
  }'
```

### Get Album Details
```bash
curl -X GET http://localhost:3000/api/gallery/albums/ALBUM_ID \
  -H "Content-Type: application/json"
```

### Update Album
```bash
curl -X PUT http://localhost:3000/api/gallery/albums/ALBUM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Album Title",
    "description": "Updated description",
    "isPublic": false
  }'
```

### Delete Album
```bash
curl -X DELETE http://localhost:3000/api/gallery/albums/ALBUM_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Bookings & Sessions

### Get Photography Sessions
```bash
# Get all sessions
curl -X GET "http://localhost:3000/api/bookings/sessions" \
  -H "Content-Type: application/json"

# Get sessions by photographer
curl -X GET "http://localhost:3000/api/bookings/sessions?photographerId=PHOTOGRAPHER_ID" \
  -H "Content-Type: application/json"
```

### Create Photography Session
```bash
curl -X POST http://localhost:3000/api/bookings/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1-Hour Portrait Session",
    "description": "Professional portrait photography session",
    "duration": 60,
    "basePrice": 150,
    "maxBookings": 5
  }'
```

### Get Bookings
```bash
# Get user bookings
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:3000/api/bookings?status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID",
    "scheduledDate": "2024-08-20T14:00:00Z",
    "scheduledTime": "2:00 PM",
    "notes": "Outdoor session, bring casual clothes",
    "location": "Central Park, New York"
  }'
```

### Get Booking Details
```bash
curl -X GET http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Booking
```bash
# Photographer confirms booking
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'

# Client updates location
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Updated Location",
    "notes": "Updated notes"
  }'
```

### Cancel Booking
```bash
curl -X DELETE http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Blog Management

### Get Blog Categories
```bash
curl -X GET "http://localhost:3000/api/blog/categories" \
  -H "Content-Type: application/json"
```

### Create Blog Category
```bash
curl -X POST http://localhost:3000/api/blog/categories \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Photography Tips",
    "slug": "photography-tips",
    "description": "Tips and tricks for better photography"
  }'
```

### Get Blog Posts
```bash
# Get published posts
curl -X GET "http://localhost:3000/api/blog/posts" \
  -H "Content-Type: application/json"

# Get posts by category
curl -X GET "http://localhost:3000/api/blog/posts?categoryId=CATEGORY_ID" \
  -H "Content-Type: application/json"

# Get posts by tag
curl -X GET "http://localhost:3000/api/blog/posts?tag=photography" \
  -H "Content-Type: application/json"
```

### Create Blog Post
```bash
curl -X POST http://localhost:3000/api/blog/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "10 Tips for Better Photography",
    "slug": "10-tips-for-better-photography",
    "content": "# Photography Tips\n\nHere are 10 essential tips...",
    "excerpt": "Learn how to improve your photography with these 10 tips",
    "categoryId": "CATEGORY_ID",
    "tags": ["photography", "tips", "beginner"],
    "status": "draft"
  }'
```

### Get Blog Post
```bash
curl -X GET http://localhost:3000/api/blog/posts/POST_ID \
  -H "Content-Type: application/json"
```

### Update Blog Post
```bash
curl -X PUT http://localhost:3000/api/blog/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "status": "published"
  }'
```

### Delete Blog Post
```bash
curl -X DELETE http://localhost:3000/api/blog/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Blog Comments
```bash
curl -X GET "http://localhost:3000/api/blog/comments?postId=POST_ID" \
  -H "Content-Type: application/json"
```

### Create Blog Comment
```bash
curl -X POST "http://localhost:3000/api/blog/comments?postId=POST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great article! Very helpful and informative.",
    "parentCommentId": "COMMENT_ID"
  }'
```

---

## Services

### Get Services
```bash
# Get all services
curl -X GET "http://localhost:3000/api/services" \
  -H "Content-Type: application/json"

# Get services by photographer
curl -X GET "http://localhost:3000/api/services?photographerId=PHOTOGRAPHER_ID" \
  -H "Content-Type: application/json"

# Get services by category
curl -X GET "http://localhost:3000/api/services?category=weddings" \
  -H "Content-Type: application/json"
```

### Create Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wedding Photography Package",
    "description": "Full-day wedding photography with 2 photographers",
    "category": "weddings",
    "basePrice": 2500,
    "pricePerHour": 250
  }'
```

---

## Reviews & Ratings

### Get Reviews
```bash
curl -X GET "http://localhost:3000/api/reviews?photographerId=PHOTOGRAPHER_ID" \
  -H "Content-Type: application/json"

# Get pending reviews (admin)
curl -X GET "http://localhost:3000/api/reviews?photographerId=PHOTOGRAPHER_ID&status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Create Review
```bash
curl -X POST "http://localhost:3000/api/reviews?photographerId=PHOTOGRAPHER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excellent photographer!",
    "comment": "Had a wonderful experience. The photographer was professional and delivered amazing results.",
    "bookingId": "BOOKING_ID"
  }'
```

---

## Notifications

### Get Notifications
```bash
# Get all notifications
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get unread notifications only
curl -X GET "http://localhost:3000/api/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Notification
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_ID",
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your booking has been confirmed by the photographer",
    "actionUrl": "/bookings/BOOKING_ID"
  }'
```

### Mark Notification as Read
```bash
curl -X PATCH http://localhost:3000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "isRead": true
  }'
```

### Delete Notification
```bash
curl -X DELETE http://localhost:3000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Admin Features

### Get Analytics
```bash
curl -X GET http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Get All Users
```bash
curl -X GET "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by role
curl -X GET "http://localhost:3000/api/admin/users?role=photographer" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:3000/api/admin/users?status=suspended" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Search users
curl -X GET "http://localhost:3000/api/admin/users?search=john" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Update User
```bash
curl -X PATCH http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "status": "suspended",
    "role": "photographer"
  }'
```

### Get Moderation Queue
```bash
curl -X GET "http://localhost:3000/api/admin/moderation" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Get specific type
curl -X GET "http://localhost:3000/api/admin/moderation?type=comment" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Moderate Content
```bash
# Approve comment
curl -X PATCH http://localhost:3000/api/admin/moderation \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "comment",
    "contentId": "COMMENT_ID",
    "action": "approve"
  }'

# Reject review
curl -X PATCH http://localhost:3000/api/admin/moderation \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "review",
    "contentId": "REVIEW_ID",
    "action": "reject",
    "rejectionReason": "Inappropriate content"
  }'

# Delete post
curl -X PATCH http://localhost:3000/api/admin/moderation \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "POST_ID",
    "action": "delete"
  }'
```

---

## Testing Tips

1. **Save Token**: After login, save the token and use it for authenticated requests:
   ```bash
   TOKEN=$(curl -s -X POST ... | jq -r '.data.token')
   curl -H "Authorization: Bearer $TOKEN" ...
   ```

2. **Pretty Print JSON**: Use `jq` to format responses:
   ```bash
   curl ... | jq '.'
   ```

3. **Test in Postman**:
   - Import these endpoints into Postman
   - Use environment variables for TOKEN
   - Create test collections

4. **Debug Errors**: Check the error message for validation details:
   ```json
   {
     "success": false,
     "message": "Validation failed",
     "errors": {
       "email": ["Invalid email address"]
     }
   }
   ```

---

## Common Scenarios

### Scenario 1: Register and Get Profile
```bash
# 1. Register
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{...}')

# 2. Extract token
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 3. Get profile
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Create Album and Upload Photos
```bash
# 1. Create album
ALBUM=$(curl -s -X POST http://localhost:3000/api/gallery/albums \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}')

ALBUM_ID=$(echo $ALBUM | jq -r '.data._id')

# 2. Upload photos to album
curl -X POST http://localhost:3000/api/gallery/photos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Photo 1\",
    \"url\": \"https://...\",
    \"category\": \"portrait\",
    \"albumId\": \"$ALBUM_ID\"
  }"
```

---

For more details, see API_DOCUMENTATION.md
