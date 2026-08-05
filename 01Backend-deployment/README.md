# 🚀 01. Backend Deployment & Express Fundamentals

![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-v5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

A foundational backend project demonstrating the setup of a modern Express server, environment variable management, HTML responses, and structured RESTful JSON API data delivery.

---

## 📌 Key Concepts Covered

- **Express Application Setup:** Initializing an Express app using Node.js CommonJS module syntax (`require`).
- **Environment Variables (`dotenv`):** Managing dynamic server ports securely via process environment variables.
- **RESTful Endpoints:** Creating route handlers for root (`/`), custom test routes (`/test`), and API data (`/api`).
- **Structured JSON Responses:** Returning complex nested JSON schemas containing user profiles, skills, and projects.
- **Production Server Readiness:** Fallback port assignment (`process.env.PORT || 3000`) and graceful server binding.

---

## 📁 Directory Tree Structure

```text
01Backend-deployment/
├── .env                # Environment variables configuration file
├── index.js            # Main Express server entry point
├── package.json        # Project metadata and dependency configuration
└── package-lock.json   # Locked dependency tree specification
```

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Response Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Basic welcome response | Plain Text |
| `GET` | `/test` | Formatted HTML header response | HTML (`<h1>`) |
| `GET` | `/api` | Returns structured user profile & project data | JSON Object |

### Example `/api` Response Schema

```json
{
  "status": "success",
  "message": "User data retrieved successfully",
  "timestamp": "2026-07-15T12:30:00Z",
  "data": {
    "user": {
      "id": 101,
      "name": "Ali Khan",
      "email": "ali.khan@example.com",
      "age": 22,
      "isActive": true,
      "roles": ["student", "developer"]
    },
    "profile": {
      "country": "Pakistan",
      "city": "Lahore",
      "skills": ["JavaScript", "Python", "React", "JSON"]
    },
    "projects": [
      {
        "id": 1,
        "title": "Portfolio Website",
        "status": "completed",
        "technologies": ["HTML", "CSS", "JavaScript"]
      }
    ]
  }
}
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
PORT=4000
```

---

## 🛠️ Installation & Quick Start

1. **Navigate to the directory:**
   ```bash
   cd 01Backend-deployment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Server runs on: `http://localhost:4000` (or `PORT` defined in `.env`)
   - Test API route: `http://localhost:4000/api`

---

## 📦 Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^5.2.1` | Web framework for Node.js |
| `dotenv` | `^17.4.2` | Load environment variables from `.env` |

---
*Created as part of the JavaScript Backend Development Series.*
