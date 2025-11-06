# Event Management System

A comprehensive event management system built with the MERN stack that allows admins to create profiles and manage events across multiple users and timezones.

## Features

- **Multi-Profile Management**: Create and manage multiple user profiles
- **Multi-Timezone Support**: Events display according to user's selected timezone
- **Event CRUD Operations**: Create, view, and update events
- **Event Update Logs**: Track all event changes with timestamps
- **Responsive Design**: Works seamlessly across devices

## Tech Stack

- **Frontend**: React with vanilla CSS
- **Backend**: Express.js
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Timezone Handling**: dayjs

## Project Structure

```
Event-Management-System/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   └── styles/
│   └── public/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**
```bash
# Create .env file in backend directory
MONGODB_URI=your_mongodb_connection_string
PORT=5001
NODE_ENV=development
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Frontend Environment**
```bash
# Create .env file in frontend directory
REACT_APP_API_URL=http://localhost:5001/api
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
npm run dev
```

2. **Start Frontend Application**
```bash
cd frontend
npm start
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Health Check: http://localhost:5001/api/health

## API Documentation

### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id/timezone` - Update profile timezone

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `GET /api/events/profile/:profileId` - Get events for profile
- `GET /api/events/:id/logs` - Get event update logs

## Database Schema

### Profile
```javascript
{
  name: String (required),
  timezone: String (default: 'UTC'),
  createdAt: Date,
  updatedAt: Date
}
```

### Event
```javascript
{
  profiles: [ObjectId] (ref: Profile),
  timezone: String (required),
  startDate: Date (required),
  endDate: Date (required),
  title: String (required),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### UpdateLog
```javascript
{
  eventId: ObjectId (ref: Event),
  changes: Object,
  timestamp: Date,
  timezone: String
}
```

## Key Features

- **Timezone Conversion**: All dates stored in UTC, displayed in user's timezone
- **Real-time Updates**: Events update across all users when modified
- **Change Tracking**: Complete audit trail of event modifications
- **Responsive Design**: Mobile-first responsive interface
- **Input Validation**: Comprehensive client and server-side validation