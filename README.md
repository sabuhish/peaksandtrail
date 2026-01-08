# Tour Management System

A full-stack web application for managing mountain tours and participants. Built with FastAPI, PostgreSQL, React, and TypeScript.

## Features

- **Authentication System**: Secure JWT-based authentication with user registration and login
- **Protected Routes**: All tour and participant management routes are protected and require authentication
- **Tour Management**: Create, read, update, and delete tours with details like name, plan, dates, guides, and additional information
- **Participant Management**: Add participants to tours with personal information including contact details, payment tracking, and identification documents
- **DateTime Picker**: Modern date and time picker component for enhanced user experience
- **RESTful API**: FastAPI backend with async PostgreSQL database support
- **Modern UI**: React frontend with shadcn/ui components and React Router
- **Docker Support**: Fully containerized application with Docker Compose

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy (async) with PostgreSQL
- Alembic for database migrations
- Pydantic for data validation
- JWT Authentication (python-jose)
- Password hashing (passlib with bcrypt)
- Ruff for code formatting
- Python 3.11+

### Frontend
- React 18
- TypeScript
- Vite
- React Router v6
- shadcn/ui component library
- Axios for API requests
- React Day Picker for date/time selection
- Tailwind CSS

## Project Structure

```
peakstrail/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Configuration and database
│   │   ├── crud/           # Database operations
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── alembic/            # Database migrations
│   ├── pyproject.toml      # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/ui/  # Reusable UI components
│   │   ├── lib/            # Utilities and API client
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. Clone the repository and navigate to the project directory:
```bash
cd peakstrail
```

2. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env if needed
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user information (requires authentication)

### Tours (All require authentication)
- `GET /api/tours/` - List all tours
- `GET /api/tours/{id}` - Get tour details with participants
- `POST /api/tours/` - Create a new tour
- `PUT /api/tours/{id}` - Update a tour
- `DELETE /api/tours/{id}` - Delete a tour

### Participants (All require authentication)
- `GET /api/participants/` - List all participants (optional: filter by tour_id)
- `GET /api/participants/{id}` - Get participant details
- `POST /api/participants/` - Create a new participant
- `PUT /api/participants/{id}` - Update a participant
- `DELETE /api/participants/{id}` - Delete a participant

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` - User email (unique)
- `username` - Username (unique)
- `hashed_password` - Hashed password
- `full_name` - User's full name
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

### Tours Table
- `id` (Primary Key)
- `name` - Tour name
- `plan` - Tour itinerary
- `start_date` - Start date
- `end_date` - End date
- `guides` - Guide information
- `info` - Additional information (optional)
- `created_at`, `updated_at` - Timestamps

### Participants Table
- `id` (Primary Key)
- `tour_id` (Foreign Key to Tours)
- `name` - First name
- `surname` - Last name
- `paid_amount` - Payment amount
- `birth_date` - Date of birth
- `phone_number` - Contact phone
- `email` - Email address
- `created_at`, `updated_at` - Timestamps

## Authentication

The application uses JWT (JSON Web Token) based authentication:

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login` to receive a JWT token
3. **Protected Routes**: All tour and participant routes require authentication
4. **Token Storage**: JWT tokens are stored in localStorage
5. **Auto-login**: Users remain logged in until they explicitly logout

### First Time Setup

After starting the application for the first time:
1. Navigate to http://localhost:5173
2. Click "Sign up" to create a new account
3. Fill in your details and submit
4. You'll be automatically logged in and redirected to the home page

### API Authentication

When making API requests, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## DateTime Picker Component

The application includes a reusable DateTime Picker component for selecting both date and time.

### Usage Example

```typescript
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { useState } from 'react'

function MyComponent() {
  const [date, setDate] = useState<Date>()

  return (
    <DateTimePicker
      value={date}
      onChange={setDate}
      placeholder="Select date and time"
    />
  )
}
```

The component combines:
- Calendar date selection (via react-day-picker)
- Time input field
- Formatted display using date-fns

## Code Formatting

The backend uses Ruff for code formatting. To format the code:

```bash
cd backend
ruff format .
```

## Creating Database Migrations

When you modify the SQLAlchemy models:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Production Deployment

1. Update environment variables in `backend/.env` with production values:
   - Set `DATABASE_URL` to your production PostgreSQL instance
   - **IMPORTANT**: Generate a secure `SECRET_KEY` (minimum 32 characters) for JWT signing
   - Update `ACCESS_TOKEN_EXPIRE_MINUTES` as needed (default: 7 days)
2. For frontend, update `VITE_API_URL` to your production API URL
3. Build and deploy using Docker Compose or your preferred method

### Generating a Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## License

This project is for internal use only.
