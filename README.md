# Vocabulary Quiz App

A React Native/Expo vocabulary quiz application where users register, log in, choose a language pair, and play a 20-word translation session. Scores are stored in PostgreSQL and tied to the authenticated user.

## 🎯 Core Features

1. **Account-based play** - Register, log in, restore session, and log out
2. **Multi-language quiz sessions** - Choose a source and target language before each game
3. **Real-time feedback** - Immediate response for correct and incorrect answers
4. **Progressive hints** - Letters are revealed after wrong attempts
5. **Score tracking** - Session scores are saved to the backend database
6. **Language-pair-ready scores** - Scores are stored with the selected source and target language
7. **Confetti celebration** - Session completion includes a game-over screen with confetti

## 🌍 Supported Languages

- Finnish
- English
- Swedish
- German
- Spanish

## 🛠️ Technology Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation (native-stack)
- React Native Paper
- AsyncStorage
- Expo Secure Store with AsyncStorage fallback

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT authentication
- bcryptjs for password hashing
- Zod for request validation
- Swagger/OpenAPI

### Testing & CI
- Vitest
- Supertest
- GitHub Actions

## 📁 Project Structure

```text
vocabulary-quiz-app/
├── frontend/
│   ├── components/
│   │   └── Word.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── StartScreen.tsx
│   │   └── GameScreen.tsx
│   ├── types/
│   │   ├── auth.ts
│   │   └── navigation.ts
│   ├── utils/
│   │   └── storage.ts
│   └── App.tsx
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── auth.ts
│   │   ├── data/
│   │   │   └── words.json
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── service/
│   │   │   └── wordService.ts
│   │   ├── tests/
│   │   └── types/
│   ├── prisma.config.ts
│   └── Dockerfile
└── .github/workflows/ci.yml
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database or Supabase project

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy --schema prisma/schema.prisma
npm run dev
```

**Environment variables** in `backend/.env`:

```env
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-long-random-secret
```

To generate a secret on Linux:

```bash
openssl rand -hex 32
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

**Environment variables** in `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:8080
```

For Expo Go, use your machine IP instead of `localhost`.

## 🧪 Testing

### Backend

```bash
cd backend
npm test
npm run build
```

### Frontend

```bash
cd frontend
npm test
npx tsc -p tsconfig.json
```

### CI Pipeline

GitHub Actions currently runs:

1. Backend tests
2. Backend build
3. Frontend tests
4. Frontend typecheck

**Required GitHub secret:**

- `DATABASE_URL`

## 🗄️ Database Schema

### User

```prisma
model User {
  id           Int      @id @default(autoincrement())
  nickname     String   @unique
  username     String?  @unique
  displayName  String?
  passwordHash String?
  createdAt    DateTime @default(now())
  scores       Score[]
}
```

- `username` is used for authentication
- `displayName` is shown in the UI
- `passwordHash` stores the hashed password
- `nickname` remains for backward compatibility with older data

### Score

```prisma
model Score {
  id             Int      @id @default(autoincrement())
  userId         Int
  score          Float
  sourceLanguage String?
  targetLanguage String?
  createdAt      DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id])
}
```

- Scores belong to an authenticated user
- Scores can be filtered later by language pair

### Migrations

- `20260403124136_init`
- `20260427000000_add_auth_fields`
- `20260503000000_add_score_languages`

## 📊 Game Flow

1. User opens the app
2. Existing session is restored if a valid token is stored
3. Logged-out users see `Login` and `Register`
4. Logged-in users see `Start`
5. User selects source and target language
6. User plays a 20-word quiz session
7. Final score is saved to the backend for that user and language pair

## 🔌 API Endpoints

### Auth

#### `POST /api/auth/register`

Register a new account.

```json
{
  "username": "player123",
  "displayName": "Player One",
  "password": "supersecret123"
}
```

#### `POST /api/auth/login`

Log in to an existing account.

```json
{
  "username": "player123",
  "password": "supersecret123"
}
```

#### `GET /api/auth/me`

Return the currently authenticated user.

### Words

#### `GET /api/word`

Returns one random quiz word for a selected language pair.

Example:

```text
/api/word?sourceLanguage=finnish&targetLanguage=english
```

#### `GET /api/words?count=20`

Returns multiple unique quiz words for a session.

Example:

```text
/api/words?count=20&sourceLanguage=english&targetLanguage=german
```

### Scores

#### `POST /api/score`

Save a score for the authenticated user.

```json
{
  "score": 15.4,
  "sourceLanguage": "english",
  "targetLanguage": "german"
}
```

This endpoint requires a bearer token.

### Legacy

#### `POST /api/user`

Legacy nickname-based endpoint kept for backward compatibility with earlier app versions.

### Docs

#### `GET /api-docs`

Swagger UI for the backend API.

## 📈 Deployment

### Frontend

**Live:** https://vocabulary-quiz-app.onrender.com

Deployed to Render as an Expo web build.

### Backend

**Live:** https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi

Deployed to Rahti (OpenShift) with Supabase PostgreSQL.

### Production Environment Variables

Backend deployment should include:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` if needed by the platform

After deploying backend schema changes, run:

```bash
cd backend
npx prisma migrate deploy --schema prisma/schema.prisma
```

## 🐛 Troubleshooting

### Frontend cannot reach backend

- Check `EXPO_PUBLIC_API_URL`
- Use your machine IP for Expo Go
- Make sure the backend server is running

### Authentication returns 500 in production

- Verify `JWT_SECRET` is set in the backend environment
- Verify the latest Prisma migrations have been applied to the production database

### Prisma migration command fails

- Run it from `backend/`
- Use `npx prisma migrate deploy --schema prisma/schema.prisma`
- Make sure `DATABASE_URL` is available in the environment

## 👥 Team Members

- Anton Mattila
- Markus Ovaska
- Elias Jungman
- Henri Tomperi
- Eetu Pärnänen
