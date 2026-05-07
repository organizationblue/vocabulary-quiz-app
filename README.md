# Vocabulary Quiz App

A React Native/Expo vocabulary quiz application where users register, log in, choose a language pair, and play a 20-word translation session with per-word timing. Scores are stored in PostgreSQL, tied to the authenticated user, and displayed on a public scoreboard.

## 🔗 Project Links

- Backlog: [GitHub Projects backlog](https://github.com/orgs/organizationblue/projects/4/views/1)
- Frontend production: https://vocabulary-quiz-app.onrender.com
- Backend production: https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi
- Swagger documentation: https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi/api-docs
- License: [LICENSE](LICENSE)

## 🎯 Core Features

1. **Account-based play** - Register, log in, restore session, and log out
2. **Multi-language quiz sessions** - Choose a source and target language before each game
3. **Real-time feedback** - Immediate response for correct and incorrect answers
4. **Progressive hints** - Letters are revealed after wrong attempts
5. **Timed rounds** - Each word has a 15-second timer and auto-skips when time runs out
6. **Score tracking** - Session scores are saved to the backend database
7. **Language-pair-ready scores** - Scores are stored with the selected source and target language
8. **Scoreboard browsing** - Players can view the top saved scores and filter them by language pair
9. **Confetti celebration** - Session completion includes a game-over screen with confetti

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
│   │   ├── Scoreboard.tsx
│   │   └── Word.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── StartScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── ScoreboardScreen.tsx
│   ├── types/
│   │   ├── auth.ts
│   │   ├── navigation.ts
│   │   └── scoreboard.ts
│   ├── utils/
│   │   └── storage.ts
│   ├── tests/
│   │   ├── score.test.ts
│   │   └── timer.test.ts
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

## 🏗️ Project Architecture

```mermaid
flowchart LR
  User["User / Mobile or Web Client"]

  subgraph Frontend["Frontend - React Native / Expo"]
    Navigation["Navigation Screens"]
    AuthContext["AuthContext"]
    GameUI["Game Screen + Word Component"]
    ScoreboardUI["Scoreboard Screen"]
    Storage["Secure Store / AsyncStorage"]
  end

  subgraph Backend["Backend - Express / Prisma"]
    AuthAPI["/api/auth/*"]
    WordAPI["/api/word and /api/words/"]
    ScoreAPI["/api/score and /api/scores/"]
    Swagger["/api-docs"]
  end

  DB[("PostgreSQL / Supabase")]

  User --> Navigation
  Navigation --> AuthContext
  AuthContext --> Storage
  Navigation --> GameUI
  Navigation --> ScoreboardUI

  AuthContext --> AuthAPI
  GameUI --> WordAPI
  GameUI --> ScoreAPI
  ScoreboardUI --> ScoreAPI

  AuthAPI --> DB
  WordAPI --> DB
  ScoreAPI --> DB
  Swagger --> Backend
```

### How the parts communicate

- The frontend is the user-facing layer. It handles login, game flow, and scoreboard views.
- `AuthContext` stores the session token and user data locally, then verifies the session against the backend when the app starts.
- The game screen fetches quiz words from the backend and posts the final score back after the session ends.
- The scoreboard screen fetches saved scores from the backend and can filter them by language pair.
- The backend validates requests, handles authentication, generates words, stores scores, and exposes the Swagger docs.
- PostgreSQL stores the persistent data: users, authentication-related fields, and score records.

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
6. User plays a 20-word quiz session with a 15-second timer for each word
7. Wrong answers reveal progressively more letters as hints
8. When time runs out, the current word is auto-skipped
9. Final score is saved to the backend for that user and language pair
10. User can open the scoreboard to see top scores, optionally filtered by source and target language

## Game Flow Screens (browser)

<img width="3072" height="1840" alt="vocahome" src="https://github.com/user-attachments/assets/05f767b7-2d28-4803-b498-569fb2bd171b" />

<img width="3072" height="1840" alt="vocaregister" src="https://github.com/user-attachments/assets/70dba368-3c1f-4206-8a1c-95237ddd3d6d" />

<img width="3072" height="1840" alt="vocastart" src="https://github.com/user-attachments/assets/fad0fe08-ac46-4d76-bdda-0f4a8930a56e" />

<img width="3072" height="1840" alt="vocagame" src="https://github.com/user-attachments/assets/b789eade-7830-43eb-8d8d-bd52ed62a925" />

<img width="3072" height="1840" alt="vocaend" src="https://github.com/user-attachments/assets/61bed2b9-b6ae-410d-b418-2f6e7066ff04" />

<img width="3072" height="1840" alt="vocascore" src="https://github.com/user-attachments/assets/2a5ee161-1eae-493e-ad4c-b986fac0efcd" />

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

#### `GET /api/scores`

Returns the top saved scores, ordered by score and then by creation time.

Optional query parameters:

- `limit` defaults to 10 and must be between 1 and 100
- `sourceLanguage`
- `targetLanguage`

If both language filters are provided, they must be a valid pair.

### Legacy

#### `POST /api/user`

Legacy nickname-based endpoint kept for backward compatibility with earlier app versions.

### Docs

#### `GET /api-docs`

Swagger UI for the backend API: https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi/api-docs

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

