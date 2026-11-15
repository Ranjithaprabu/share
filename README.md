# Connectly 2.0

A full-stack real-time messaging application built with the MERN stack, enabling users to communicate through direct and group conversations.

## Overview

Connectly is a messaging platform designed to provide secure user authentication, conversation management, and seamless communication. It features a React-based frontend, a RESTful backend, and MongoDB for persistent data storage.

## Features

- **User Authentication:** Secure registration and login using JWT and bcrypt password hashing.
- **Direct Messaging:** Create and manage one-to-one conversations.
- **Group Conversations:** Create groups, manage members, and control membership through admin permissions.
- **Message Management:** Send and retrieve messages through REST APIs.
- **Message Pagination:** Retrieve messages efficiently using paginated API requests.
- **User Discovery:** Browse registered users and initiate conversations.
- **Real-Time Backend Support:** Socket.IO integration with JWT authentication, typing indicators, and online presence events.
- **Responsive Interface:** Clean messaging interface built with React.js.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Redux Toolkit, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time Communication | Socket.IO |
| API Development | REST APIs |
| Development Tools | Git, GitHub, Postman, VS Code |

## Project Structure

```text
Connectly-2.0/
│
├── client/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── styles/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       ├── utils/
│       ├── validators/
│       ├── app.js
│       └── server.js
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd directory

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_db
JWT_SECRET=your_secret_key
```

### 3. Start the Backend

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 4. Configure the Frontend

Open another terminal:

```bash
cd client
npm install
```

Ensure the API base URL in `client/src/services/api.js` points to:

```js
const API_BASE_URL = "http://localhost:5000/api";
```

### 5. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/users/me` | Retrieve user profile |
| GET | `/api/users` | Retrieve registered users |
| POST | `/api/conversations/direct` | Create a direct conversation |
| POST | `/api/conversations/group` | Create a group conversation |
| GET | `/api/conversations` | Retrieve conversations |
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/:conversationId` | Retrieve conversation messages |

Protected endpoints require a JWT access token in the Authorization header:

```text
Authorization: Bearer <token>
```

## Future Enhancements

- Read receipts and delivery status.
- File and image sharing.
- Message search and filtering.
- Message editing and deletion.
- Docker-based deployment and CI/CD automation.



---

*Connectly 2.0 — Built to explore full-stack development, backend architecture, and real-time communication.*
