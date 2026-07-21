# TonyX Backend API

Professional barber shop booking and management system API — Node.js 22, TypeScript (strict), Express, and MongoDB/Mongoose.

## Tech Stack

- **Runtime**: Node.js 22+, TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`)
- **Password Hashing**: bcryptjs
- **Validation**: Zod (request body/query/params validated at the route boundary)
- **Image Storage**: Cloudinary (SDK configured; upload endpoints not yet built — see Roadmap)
- **Security**: Helmet, CORS, tiered rate limiting, custom NoSQL-injection sanitizer
- **Logging**: Pino (structured, redacts secrets)
- **Docs**: OpenAPI 3, generated from the same Zod schemas used for validation, served via Swagger UI
- **Testing**: Vitest, Supertest, mongodb-memory-server

## Architecture

Layered, feature-oriented structure:

```
src/
  app.ts / server.ts     Express app assembly / process bootstrap
  config/                 env (Zod-validated), logger, database, cloudinary
  interfaces/             domain types (IUser, IBooking, IService, IPayment, ...)
  models/                 Mongoose schemas
  repositories/           persistence layer — never throws NotFound, returns T | null
  services/               business logic — translates null -> domain errors
  validators/              Zod schemas + validate() middleware, source of truth for both
                          request validation and generated OpenAPI docs
  controllers/             thin: parse request -> call service -> send response
  routes/
  middlewares/             auth, error handler, rate limiters, sanitizer
  utils/                  AppError hierarchy, response envelope, pagination, asyncHandler
  docs/                   OpenAPI registry + Swagger UI mount
```

**Request flow**: route -> `validate()` (Zod) -> `authenticate`/`authorize` -> controller -> service -> repository -> Mongoose.

**Error handling**: a typed `AppError` hierarchy (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`) is thrown from services and caught by a single global error handler, which maps it to the standard response envelope.

**Response envelope** (every endpoint):

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "meta": { "timestamp": "2026-01-01T00:00:00.000Z", "pagination": { "...": "..." } }
}
```

**Soft delete**: `User`, `Booking`, `Service`, and `Payment` carry a `deletedAt` field; `BaseRepository` excludes soft-deleted documents from all reads by default.

## Installation

```bash
npm install
cp .env.example .env   # fill in real values — never commit .env
npm run dev             # tsx watch, http://localhost:5000
```

## Environment Variables

See [.env.example](.env.example). `MONGODB_URI` and `JWT_SECRET` (32+ characters) are required; the process fails fast at startup with a clear error if they're missing or invalid — see `src/config/env.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled build (`dist/server.js`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (flat config, strict TypeScript rules) |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:watch` / `test:coverage` | Vitest |

## API Documentation

Interactive Swagger UI: `GET /api/docs` (raw OpenAPI JSON at `/api/docs.json`) once the server is running.

## Health Check

```bash
curl http://localhost:5000/health
```

## Docker

```bash
docker build -f docker/Dockerfile -t tonyx-backend .
docker run --env-file .env -p 5000:5000 tonyx-backend
```

## Security Notes

- JWTs are signed/verified with `jsonwebtoken` under an explicit `HS256` algorithm allow-list (no algorithm-confusion surface).
- Public registration always creates a `customer` account — role cannot be self-assigned via the API.
- NoSQL-injection defense is layered: Zod `.strict()` schemas reject unknown/operator-shaped keys outright, and a small recursive sanitizer strips `$`/`.`-prefixed keys as a second layer.
- `/api/v1/auth/login` and `/register` sit behind a stricter rate limit than general API traffic.

## Roadmap / Known Gaps

- `Review`, `Promotion`, `Location`, `Notification`, and `TimeSlot` have typed Mongoose schemas but no repository/service/controller/route layer yet — add them when there's a concrete feature need.
- Cloudinary is configured (`src/config/cloudinary.ts`) but no upload endpoint exists yet — add a Multer + Cloudinary flow when profile/service image upload is prioritized.

## License

MIT
