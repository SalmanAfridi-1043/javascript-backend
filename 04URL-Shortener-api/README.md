# 🔗 URL Shortener API

> A robust, secure, and production-ready RESTful API for shortening URLs, managing custom aliases, enforcing expiration dates, and tracking real-time click analytics. Built with **Node.js**, **Express.js**, **MongoDB**, and **JSON Web Tokens (JWT)** using clean Controller-Service architecture.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [URL Management & Analytics Endpoints](#url-management--analytics-endpoints)
- [Data Schemas](#-data-schemas)
- [Security & Validation](#-security--validation)
- [License & Author](#-license--author)

---

## 🚀 Overview

The **URL Shortener API** allows users to transform long web addresses into concise, shareable links. Designed following modern backend engineering standards, it includes dual-token authentication (Access & Refresh tokens via HTTP-only cookies), custom shortcode support, automated link expiration, detailed click analytics, and input validation.

---

## ✨ Features

- **🔐 Dual Token Authentication**: Access and Refresh token rotation using JSON Web Tokens (JWT) stored in HTTP-only cookies for maximum security.
- **✂️ Shortcode Generation**: Generates 7-character random unique shortcodes or supports user-defined custom aliases (3–15 characters).
- **⏳ URL Expiration**: Set optional expiration dates on short links to automatically reject expired link redirects.
- **📊 Real-time Click Analytics**: Tracks click counts, last-visited timestamps, and URL metadata.
- **🛡️ Robust Input Validation**: Strict validation rules for full names, usernames, emails, passwords, custom shortcodes, and ObjectIDs.
- **🏗️ Service Layer Architecture**: Decoupled Controllers, Services, and Models for clean maintainability and testing.
- **🌐 MongoDB DNS Fallback**: Built-in DNS resolver configuration to ensure smooth MongoDB Atlas connections across all network environments.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js (ES Modules `"type": "module"`)
- **Framework:** Express.js 5.x
- **Database:** MongoDB & Mongoose 9.x
- **Authentication:** JWT (`jsonwebtoken`), Bcrypt password hashing
- **Cookie Management:** `cookie-parser`
- **Development Tooling:** `nodemon`, `dotenv`

---

## 🏗️ Project Architecture

```
Client (Postman / Frontend)
       │
       ▼
  Express Server (src/server.js & src/app.js)
       │
       ├─► Middleware (JWT Authentication / CORS / Cookie Parser)
       │
       ├─► Routes (User & URL Endpoints)
       │
       ├─► Controllers (HTTP Request/Response Handling & Statuses)
       │
       ├─► Services (Business Logic & Database Operations)
       │
       └─► Models (Mongoose Schemas for User & Url)
```

---

## 📁 Directory Structure

```
04URL-Shortener-api/
├── .env                  # Environment configuration file (ignored by Git)
├── .env.sample           # Sample environment template
├── package.json          # Node dependencies and npm scripts
├── README.md             # Project documentation
└── src/
    ├── app.js            # Express application configuration & middleware setup
    ├── server.js         # Entry point (database connection & server start)
    ├── constants.js      # App-wide constants (e.g., Database name)
    ├── config/
    │   └── db.js         # MongoDB connection setup with DNS resolver override
    ├── controllers/
    │   ├── url.controller.js   # HTTP logic for URL shortener routes
    │   └── user.controller.js  # HTTP logic for user registration & auth
    ├── middleware/
    │   └── auth.middleware.js # Protected route authentication middleware
    ├── models/
    │   ├── url.model.js        # Mongoose schema for Shortened URLs
    │   └── user.model.js       # Mongoose schema for User accounts
    ├── routes/
    │   ├── url.routes.js      # Endpoint definitions for URL features
    │   └── user.routes.js     # Endpoint definitions for User features
    ├── services/
    │   ├── url.service.js     # Core business logic for URL shortening & analytics
    │   └── user.service.js    # Core business logic for User management
    ├── utils/
    │   ├── ApiError.js          # Custom error response class
    │   ├── ApiResponse.js        # Standardized API response wrapper
    │   ├── asyncHandler.js       # Async wrapper for route handlers
    │   ├── cookieOptions.js      # HTTP-only cookie configuration
    │   ├── generateShortCode.js  # Random 7-character code generator
    │   ├── jwt.js                # Access & Refresh token generation
    │   ├── sanitizeUser.js       # User object sanitizer (strips passwords)
    │   ├── validateExpiresAt.js  # Expiration date validator
    │   ├── validateObjectId.js   # MongoDB ObjectId syntax validator
    │   └── validateRequired.js   # Required field checker helper
    └── validators/
        └── auth.validator.js    # Registration and Login payload validators
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=URL-Shortner-API

BCRYPT_SALT_ROUNDS=10

ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

CORS_ORIGIN=*
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB Database (Local instance or MongoDB Atlas cluster)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd 04URL-Shortener-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.sample` to `.env` and fill in your MongoDB connection URI and JWT secret keys.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000` (or your configured `PORT`).

---

## 📑 API Reference

### Health Check

#### `GET /`
Returns API status message.

---

### Authentication Endpoints

Base path: `/api/v1/user`

#### 1. Register User
- **URL:** `POST /api/v1/user/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "fullName": "Salman Afridi",
    "username": "salman_afridi",
    "email": "salman@example.com",
    "password": "Password123"
  }
  ```
- **Validation:**
  - `fullName`: 5 to 30 characters
  - `username`: 5 to 20 characters (`a-z`, `0-9`, `_`)
  - `password`: Min 8 chars, must include upper, lower, and digit.

#### 2. Login User
- **URL:** `POST /api/v1/user/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "salman_afridi",
    "password": "Password123"
  }
  ```
  *(Can also pass `"email"` instead of `"username"`)*
- **Response:** Sets `accessToken` and `refreshToken` cookies and returns sanitized user details.

#### 3. Refresh Access Token
- **URL:** `POST /api/v1/user/refresh-token`
- **Access:** Public (Requires valid Refresh Token in Cookies or Body)
- **Request Body (Optional if using cookies):**
  ```json
  {
    "refreshToken": "<your_refresh_token>"
  }
  ```
- **Response:** Rotates tokens and sets new `accessToken` & `refreshToken` cookies.

#### 4. Logout User
- **URL:** `POST /api/v1/user/logout`
- **Access:** Protected (Bearer token or `accessToken` cookie)
- **Response:** Clears stored refresh token from database and resets cookies.

---

### URL Management & Analytics Endpoints

#### 1. Create Short URL
- **URL:** `POST /create`
- **Access:** Protected
- **Request Body:**
  ```json
  {
    "originalUrl": "https://example.com/very/long/url/path",
    "customCode": "my-custom-code",
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
  ```
  *(Note: `customCode` and `expiresAt` are optional)*

#### 2. Redirect to Original URL
- **URL:** `GET /redirect?shortCode=my-custom-code` or `/redirect/:shortCode`
- **Access:** Public
- **Response:** `302 Found` redirecting to the target original URL. Updates click count and `lastVisited` timestamp.

#### 3. Get All User URLs
- **URL:** `GET /urls`
- **Access:** Protected
- **Response:** List of all URLs created by the authenticated user sorted by newest first.

#### 4. Get URL Details by ID
- **URL:** `GET /urls/:urlId`
- **Access:** Protected
- **Response:** Detailed metadata for specific URL ID.

#### 5. Update URL
- **URL:** `PATCH /urls/:urlId`
- **Access:** Protected
- **Request Body:**
  ```json
  {
    "originalUrl": "https://updated-link.com",
    "expiresAt": "2027-01-01T00:00:00.000Z"
  }
  ```

#### 6. Delete URL
- **URL:** `DELETE /urls/:urlId`
- **Access:** Protected
- **Response:** Deletes the URL entry owned by the authenticated user.

#### 7. Get URL Analytics
- **URL:** `PATCH /urls/:urlId/analytics`
- **Access:** Protected
- **Response:** Analytics object returning `clicks`, `lastVisited`, `expiresAt`, and creation timestamp.

---

## 🗄️ Data Schemas

### User Schema (`User`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | `String` | Required, Trimmed | User's full name |
| `username` | `String` | Required, Unique, Trimmed, Lowercase | Unique username identifier |
| `email` | `String` | Required, Unique, Lowercase | Unique email address |
| `password` | `String` | Required | Hashed password |
| `refreshToken` | `String` | Optional | Active refresh token string |
| `createdAt` | `Date` | Auto | Timestamp of account creation |
| `updatedAt` | `Date` | Auto | Timestamp of last account update |

### URL Schema (`Url`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `originalUrl` | `String` | Required, Trimmed | Target long URL |
| `shortCode` | `String` | Required, Unique, Indexed | Short identifier for link |
| `owner` | `ObjectId` | Ref `User` | Owner User reference ID |
| `clicks` | `Number` | Default: `0` | Total redirect click counter |
| `lastVisited` | `Date` | Default: `null` | Timestamp of last link visit |
| `expiresAt` | `Date` | Default: `null` | Optional expiration date |
| `createdAt` | `Date` | Auto | Creation timestamp |
| `updatedAt` | `Date` | Auto | Modification timestamp |

---

## 🔒 Security & Validation

1. **Password Encryption**: All passwords are encrypted using `bcrypt` before storage in MongoDB.
2. **Token Security**: Tokens are generated using standard HMAC SHA256 signatures with distinct access/refresh secrets and expiration limits.
3. **HTTP-only Cookies**: Cookies are configured with `httpOnly: true` and `secure: true` in production environments to mitigate XSS attacks.
4. **Input Sanitization**: User data is stripped of sensitive fields (password and refresh tokens) prior to sending client responses via `createSafeUser`.
5. **Database Protection**: Ownership checks prevent unauthorized users from accessing or deleting links created by others.

---

## 👨‍💻 Author & License

- **Author:** Salman Afridi
- **License:** ISC
