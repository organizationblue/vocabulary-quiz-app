# vocabulary-quiz-documentation

## MVP-plan
- The project is meant to help users improve on vocabulary between two languages they select.

## Main features
1.  As a user I want to be able to see a word in language A in order to translate it to language B
2.  As a user I want to be able to type the translated word in a textfield
3.  As a user I want immediate feedback on my answer, and see the correct answer
4.  As a user I want to be able to move to the next word after the previous answer

## Used technologies

- React Native/Expo
- Typescript
- Node.js tai express.js


## Team Members
- Anton Mattila
- Markus Ovaska
- Elias Jungman
- Henri Tomperi
- Eetu Pärnänen


## Setup for expo go
1. In the frontend folder create .env file
2. Add the following to the .env: EXPO_PUBLIC_API_URL=http://(your IP-adress):3000
3. Replace (your IP adress) with your actual IP-adress. You can see it by running ipconfig in windows terminal.


## Running Tests

### Prerequisites
- Node.js v18
- npm

### Backend tests
The backend uses Vitest and Supertest

1. Navigate to the backend directory:
```bash
   cd backend
```

2. Install dependencies if you haven't:
 ```bash
    npm install
 ```

3. Run the tests:
```bash
   npm test
```

## Deployment

The application is deployed and accessible online.

### Frontend

The frontend application can be accessed at:

https://vocabulary-quiz-app.onrender.com

This is the user interface where users can practise their vocabulary.


### Backend API

The backend API is deployed at:

https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi

Example endpoint:

GET https://vocabulary-quiz-app-git-vocabulary-quiz-app.2.rahtiapp.fi/api/word

This endpoint returns a random vocabulary word from the mock dataset.

Example response:
{
  "success": true,
  "data": {
    "english": "hair",
    "finnish": "hiukset"
  }
}