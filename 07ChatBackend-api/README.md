# 💬 ChatBackend API — Real-Time Production-Grade Chat System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-v4.8.3-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.9.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-v9.0.3-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-v2.10.1-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

A high-performance, real-time, scalable backend service built with **Express 5**, **Socket.IO**, and **MongoDB**. Designed using clean layered architecture principles (**Controller-Service-Repository** pattern), this API provides complete support for 1-on-1 direct messaging, multi-user group chats, real-time typing indicators, read/delivery receipts, live message editing, media uploads, and active multi-device presence tracking.

---

## 📌 Table of Contents

- [Project Overview & Idea](#-project-overview--idea)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Tech Stack & Library Versions](#-tech-stack--library-versions)
- [Key Features](#-key-features)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Socket.IO Real-Time Event Registry](#-socketio-real-time-event-registry)
- [Installation & Local Setup](#-installation--local-setup)
- [Error Handling & Security](#-error-handling--security)
- [Author & License](#-author--license)

---

## 💡 Project Overview & Idea

The **ChatBackend API** is engineered to power modern web and mobile messaging applications. Traditional HTTP REST APIs alone cannot fulfill the instant, low-latency requirements of a messaging platform. This project combines a **RESTful HTTP API** for setup operations (authentication, user search, profile updates, group configuration) with a stateful **Socket.IO Real-Time Engine** for bidirectional, instantaneous event propagation.

### Core Objectives:
1. **Low-Latency Bidirectional Messaging**: Deliver instant messages, typing indicators, and status sync across multiple active user devices simultaneously.
2. **Robust Multi-Device Presence Sync**: Utilize JavaScript data structures (`Map<userId, Set<socketId>>`) to track multiple concurrent socket connections per user account (e.g., active on phone + laptop).
3. **Decoupled Architecture**: Maintain a clean boundary where the **Socket Layer** handles communication/events and the **Service Layer** encapsulates business logic and MongoDB persistence.
4. **Enterprise Security & Reliability**: Protect socket connections and REST endpoints with JWT validation, password hashing via bcrypt, rate-limiting against spam, and centralized error handling.

---

## 🏗 System Architecture & Data Flow

The project follows a **Modular Layered Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Client Application                    │
 └─────────────┬─────────────────────────────┬─────────────┘
               │ HTTP Requests               │ WebSockets
               ▼                             ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐
 │       Express 5 App       │ │     Socket.IO Server      │
 ├───────────────────────────┤ ├───────────────────────────┤
 │ • Auth Routes             │ │ • Connection Auth         │
 │ • User Routes             │ │ • Room Joining & Rooms    │
 │ • Conversation Routes     │ │ • Event Handlers & Limit  │
 └─────────────┬─────────────┘ └─────────────┬─────────────┘
               │                             │
               ▼                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │                     Service Layer                       │
 │ (AuthService, UserService, ConversationService, etc.)   │
 └─────────────┬─────────────────────────────┬─────────────┘
               │ DB Operations               │ Media Uploads
               ▼                             ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐
 │   MongoDB Database        │ │  Cloudinary Media Storage │
 └───────────────────────────┘ └───────────────────────────┘
```

### End-to-End Real-Time Flow:

1. **Authentication**: User logs in via HTTP (`POST /api/v1/auth/login`), receiving an `accessToken` and an HTTP-only `refreshToken` cookie.
2. **Socket Handshake**: Client initiates Socket.IO connection passing `accessToken` in handshake headers/auth. The `socketAuthMiddleware` verifies JWT and attaches `user` object to `socket`.
3. **Presence Tracking**: Server maps `userId -> Set(socketId)`. If `size === 1`, user state is updated to `isOnline = true` and `user:online` event is broadcasted.
4. **Room Subscription**: User joins a room (`conversation:join`) matching the target `conversationId`. Authorization checks confirm participant membership.
5. **Real-time Messaging**:
   - Sender emits `message:send` with `{ conversationId, content, type }`.
   - Rate limiter verifies user message velocity.
   - Message is saved via `sendMessageService` into MongoDB.
   - Room listeners receive `message:new` event instantaneously.
   - Receivers emit `message:delivered` / `message:read` acknowledgments updating persistent delivery/read statuses.

---

## 🛠 Tech Stack & Library Versions

| Package / Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | Server Execution Environment |
| **Express.js** | `^5.2.1` | Modern Web Server & REST API Framework |
| **Socket.IO** | `^4.8.3` | Low-latency WebSockets & Real-Time Event Communication |
| **MongoDB & Mongoose** | `^9.9.3` | NoSQL Database & Data Modeling ODM |
| **JsonWebToken (JWT)** | `^9.0.3` | Dual Token Authentication (Access & Refresh Tokens) |
| **Bcrypt** | `^6.0.0` | Secure Password Hashing (Salt Rounds) |
| **Cloudinary** | `^2.10.1` | Cloud-based Profile Avatar & Media Storage |
| **Multer** | `^2.2.0` | Multipart/Form-Data File Upload Handling |
| **Cookie-Parser** | `^1.4.7` | HTTP Cookie Parsing Middleware |
| **Cors** | `^2.8.6` | Cross-Origin Resource Sharing Configuration |
| **Dotenv** | `^17.4.2` | Environment Variable Management |
| **Nodemon** | `^3.1.14` | Development Server Auto-reloader |

---

## ✨ Key Features

### 1. 🔑 Authentication & Authorization
- Dual Token mechanism: Short-lived Access Token (`15m`) & Long-lived Refresh Token (`10d`).
- Automatic Refresh Token rotation (`POST /api/v1/auth/refresh-token`).
- Cookie-based refresh token handling with security flags (`httpOnly`, `secure`).
- User profile registration with instant Cloudinary avatar upload.

### 2. ⚡ Real-Time Socket Engine
- **Multi-Device Sync**: User can connect from multiple devices (phone, laptop); all devices stay synchronized.
- **In-Memory Rate Limiting**: Built-in protection against message flooding (`socketRateLimiter.js`).
- **Presence Detection**: Live broadcast of user status (`user:online`, `user:offline` with `lastSeen` timestamp).
- **Typing Status**: Live broadcast of `typing:start` and `typing:stop` indicators to group/conversation participants.
- **Delivery & Read Receipts**: Real-time acknowledgment when recipient receives or reads a message.
- **Message Editing & Deletion**: Live broadcast of edited content (`message:updated`) and soft deletion (`message:deleted`).

### 3. 👥 Comprehensive Conversation & Group Management
- **Direct Messages (1-on-1)**: Idempotent creation of direct conversations between two users.
- **Group Chats**: Create groups with custom names and participant lists.
- **Group Administration**:
  - Add or remove participants.
  - Transfer group admin privileges to another participant.
  - Rename group.
  - Leave group functionality for non-admin/admin users.
- **Unread Counters**: Fetch unread message counts per conversation.

### 4. 🖼 Media Management & Storage
- Multer processes local binary buffers into `./public/temp` directory.
- Assets are instantly uploaded to Cloudinary, returning secure HTTPS URLs.
- Local temporary files are automatically cleaned up post-upload.

---

## 📁 Project Directory Structure

```text
07ChatBackend-api/
├── .env                    # Active environment variables
├── .env.sample             # Environment setup template
├── package.json            # Dependencies and npm scripts
├── public/                 # Temporary storage directory for Multer uploads
└── src/
    ├── app.js              # Express app setup, CORS, parser & route binding
    ├── server.js           # HTTP server initialization & Socket.IO mounting
    ├── constants.js        # Global application constants
    ├── config/
    │   └── db.config.js    # MongoDB connection configuration via Mongoose
    ├── controllers/
    │   ├── auth.controller.js          # Authentication request handlers
    │   ├── user.controller.js          # User profile & search handlers
    │   └── conversation.controller.js  # Group & direct chat handlers
    ├── middleware/
    │   ├── auth.middleware.js                  # REST JWT authorization
    │   ├── authorizeConversation.middleware.js # Participant check
    │   ├── error.middleware.js                 # Centralized error handler
    │   ├── multer.middleware.js                # File upload handler
    │   └── socketAuth.middleware.js            # Socket handshake JWT auth
    ├── models/
    │   ├── user.model.js           # User schema (email, avatar, presence)
    │   ├── conversation.model.js   # Direct & Group schemas, participant refs
    │   └── message.model.js        # Message schema, readBy/deliveredTo arrays
    ├── routes/
    │   ├── auth.routes.js          # /api/v1/auth routes
    │   ├── user.routes.js          # /api/v1/users routes
    │   └── conversation.routes.js  # /api/v1/conversations routes
    ├── services/
    │   ├── auth.service.js         # User registration, login, token refresh
    │   ├── user.service.js         # User lookup, profile & avatar updates
    │   ├── conversation.service.js # Group CRUD & participant operations
    │   └── message.service.js      # Message creation, delivery & edit logic
    ├── socket/
    │   └── socket.js               # Socket.IO connection & event handlers
    ├── utils/
    │   ├── ApiError.js             # Custom standardized error class
    │   ├── ApiResponse.js          # Custom standardized response class
    │   ├── asyncHandler.js         # Express async wrapper
    │   ├── cloudinary.js           # Cloudinary file upload helper
    │   ├── cookieOptions.js        # Standard HTTP cookie settings
    │   ├── jwt.js                  # Token generation utilities
    │   ├── sanitizeUser.js         # Sensitive field filtering helper
    │   ├── socketRateLimiter.js    # In-memory Socket rate limiting
    │   ├── validateObjectId.js     # MongoDB ObjectId validation
    │   └── validateRequired.js     # Parameter check validation
    └── validators/
        ├── auth.validator.js          # Auth input schemas
        ├── conversation.validator.js  # Conversation input schemas
        ├── socket.validator.js        # Socket payload schemas
        └── user.validator.js          # User profile update schemas
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the `07ChatBackend-api` root directory using the template below:

```env
# Server Setup
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat_backend

# Security & CORS
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*

# JWT Tokens
ACCESS_TOKEN_SECRET=your_super_secret_access_key_12345
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_67890
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration (Optional for Avatar Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌐 REST API Endpoints Reference

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | File Upload |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/register` | Register new user account | ❌ | `avatar` (Optional) |
| `POST` | `/login` | Authenticate user & return tokens | ❌ | ❌ |
| `POST` | `/refresh-token` | Regenerate access token via refresh token | ❌ | ❌ |
| `POST` | `/logout` | Invalidate current refresh token | ✅ | ❌ |

### 👤 User Management (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/:userId` | Get user profile by ID | ✅ |
| `GET` | `/` | Search users by username or email | ✅ |
| `PATCH` | `/profile` | Update full name / profile metadata | ✅ |
| `PATCH` | `/avatar` | Update avatar image (Cloudinary) | ✅ |

### 💬 Conversations & Groups (`/api/v1/conversations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/direct` | Get or create 1-on-1 direct conversation | ✅ |
| `GET` | `/` | Get all conversations for current user | ✅ |
| `GET` | `/:conversationId` | Get details for specific conversation | ✅ |
| `POST` | `/group` | Create a new group conversation | ✅ |
| `GET` | `/:conversationId/messages` | Get message history with pagination | ✅ |
| `GET` | `/unread` | Get unread message counts | ✅ |
| `POST` | `/:conversationId/members` | Add member to group (Admin only) | ✅ |
| `DELETE` | `/:conversationId/members/:memberId` | Remove member from group (Admin only) | ✅ |
| `DELETE` | `/:conversationId/leave` | Leave group conversation | ✅ |
| `PATCH` | `/:conversationId/admin` | Transfer admin rights to another member | ✅ |
| `PATCH` | `/:conversationId` | Rename group conversation | ✅ |

---

## ⚡ Socket.IO Real-Time Event Registry

### 📡 Client to Server Events (Emitted by Client)

| Event Name | Expected Payload | Description |
| :--- | :--- | :--- |
| `conversation:join` | `{ conversationId }` | Joins socket to target conversation room |
| `message:send` | `{ conversationId, content, type }` | Sends a new real-time message (`TEXT`, `IMAGE`, `FILE`) |
| `message:delivered` | `{ messageId }` | Acknowledges receipt of a message by current user |
| `message:read` | `{ messageId }` | Marks a message as read by current user |
| `message:edit` | `{ messageId, content }` | Edits an existing message sent by user |
| `message:delete` | `{ messageId, conversationId }` | Soft deletes a message sent by user |
| `typing:start` | `{ conversationId }` | Broadcasts typing status to room |
| `typing:stop` | `{ conversationId }` | Broadcasts stop typing status to room |

### 📢 Server to Client Events (Listened by Client)

| Event Name | Emitted Payload | Description |
| :--- | :--- | :--- |
| `user:online` | `{ userId }` | Broadcasted when a user connects online |
| `user:offline` | `{ userId, lastSeen }` | Broadcasted when a user disconnects completely |
| `message:new` | Full Message Object | Emitted to room when a new message is posted |
| `message:delivered` | `{ messageId, deliveredBy }` | Sent to message sender when recipient receives message |
| `message:read` | `{ messageId, readBy }` | Sent to message sender when recipient reads message |
| `message:updated` | `{ messageId, content, editedAt }` | Sent to room when a message is edited |
| `message:deleted` | `{ messageId, content, deletedAt }` | Sent to room when a message is deleted |
| `typing:start` | `{ userId, conversationId }` | Broadcasted to room participants except sender |
| `typing:stop` | `{ userId, conversationId }` | Broadcasted to room participants except sender |
| `*:error` | `{ statusCode, message }` | Sent to triggering socket on event failure |

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas Cluster)

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SalmanAfridi-1043/javascript-backend.git
   cd javascript-backend/07ChatBackend-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   ```bash
   cp .env.sample .env
   ```
   *Edit `.env` and fill in your `MONGODB_URL` and secret keys.*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

   *The server will initialize on `http://localhost:5000` (or your configured `PORT`).*

---

## 🛡 Error Handling & Security

- **Custom Error Class (`ApiError`)**: Standardizes HTTP error responses with status code, message, and error stack details.
- **Custom Response Wrapper (`ApiResponse`)**: Standardizes successful JSON outputs (`{ statusCode, data, message, success: true }`).
- **Input Validation**: All REST inputs and Socket event payloads are sanitized and validated against schemas before reaching service logic.
- **In-Memory Rate Limiter**: Restricts socket message emission velocity to prevent spam attack vectors.
- **CORS Protection**: Configured via Express middleware & Socket.IO handshake setup.

---

## 👨‍💻 Author & License

- **Author**: Salman Afridi
- **License**: [ISC License](LICENSE)
- **Part of**: *JS Backend Journey Series*
