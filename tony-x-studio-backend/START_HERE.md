# 🚀 START HERE - TonyX Studio Backend

Welcome! Your complete photography platform backend is ready to use.

## ⚡ Quick Start (3 Minutes)

### Step 1: Set Up MongoDB Connection
Edit `.env.local` and set your MongoDB URI:
```env
MONGODB_URI=mongodb://localhost:27017/tonyx-studio
JWT_SECRET=generate-a-random-string-here
```

> 💡 **Generate JWT Secret**: `openssl rand -base64 32`

### Step 2: Start Development Server
```bash
cd /vercel/share/v0-project
pnpm install  # (if not already done)
pnpm dev
```

### Step 3: Test an Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

✅ **Done!** Your API is running!

---

## 📚 Documentation Guide

### 1. **PROJECT_OVERVIEW.md** ← Start here for architecture
   - Project structure
   - Technology stack
   - Feature overview
   - Deployment options

### 2. **API_DOCUMENTATION.md** ← Complete API reference
   - All 21+ endpoints
   - Request/response examples
   - Error codes
   - Authentication details

### 3. **BACKEND_README.md** ← Setup and deployment
   - Installation steps
   - Configuration guide
   - Troubleshooting
   - Production deployment

### 4. **EXAMPLE_REQUESTS.md** ← Copy-paste curl examples
   - Real request examples
   - All endpoints covered
   - Common scenarios
   - Testing workflows

### 5. **IMPLEMENTATION_SUMMARY.md** ← What's included
   - Features list
   - Tech stack details
   - Database schema
   - Security features

---

## 🎯 What's Included

### ✅ 21+ API Endpoints
- **Authentication**: Register, Login
- **User Management**: Profile CRUD
- **Gallery**: Photos, Albums (with CRUD)
- **Bookings**: Sessions, Bookings (with CRUD)
- **Blog**: Posts, Categories, Comments (with CRUD)
- **Services**: Service management
- **Reviews**: 5-star rating system
- **Notifications**: Real-time notifications
- **Admin**: Analytics, User Management, Content Moderation

### ✅ 6 Database Models
- Users (with auth)
- Photos & Albums
- Sessions & Bookings
- Blog Posts & Comments
- Services & Reviews
- Notifications

### ✅ Enterprise Features
- JWT authentication with refresh tokens
- Role-based access control (user, photographer, admin)
- Input validation with Zod
- Error handling
- Admin dashboard
- Content moderation

---

## 🔧 Configuration

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/tonyx-studio

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d

# Email (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# URLs
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Optional: Email Configuration
For sending emails, add to `.env.local`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=noreply@tonyx-studio.com
```

---

## 🧪 Testing the API

### Option 1: Using cURL
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "role": "photographer"
  }'

# Get your token and test protected endpoints
TOKEN="<your-jwt-token>"

curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Option 2: Using Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Create requests for each endpoint
3. Use Authorization tab to add Bearer token
4. Test all features

### Option 3: Using EXAMPLE_REQUESTS.md
All endpoints have curl examples ready to copy/paste. See `EXAMPLE_REQUESTS.md`.

---

## 📁 Project Structure

```
app/api/
├── auth/                  # Login & register
├── users/                 # User profile
├── gallery/               # Photos & albums  
├── bookings/              # Sessions & bookings
├── blog/                  # Posts & comments
├── services/              # Services
├── reviews/               # Reviews
├── notifications/         # Notifications
└── admin/                 # Admin features

lib/
├── models/                # MongoDB schemas
├── auth.ts                # JWT utilities
├── apiResponse.ts         # Response helpers
├── validations.ts         # Zod schemas
└── mongodb.ts             # DB connection
```

---

## 🔐 Authentication

### How It Works
1. **Register**: User creates account → receives JWT token
2. **Login**: User logs in → receives new JWT token
3. **Protected Routes**: Include token in Authorization header
4. **Token Expiry**: 7 days (configurable via `JWT_EXPIRE`)

### Using Tokens
```bash
# All protected requests use:
Authorization: Bearer <your_jwt_token>

# Example:
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 📚 Common Tasks

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "user"
  }'
```

### Upload a Photo
```bash
# First, create an album
# Then upload photo to album
curl -X POST http://localhost:3000/api/gallery/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Sunset",
    "url": "https://storage.example.com/photo.jpg",
    "category": "landscape",
    "tags": ["sunset", "nature"]
  }'
```

### Create a Blog Post
```bash
curl -X POST http://localhost:3000/api/blog/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Photography Tips",
    "slug": "photography-tips",
    "content": "10 tips for better photography...",
    "categoryId": "CATEGORY_ID",
    "status": "draft"
  }'
```

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID",
    "scheduledDate": "2024-08-20T14:00:00Z",
    "scheduledTime": "2:00 PM",
    "location": "Central Park, NYC"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongosh

# Or check connection string in .env.local
MONGODB_URI=mongodb://localhost:27017/tonyx-studio
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### JWT Token Issues
```bash
# Token may be expired, generate new one
# Check JWT_SECRET is set in .env.local
# Include "Bearer " prefix in Authorization header
Authorization: Bearer <token>
```

### Build Errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 🚀 Next Steps

### Immediate
1. ✅ Configure `.env.local`
2. ✅ Start dev server: `pnpm dev`
3. ✅ Test endpoints with cURL/Postman
4. ✅ Read API_DOCUMENTATION.md for full reference

### Short Term
1. Connect your frontend
2. Test authentication flow
3. Test gallery uploads
4. Test bookings system

### Before Production
1. Set strong `JWT_SECRET`
2. Configure production MongoDB
3. Enable HTTPS
4. Add rate limiting
5. Deploy to Vercel/hosting

---

## 📖 Important Files

| File | Purpose |
|------|---------|
| **START_HERE.md** | This file - quick orientation |
| **PROJECT_OVERVIEW.md** | Architecture & structure |
| **API_DOCUMENTATION.md** | Complete API reference |
| **BACKEND_README.md** | Setup & deployment guide |
| **EXAMPLE_REQUESTS.md** | Copy-paste curl examples |
| **.env.local** | Environment configuration |

---

## 💡 Pro Tips

1. **Keep .env.local secure** - Never commit to git
2. **Use strong JWT_SECRET** - `openssl rand -base64 32`
3. **Test in Postman first** - Before frontend integration
4. **Check API_DOCUMENTATION.md** - For all endpoint details
5. **Use EXAMPLE_REQUESTS.md** - Copy working examples

---

## ✅ Health Check

Run this to verify everything is working:

```bash
# 1. Server running?
curl http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# 2. Should see: {"success": true, "data": {"token": "..."}}
```

✅ If you see the response - **everything is working!**

---

## 🎯 You Have

✅ **21+ Production-Ready API Endpoints**  
✅ **Complete Database Schema**  
✅ **JWT Authentication System**  
✅ **Input Validation**  
✅ **Error Handling**  
✅ **Admin Dashboard**  
✅ **Comprehensive Documentation**  
✅ **Example Requests**  

## 🚀 You're Ready

Start the server and begin building! See **API_DOCUMENTATION.md** for complete endpoint reference.

---

## 📞 Help

- **Setup Issues?** → See BACKEND_README.md
- **Endpoint Questions?** → See API_DOCUMENTATION.md
- **Request Examples?** → See EXAMPLE_REQUESTS.md
- **Architecture?** → See PROJECT_OVERVIEW.md

---

**Happy coding! 🎉**

Your TonyX Studio backend is production-ready and waiting for your frontend!
