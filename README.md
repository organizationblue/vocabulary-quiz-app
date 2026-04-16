# Vocabulary Quiz App

A React Native/Expo vocabulary quiz application that helps users improve their language skills by translating words between English and Finnish (Other languages coming).

## 🎯 Core Features

1. **Word Translation Quiz** - Users see a word in Finnish and must translate it to English
2. **Real-time Feedback** - Immediate visual feedback on correct/incorrect answers
3. **Progressive Hints** - Reveals letters after each wrong attempt
4. **Score Tracking** - Saves user scores to a PostgreSQL database
5. **User Profiles** - Persistent user nicknames with score history
6. **Confetti Celebration** - Visual feedback when completing a session

## 🛠️ Technology Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** (native-stack) for routing
- **React Native Paper** for UI components
- **AsyncStorage** for local persistence
- **Confetti Cannon** for celebration animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL adapter
- **PostgreSQL** (Supabase) for data persistence
- **Swagger/OpenAPI** for API documentation
- **CORS** for cross-origin requests

### Testing & CI/CD
- **Vitest** for backend unit tests
- **Supertest** for API integration testing
- **GitHub Actions** for CI/CD pipeline

## 📁 Project Structure

```
vocabulary-quiz-app/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── .expo/                       # Expo configuration
├── frontend/                    # React Native/Expo app
│   ├── components/
│   │   └── Word.tsx            # Quiz component with answer logic
│   ├── screens/
│   │   ├── NicknameScreen.tsx   # User registration/login
│   │   ├── GameScreen.tsx       # Main game session screen
│   │   └── HomeScreen.tsx       # App home/menu screen
│   ├── services/
│   │   └── service1.tsx         # Service utilities
│   ├── types/
│   │   └── navigation.ts        # Type definitions
│   ├── utils/
│   │   └── storage.ts           # AsyncStorage wrapper
│   ├── assets/                  # Images and static assets
│   ├── App.tsx                  # Root app component
│   ├── index.ts                 # App entry point
│   ├── app.json                 # Expo configuration
│   ├── .env                     # API URL configuration
│   └── package.json
│
└── backend/                     # Node.js/Express API
    ├── src/
    │   ├── app.ts              # Express app setup & routes
    │   ├── index.ts            # Server entry point
    │   ├── prisma.config.ts    # Prisma configuration
    │   ├── vitest.config.ts    # Vitest configuration
    │   ├── lib/
    │   │   └── prisma.ts       # Prisma client setup with connection pooling
    │   ├── service/
    │   │   └── wordService.ts  # Word fetching logic
    │   ├── data/
    │   │   └── words.json      # Word dataset (277 words)
    │   ├── tests/
    │   │   ├── word.test.ts    # API endpoint tests
    │   │   └── setup.ts        # Test configuration & mocks
    │   ├── types/
    │   │   └── words.ts        # TypeScript word types
    │   ├── generated/
    │   │   └── prisma/         # Auto-generated Prisma client
    │   └── prisma/
    │       ├── schema.prisma   # Database schema
    │       └── migrations/     # Database migrations
    ├── Dockerfile              # Docker configuration for deployment
    ├── .env                    # Database & port config
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm/yarn
- PostgreSQL database (or Supabase)
- Expo account (for Expo Go testing)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
# Copy .env and add your DATABASE_URL

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

**Environment Variables (.env):**
```
PORT=8080
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update API URL in .env
# EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:8080

# For localhost development
npm start

