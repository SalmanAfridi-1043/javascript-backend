# 📝 05Blog-api — Professional Production-Ready Blogging Platform REST API

> A robust, scalable, and feature-rich RESTful API built with **Node.js**, **Express 5**, and **MongoDB (Mongoose)** following clean architectural patterns (Controller-Service-Model), JWT authentication, cloud image processing, nested comment threads, user relationships, and real-time notifications.

---

## 🛠️ Tech Stack & Version Specifications

Below are the exact versions of the core technologies, frameworks, and packages powering this application:

| Technology / Library | Version / Spec | Purpose & Details |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (ES Modules) | JavaScript Runtime Environment (`"type": "module"`) |
| **Express.js** | `v5.2.1` | Next-generation Web Framework for Node.js |
| **MongoDB / Mongoose** | `v9.9.1` | Object Data Modeling (ODM) library for MongoDB |
| **jsonwebtoken (JWT)** | `v9.0.3` | Secure stateless token-based authentication |
| **bcrypt** | `v6.0.0` | Password hashing algorithm |
| **Multer** | `v2.2.0` | Middleware for handling `multipart/form-data` uploads |
| **Cloudinary SDK** | `v2.10.0` | Cloud media upload, processing, and management |
| **cookie-parser** | `v1.4.7` | Parse HTTP request header cookies |
| **CORS** | `v2.8.6` | Cross-Origin Resource Sharing configuration |
| **dotenv** | `v17.4.2` | Environment variables management |
| **Nodemon** | `v3.1.14` | Hot-reloading development server runner |

---

## ✨ Key Features & Capabilities

### 🔐 Auth & Security
- **Dual-Token System**: Short-lived Access Tokens (`15m`) and long-lived Refresh Tokens (`10d`).
- **Secure Cookie Storage**: Refresh tokens delivered in HTTP-only cookies.
- **Bcrypt Password Hashing**: Hashed passwords with custom salt rounds.
- **Protected Routes**: Route protection via standard `authMiddleware`.

### 👤 User Management & Social Interactions
- **User Profiles**: Custom avatars, bio, full name, and username handling.
- **Follow / Unfollow System**: Social network mechanics with follower and following counters.
- **Avatar Uploads**: Direct image upload powered by Multer + Cloudinary.

### 📰 Blog Post Lifecycle
- **Rich Post Creation**: Title, Markdown content, categories, tags, status (`draft` / `published`), and cover image.
- **Auto-Generated Slugs**: SEO-friendly URL slugs auto-slugified from post titles.
- **Post Search & Filters**: Search posts by query, filter by category slug, or view posts by author username.
- **View Tracker**: Track post view counts with automated increments.
- **Like / Unlike System**: Toggle likes on posts with unique compound indexing.

### 💬 Nested Comments System
- **Threaded Discussions**: Top-level comments and sub-comment replies via recursive schema self-referencing.
- **Reply Trees**: Fetch dedicated replies for specific parent comments.

### 🔔 Activity Notifications
- **Automated Triggers**: Notifications created on `like`, `comment`, and `follow` events.
- **Read / Unread Tracking**: Count unread notifications, mark individual or all notifications as read.
- **Notification Cleanup**: Utility endpoint to clean up old activity logs.

---

## 🏗️ Architecture & Folder Structure

The application follows strict **Layered Architecture** principles, separating route definitions, request validation, controller logic, service layer business operations, database models, and utility modules.

```
05Blog-api/
├── public/
│   └── temp/                   # Local temporary upload folder (Multer)
├── src/
│   ├── config/
│   │   └── db.config.js        # MongoDB database connection configuration
│   ├── controllers/            # Route request/response handlers
│   │   ├── auth.controller.js
│   │   ├── comment.controller.js
│   │   ├── notification.controller.js
│   │   ├── post.controller.js
│   │   └── user.controller.js
│   ├── middleware/             # Custom Express middlewares
│   │   ├── auth.middleware.js  # JWT validation & user attachment
│   │   └── multer.middleware.js# File upload handling
│   ├── models/                 # Mongoose schemas & models
│   │   ├── bookmark.model.js
│   │   ├── category.model.js
│   │   ├── comment.model.js
│   │   ├── follow.model.js
│   │   ├── like.model.js
│   │   ├── notification.model.js
│   │   ├── post.model.js
│   │   └── user.model.js
│   ├── routes/                 # Express router definitions
│   │   ├── auth.routes.js
│   │   ├── comment.routes.js
│   │   ├── notification.routes.js
│   │   ├── post.routes.js
│   │   └── user.routes.js
│   ├── services/               # Business logic & DB query layer
│   │   ├── auth.service.js
│   │   ├── comment.service.js
│   │   ├── notification.service.js
│   │   ├── post.service.js
│   │   └── user.service.js
│   ├── utils/                  # Core helpers & standardized classes
│   │   ├── ApiError.js         # Custom Error class
│   │   ├── ApiResponse.js      # Custom Response formatter
│   │   ├── asyncHandler.js     # Async catch wrapper
│   │   ├── cloudinary.js       # Cloudinary upload service
│   │   ├── cookieOptions.js    # Security cookie settings
│   │   ├── jwt.js              # Token generator utilities
│   │   ├── sanitizeUser.js     # Password stripping helper
│   │   ├── slugify.js          # URL slug converter
│   │   ├── validateObjectId.js # MongoDB ID validator
│   │   └── validateRequired.js # Required field validator
│   ├── validators/             # Request payload schema validators
│   │   └── auth.validator.js
│   ├── app.js                  # Express app setup & middleware stack
│   ├── constants.js            # Global constants (e.g., DB Name)
│   └── server.js               # Application entry point & DB listener
├── .env.sample                 # Environment configuration template
├── package.json
└── README.md
```

