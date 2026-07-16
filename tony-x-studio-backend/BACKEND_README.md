# TonyX Studio Backend

A comprehensive, production-ready REST API backend for a professional photography platform built with Next.js 16, MongoDB, and TypeScript.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- User roles (user, photographer, admin)
- Password hashing with bcryptjs
- Protected routes with middleware

### 📸 Gallery Management
- Photo uploads with metadata (EXIF data support)
- Album creation and management
- Collections for organizing albums
- Public/private visibility controls
- Photo likes and view tracking

### 📅 Bookings & Sessions
- Photography session creation
- Booking management with status tracking
- Availability scheduling
- Payment integration ready
- Client-photographer communication

### 📝 Blog System
- Blog post creation with rich content
- Category management
- Comment system with threaded replies
- SEO-friendly slugs
- Draft/Published/Archived status

### ⭐ Reviews & Ratings
- 5-star rating system
- Review management with approval workflow
- Rating aggregation and distribution
- Photographer performance analytics

### 🔔 Notifications
- Real-time notification support
- Multiple notification types (booking, review, message, payment, system)
- Notification read status tracking
- Auto-deletion after 90 days

### 👤 User Management
- User profiles with social links
- Phone and email verification
- Profile preferences
- Admin user management dashboard

### 📊 Admin Dashboard
- Analytics and reporting
- User management
- Content moderation
- Performance metrics
- Revenue tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod + Joi
- **Password Hashing**: bcryptjs
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Email**: Nodemailer
- **Rate Limiting**: rate-limiter-flexible
- **API Format**: RESTful JSON

## Installation

### Prerequisites
- Node.js 18+ (with pnpm)
- MongoDB 5.0+ (local or Atlas)

### Setup Steps

1. **Clone or copy the project files**
   ```bash
   cd /path/to/tonyx-studio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create environment configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tonyx-studio
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   REFRESH_TOKEN_EXPIRE=30d
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_FROM=noreply@tonyx-studio.com
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

   API is available at: `http://localhost:3000/api`

## Project Structure

```
├── app/
│   └── api/
│       ├── auth/                 # Authentication endpoints
│       │   ├── login/
│       │   └── register/
│       ├── users/                # User management
│       │   └── profile/
│       ├── gallery/              # Photo/Album management
│       │   ├── photos/
│       │   └── albums/
│       ├── bookings/             # Session/Booking management
│       │   ├── sessions/
│       │   └── [id]/
│       ├── blog/                 # Blog system
│       │   ├── posts/
│       │   ├── categories/
│       │   └── comments/
│       ├── services/             # Services management
│       ├── reviews/              # Reviews & ratings
│       ├── notifications/        # Notifications
│       └── admin/                # Admin features
│           ├── analytics/
│           ├── users/
│           └── moderation/
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Gallery.ts
│   │   ├── Booking.ts
│   │   ├── Blog.ts
│   │   ├── Services.ts
│   │   └── Notification.ts
│   ├── auth.ts                  # JWT utilities
│   ├── apiResponse.ts           # Response helpers
│   └── validations.ts           # Input validation schemas
├── public/                       # Static assets
├── API_DOCUMENTATION.md         # API documentation
└── BACKEND_README.md           # This file
```

## Database Schema

### Collections

#### Users
- Authentication credentials
- Profile information
- Social links
- Preferences

#### Photos
- Photo metadata
- Gallery associations
- Views and likes tracking

#### Albums & Collections
- Organize photos
- Visibility controls
- Cover images

#### PhotographySessions & Bookings
- Session details
- Booking requests
- Availability tracking
- Payment information

#### BlogPosts, Categories & Comments
- Blog content management
- Comment threads
- Publication workflow

#### Services
- Service offerings
- Pricing tiers
- Service packages

#### Reviews
- 5-star ratings
- Review text
- Review statistics

#### Notifications
- User notifications
- Notification types
- Read/Unread status

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Gallery
- `GET /api/gallery/photos` - List photos
- `POST /api/gallery/photos` - Create photo
- `GET /api/gallery/photos/:id` - Get photo
- `PUT /api/gallery/photos/:id` - Update photo
- `DELETE /api/gallery/photos/:id` - Delete photo
- `GET /api/gallery/albums` - List albums
- `POST /api/gallery/albums` - Create album

### Bookings
- `GET /api/bookings/sessions` - List sessions
- `POST /api/bookings/sessions` - Create session
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking

### Blog
- `GET /api/blog/categories` - List categories
- `POST /api/blog/categories` - Create category
- `GET /api/blog/posts` - List posts
- `POST /api/blog/posts` - Create post
- `GET /api/blog/comments` - List comments
- `POST /api/blog/comments` - Create comment

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users` - Update user
- `GET /api/admin/moderation` - Get moderation queue
- `PATCH /api/admin/moderation` - Moderate content

See `API_DOCUMENTATION.md` for detailed endpoint documentation.

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register a new user or login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

2. Use the returned `token` in subsequent requests

## Validation

All endpoints use Zod schemas for input validation. Invalid requests return 400 with validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": { }
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Pagination

List endpoints support pagination:
- `limit` - Results per page (default: 50, max: 100)
- `skip` - Results to skip (default: 0)

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb://localhost:27017/tonyx-studio` |
| JWT_SECRET | Secret key for JWT signing | Generate with: `openssl rand -base64 32` |
| JWT_EXPIRE | JWT expiration time | `7d` |
| REFRESH_TOKEN_EXPIRE | Refresh token expiration | `30d` |
| MAIL_HOST | SMTP host | `smtp.gmail.com` |
| MAIL_PORT | SMTP port | `587` |
| MAIL_USER | Email address | `your-email@gmail.com` |
| MAIL_PASSWORD | Email password/app-password | Your app-specific password |
| MAIL_FROM | From email | `noreply@tonyx-studio.com` |
| FRONTEND_URL | Frontend URL for CORS | `http://localhost:3000` |
| NODE_ENV | Environment | `development` or `production` |

## Security Considerations

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Input validation with Zod
- ✅ Authorization checks on protected routes
- ✅ CORS configuration ready
- ✅ Environment variable isolation
- ⚠️ Rate limiting recommended for production
- ⚠️ HTTPS required in production
- ⚠️ Keep JWT_SECRET strong and unique

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Setup for Production
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<production-mongodb-uri>
FRONTEND_URL=https://yourdomain.com
```

## API Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <your_token>"
```

### Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3000/api`
3. Add token to Authorization header
4. Test endpoints

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env.local`
- Verify database credentials

### JWT Authentication Error
- Ensure JWT_SECRET is set in `.env.local`
- Token may have expired (set higher JWT_EXPIRE)
- Include "Bearer " prefix in Authorization header

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Contributing

1. Create feature branch
2. Make changes
3. Test endpoints
4. Commit with clear messages
5. Push to repository

## License

Proprietary - TonyX Studio

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review error messages and logs
3. Check environment variables
4. Verify MongoDB connection

---

**Built with ❤️ using Next.js, MongoDB & TypeScript**