# For Expo Go on device
# Scan QR code with Expo Go app
```

**Environment Variables (.env):**
```
EXPO_PUBLIC_API_URL=http://192.168.X.X:8080
```

> **Note for Expo Go:** Use your machine's actual IP address (not `localhost`). Find it with `ipconfig` (Windows) or `ifconfig` (Linux/Mac).

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- ✅ Random word endpoint `/api/word`
- ✅ Multiple words endpoint `/api/words` with count parameter
- ✅ User creation/fetching `/api/user`
- ✅ Score saving `/api/score`
- ✅ Error handling and validation
- ✅ Duplicate prevention
- ✅ 404 handling

### CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration:

1. **Backend Tests** - Runs on every push/PR
   - Installs dependencies
   - Generates Prisma client
   - Runs all Vitest tests
   - Builds TypeScript to JavaScript

2. **Frontend TypeCheck** - Runs on every push/PR
   - Installs dependencies
   - Type-checks with TypeScript
   - Validates React Native setup

**Required Secret:**
- `DATABASE_URL` - Add your PostgreSQL connection string to repository secrets

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. The database consists of two main tables:

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  nickname  String   @unique
  scores    Score[]
  createdAt DateTime @default(now())
}
```
- **id**: Auto-incrementing primary key
- **nickname**: Unique username for the player
- **scores**: One-to-many relationship with Score table
- **createdAt**: Timestamp when user was created

### Score Model
```prisma
model Score {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  score     Int
  createdAt DateTime @default(now())
}
```
- **id**: Auto-incrementing primary key
- **userId**: Foreign key referencing User.id
- **user**: Relation to User model
- **score**: Integer representing the session score (0-20)
- **createdAt**: Timestamp when score was recorded

**Database Migrations:**
- Initial migration: `20260403124136_init` - Creates User and Score tables with relationships


## 📊 Game Session Flow

1. **Nickname Screen** - User enters/retrieves username
2. **Game Screen** - 20-word session
   - Display Finnish word
   - User types English translation
   - Show hints after each wrong attempt
   - Score calculated based on attempts: `(wordLength - wrongAttempts) / wordLength`
   - Progress through all 20 words
3. **Game Over Screen** - Display final score with confetti animation
4. **Score Saved** - User's score persists to database

## 🔌 API Endpoints

### GET `/api/word`
Returns a random word.

**Response:**
```json
{
  "success": true,
  "data": {
    "english": "cat",
    "finnish": "kissa"
  }
}
```

### GET `/api/words?count=20`
Returns multiple unique random words.

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    { "english": "cat", "finnish": "kissa" },
    { "english": "dog", "finnish": "koira" }
  ]
}
```

### POST `/api/user`
Create or fetch user by nickname.

**Request:**
```json
{
  "nickname": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": 1, "nickname": "player123" },
  "returning": false
}
```

### POST `/api/score`
Save a session score.

**Request:**
```json
{
  "nickname": "player123",
  "score": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": 1, "userId": 1, "score": 15 }
}
```

### GET `/api-docs`
Interactive Swagger API documentation.

## 📈 Deployment

### Frontend
**Live:** https://vocabulary-quiz-app.onrender.com

Deployed to Render as a static Expo web build.

### Backend API
**Live:** https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi

Deployed to Rahti (OpenShift) with PostgreSQL on Supabase.

## 🔒 Environment Configuration

### Development (Localhost)

**Backend** - `backend/.env`
```
PORT=8080
DATABASE_URL=postgresql://...
```

**Frontend** - `frontend/.env`
```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

### Production (Deployed)

**Backend** - Environment variables on Rahti
**Frontend** - Built Expo web app

## 👥 Team Members

- Anton Mattila
- Markus Ovaska
- Elias Jungman
- Henri Tomperi
- Eetu Pärnänen

## 🐛 Troubleshooting

### Expo Go won't connect to backend
- Ensure backend is running: `npm run dev` in `backend/`
- Check API URL in `frontend/.env` - use your machine's IP, not `localhost`
- Verify firewall isn't blocking port 8080

### CI tests failing
- Add `DATABASE_URL` secret to GitHub repository
- Check that Prisma client is generated: `npx prisma generate`
- Ensure Node.js version is 20+

### Database connection errors
- Verify `DATABASE_URL` format in `.env`
- Check PostgreSQL/Supabase is accessible
- Ensure SSL mode is set to "require" for remote databases