---

## 🚦 API Endpoints Reference

Base URL: `http://localhost:5000/api/v1`

### 1. Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new user (Supports single file upload: `avatar`) |
| `POST` | `/login` | Public | Authenticate user & return Access/Refresh tokens |
| `POST` | `/refresh-token` | Public | Issue new Access Token using valid Refresh Token |
| `POST` | `/logout` | Protected | Invalidate refresh token & clear cookie |

### 2. User & Profile Routes (`/api/v1/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Protected | Get authenticated user's profile |
| `PATCH` | `/profile` | Protected | Update profile info / avatar image |
| `GET` | `/:username` | Protected | Get public user profile by username |
| `POST` | `/:username/follow` | Protected | Follow a user by username |
| `DELETE` | `/:username/follow` | Protected | Unfollow a user by username |
| `GET` | `/:username/followers` | Protected | Get user's followers list |
| `GET` | `/:username/following` | Protected | Get user's following list |
| `GET` | `/:username/posts` | Protected | Get all published posts created by target user |

### 3. Post Routes (`/api/v1/posts`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Fetch all published blog posts |
| `GET` | `/search` | Public | Search posts by keyword (`?q=keyword`) |
| `GET` | `/category/:category` | Public | Get posts filtered by category |
| `GET` | `/:slug` | Public | Get a single blog post details by URL slug |
| `PATCH` | `/:slug/views` | Public | Increment post view counter |
| `POST` | `/create` | Protected | Create new post (Supports file upload: `coverImage`) |
| `PATCH` | `/:slug` | Protected | Update post content, title, or cover image |
| `DELETE` | `/:slug` | Protected | Delete post by slug |
| `POST` | `/:slug/like` | Protected | Like a post |
| `DELETE` | `/:slug/like` | Protected | Remove like from a post |

### 4. Comment Routes (`/api/v1/comments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/post/:slug` | Public | Get top-level comments for a post |
| `GET` | `/:commentId/replies` | Public | Get nested reply comments under a parent comment |
| `POST` | `/post/:slug` | Protected | Add a comment or reply to a post |
| `PATCH` | `/:commentId` | Protected | Edit comment content |
| `DELETE` | `/:commentId` | Protected | Delete a comment |

### 5. Notification Routes (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Fetch current user's notifications |
| `GET` | `/unread-count` | Protected | Get total unread notifications count |
| `PATCH` | `/:notificationId/read` | Protected | Mark specific notification as read |
| `PATCH` | `/read-all` | Protected | Mark all notifications as read |
| `DELETE` | `/:notificationId` | Protected | Delete a specific notification |
| `DELETE` | `/clean-up` | Protected | Purge old notifications |

---

## ⚙️ Environment Variables Configuration

Copy `.env.sample` to `.env` in the project root and fill in your credentials:

```bash
cp .env.sample .env
```

| Key | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `MONGODB_URL` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `BCRYPT_SALT_ROUNDS` | Salt rounds for password hashing | `10` |
| `CORS_ORIGIN` | Allowed origin for CORS requests | `*` or `http://localhost:3000` |
| `ACCESS_TOKEN_SECRET` | Secret key for Signing Access JWT | `your_super_secret_access_key` |
| `ACCESS_TOKEN_EXPIRY` | Lifetime of Access Token | `15m` |
| `REFRESH_TOKEN_SECRET` | Secret key for Signing Refresh JWT | `your_super_secret_refresh_key` |
| `REFRESH_TOKEN_EXPIRY` | Lifetime of Refresh Token | `10d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI
- **Cloudinary Account**: For image storage

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SalmanAfridi-1043/javascript-backend.git
   cd javascript-backend/05Blog-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.sample .env
   # Edit .env file with your credentials
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`.

---

## 📊 Standardized Response Schemas

All API responses follow a uniform JSON structure.

### Success Response (`ApiResponse`)
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "64f1ab2c89e1a20012345678",
      "fullName": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com"
    }
  },
  "message": "User logged in successfully",
  "success": true
}
```

### Error Response (`ApiError`)
```json
{
  "statusCode": 401,
  "message": "Invalid access token or token expired",
  "errors": [],
  "success": false
}
```

---

## 👨‍💻 Author & License

- **Author**: [Salman Afridi](https://github.com/SalmanAfridi-1043)
- **License**: [ISC License](LICENSE)
