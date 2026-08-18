# 💰 ExpenseTracker API — Production-Grade Financial Engine

A robust, enterprise-ready **RESTful Expense Tracking & Financial Analytics Backend** built with **Node.js**, **Express.js (v5)**, **MongoDB**, and **Mongoose (v9)**. 

Designed following modern software engineering practices—including **Layered Architecture (Controller-Service-Repository)**, **JWT Dual-Token Authentication**, **Cron-based Automated Task Scheduling**, and **Advanced MongoDB Aggregation Pipelines**.

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [System Architecture & Technology Stack](#-system-architecture--technology-stack)
- [Architecture & Data Flow Diagrams](#-architecture--data-flow-diagrams)
- [Directory Structure](#-directory-structure)
- [Database Models & Entity Relationships](#-database-models--entity-relationships)
- [Core Functional Modules](#-core-functional-modules)
  - [1. Authentication & Security](#1-authentication--security)
  - [2. Transaction Management & Filtering](#2-transaction-management--filtering)
  - [3. Automated Recurring Transaction Scheduler](#3-automated-recurring-transaction-scheduler)
  - [4. Budget Management & Alert System](#4-budget-management--alert-system)
  - [5. Advanced Financial Analytics Engine](#5-advanced-financial-analytics-engine)
- [API Reference & Endpoint Specifications](#-api-reference--endpoint-specifications)
- [Error Handling & API Standard Response](#-error-handling--api-standard-response)
- [Environment Setup & Installation](#-environment-setup--installation)
- [License & Author](#-license--author)

---

## ✨ Features Overview

- 🔒 **Secure Dual-Token Authentication**: JWT Access Tokens (short-lived) & Refresh Tokens (long-lived) stored in secure HTTP-Only Cookies or Authorization headers.
- 💳 **Transaction Tracking**: Comprehensive Income and Expense logging with category linkage, payment method tags, notes, and custom date timestamps.
- 🔍 **Dynamic Filtering, Searching & Pagination**: Multi-parameter search queries using Regex matching, date-range filtering (`$gte`, `$lte`), dynamic field sorting, and offset pagination.
- ⏰ **Automated Recurring Engine**: Background cron job powered by `node-cron` running daily to process recurring payments automatically without manual intervention.
- 📊 **Budget Goal & Health Monitoring**: Category-level monthly expense budget tracking with real-time health indicators (`under_budget`, `near_limit`, `over_budget`), alerts, and month-over-month comparisons.
- 📈 **Advanced Analytics Pipelines**: 12+ MongoDB aggregation pipelines delivering deep financial insights—including income/expense trends, weekday spending habits, top categories, and payment method summaries.
- 🛡️ **Robust Error Handling & Input Validation**: Centralized error middleware handling Mongoose validation errors, duplicate key conflicts (`E11000`), and payload normalization.

---

## 🏗️ System Architecture & Technology Stack

### Tech Stack

| Component | Technology | Version / Details |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js | ES Modules (`import/export`) |
| **Framework** | Express.js | `v5.2.1` |
| **Database** | MongoDB | Cloud Atlas / Local Instance |
| **ODM Layer** | Mongoose | `v9.9.2` |
| **Security & Auth** | JSON Web Token & Bcrypt | `jsonwebtoken v9`, `bcrypt v6` |
| **Task Scheduler** | Node Cron | `node-cron v4.6` |
| **Middleware** | Cookie Parser & CORS | `cookie-parser`, `cors` |
| **Dev Environment** | Nodemon & Dotenv | `nodemon v3`, `dotenv v17` |

### Architectural Pattern: Layered (Controller-Service-Repository)

```
┌─────────────────────────────────────────────────────────────┐
│                       HTTP Client                           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Request (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express Router & Middleware                │
│     (CORS, Cookie Parser, Body Parser, Auth Middleware)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Validated Request Payload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                         │
│     (Request handling, Response wrapping via ApiResponse)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Business Data & User Context
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service / Business Layer                  │
│  (Business rules, Validators, Aggregations, Transactions)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose Queries & Aggregations
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                       │
│        (Mongoose Models: User, Transaction, Category, Budget)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongo Wire Protocol
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                        │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🔄 Architecture & Data Flow Diagrams

### Request Lifecycle Flow

```
[Client Request]
       │
       ▼
[app.js Entrypoint] ────────► [CORS & Cookie Parser Middleware]
       │
       ▼
[Auth Middleware] ──────────► Verifies Access Token / Extract User ID
       │
       ▼
[Route Validator] ──────────► Validates payload schemas & sanitizes input
       │
       ▼
[Controller Handler] ───────► Wraps execution in asyncHandler()
       │
       ▼
[Service Logic] ────────────► Executes business operations / Mongo Aggregations
       │
       ▼
[Database / Mongoose] ──────► Reads / Writes to MongoDB Collections
       │
       ▼
[ApiResponse Utility] ──────► Formats standard JSON success response
       │
       ▼
[Error Middleware] ─────────► (If exception caught) Formats standard JSON error
```

### Recurring Transaction Background Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 Node-Cron Daily Scheduler                   │
│                    (Trigger: 0 0 * * *)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Midnight Execution
                               ▼
┌─────────────────────────────────────────────────────────────┐
│         processRecurringTransactionsService()               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Query: { recurring: true }
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Calculate Next Date & Check Duplication         │
└──────────────────────────────┬──────────────────────────────┘
                               │ If Due & Not Created
                               ▼
┌─────────────────────────────────────────────────────────────┐
│   1. Create New Child Transaction (with recurringTransactionId) │
│   2. Advance Parent Transaction Date to Next Frequency       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 📁 Directory Structure

```
06Expense-tracker-api/
├── public/                     # Static file directory
├── src/
│   ├── config/                 # Environment & database configurations
│   │   └── db.config.js        # MongoDB connection setup via Mongoose
│   ├── controllers/            # Controller handlers for HTTP endpoints
│   │   ├── analytics.controller.js
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── recurring.controller.js
│   │   └── transaction.controller.js
│   ├── middleware/             # Custom Express middlewares
│   │   ├── auth.middleware.js   # JWT authentication & session guard
│   │   └── error.middleware.js  # Global centralized error handler
│   ├── models/                 # Mongoose schemas & data models
│   │   ├── budget.model.js
│   │   ├── category.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   ├── routes/                 # Express route declarations
│   │   ├── analytics.routes.js
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── recurring.routes.js
│   │   └── transaction.routes.js
│   ├── schedulers/             # Background automated cron tasks
│   │   └── recurringTransaction.scheduler.js
│   ├── services/               # Core business logic & DB aggregation services
│   │   ├── analytics.service.js
│   │   ├── auth.service.js
│   │   ├── budget.service.js
│   │   ├── recurring.service.js
│   │   └── transaction.service.js
│   ├── utils/                  # Reusable utility modules
│   │   ├── ApiError.js         # Custom error class extending Error
│   │   ├── ApiResponse.js      # Standardized response wrapper
│   │   ├── asyncHandler.js     # Async wrapper for route controllers
│   │   ├── cookieOptions.js    # HTTP-Only cookie configuration
│   │   ├── jwt.js              # Token generation helpers
│   │   ├── sanitizeUser.js     # Password/RefreshToken stripped response helper
│   │   ├── validateObjectId.js # MongoDB ObjectId validation helper
│   │   └── validateRequired.js # Field presence validator
│   ├── validators/             # Input payload schema & type validation
│   │   ├── auth.validator.js
│   │   ├── budget.validator.js
│   │   ├── recurring.validator.js
│   │   └── transaction.validator.js
│   ├── app.js                  # Express app initialization & route mounting
│   ├── constants.js            # Global project constants
│   └── server.js               # Application bootstrap & port listener
├── .env.sample                 # Sample environment variables configuration
├── package.json                # Project dependencies & npm scripts
└── README.md                   # Project documentation
```

---

## 🗄️ Database Models & Entity Relationships

```
┌──────────────────┐               ┌──────────────────┐
│       User       │               │     Category     │
├──────────────────┤               ├──────────────────┤
│ _id              │◄──────┐       │ _id              │◄──────┐
│ fullName         │       │       │ name             │       │
│ username         │       │       │ type (income/exp)│       │
│ email            │       │       │ user (ref User)  │       │
│ password         │       │       └─────────▲────────┘       │
│ refreshToken     │       │                 │                │
└──────────────────┘       │                 │                │
        ▲                  │                 │                │
        │                  │                 │                │
        │ (1:N)            │ (1:N)           │ (1:N)          │ (1:N)
        │                  │                 │                │
┌───────┴──────────┐       │       ┌─────────┴────────┐       │
│   Transaction    │       └───────┤      Budget      ├───────┘
├──────────────────┤               ├──────────────────┤
│ _id              │               │ _id              │
│ user (ref User)  │               │ user (ref User)  │
│ type (income/exp)│               │ category (ref)   │
│ amount           │               │ amount           │
│ description      │               │ month (1-12)     │
│ category (ref)   │               │ year             │
│ paymentMethod    │               └──────────────────┘
│ date             │
│ notes            │
│ recurring (bool) │
│ frequency        │
│ recurringTransId ├─┐ (Self ref: parent transaction)
└──────────────────┘ │
        ▲            │
        └────────────┘
```

### Collection Fields Detail

1. **`User`**
   - `fullName`: String (Required, trimmed)
   - `username`: String (Required, unique, lowercase, trimmed)
   - `email`: String (Required, unique, lowercase, trimmed)
   - `password`: String (Required, hashed via bcrypt)
   - `refreshToken`: String (Default: `null`)

2. **`Category`**
   - `name`: String (Required, unique, trimmed)
   - `type`: String (Enum: `["income", "expense"]`)
   - `user`: ObjectId (Ref: `User`, default `null` for system-wide categories)

3. **`Transaction`**
   - `user`: ObjectId (Ref: `User`, Required)
   - `type`: String (Enum: `["income", "expense"]`, Required)
   - `amount`: Number (Required)
   - `description`: String (Required, trimmed)
   - `category`: ObjectId (Ref: `Category`, Required)
   - `paymentMethod`: String (Enum: `["cash", "bank", "card", "wallet"]`, Required)
   - `date`: Date (Required)
   - `notes`: String (Optional)
   - `recurring`: Boolean (Default: `false`)
   - `frequency`: String (Enum: `["daily", "weekly", "monthly", "yearly"]`)
   - `recurringTransactionId`: ObjectId (Ref: `Transaction`, default `null`)

4. **`Budget`**
   - `user`: ObjectId (Ref: `User`, Required)
   - `category`: ObjectId (Ref: `Category`, Required, expense category only)
   - `amount`: Number (Required, Min: `0.01`)
   - `month`: Number (Required, Min: `1`, Max: `12`)
   - `year`: Number (Required)

---

## ⚙️ Core Functional Modules

### 1. Authentication & Security
- **Dual JWT Strategy**: Issues short-lived access tokens (`15m` default) and long-lived refresh tokens (`10d` default).
- **Secure Cookies**: Refresh and Access tokens sent in HTTP-Only cookies to protect against Cross-Site Scripting (XSS).
- **Password Protection**: Salted hashing with `bcrypt` using standard cost factor (`10`).
- **Safe Sanitization**: Strips sensitive properties (`password`, `refreshToken`) before returning user data.

### 2. Transaction Management & Filtering
- Supports dynamic filter conditions (`type`, `categoryId`, `paymentMethod`, `from`, `to` dates).
- Integrated Regex text search on `description` and `notes`.
- Multi-field dynamic sorting (`date`, `-date`, `amount`, `-amount`, `createdAt`).
- Offset pagination returning structured metadata (`page`, `limit`, `totalPages`, `hasNextPage`, `hasPreviousPage`).

### 3. Automated Recurring Transaction Scheduler
- Runs daily at `00:00` via `node-cron`.
- Evaluates next due occurrence based on `frequency` (`daily`, `weekly`, `monthly`, `yearly`).
- Prevents duplicate execution by checking calendar date matches.
- Links child generated transactions to parent template via `recurringTransactionId`.

### 4. Budget Management & Alert System
- Allows users to set category-specific monthly spending limits.
- Evaluates actual spending via Mongoose `$lookup` pipeline.
- Calculates health state:
  - `under_budget`: Spending $\le 75\%-80\%$
  - `near_limit`: Spending between $80\%-100\%$
  - `over_budget`: Spending $> 100\%$
- Includes Month-over-Month (`$facet` aggregation) budget comparison.

### 5. Advanced Financial Analytics Engine
Uses MongoDB aggregation framework for real-time reporting:
- `getMonthlySummaryService`: Aggregates total income, expense, and net balance.
- `getCategorySpendingService`: Groups expenses by category and joins category metadata.
- `getMonthlyTrendsService`: Compares monthly income vs expense trends across an entire year.
- `getTopSpendingCategoriesService`: Ranks top N expense categories.
- `getSpendingByWeekdayService`: Analyzes spending patterns across days of the week (Sunday through Saturday).
- `getSpendingByPaymentMethodService`: Measures total expense distribution by payment method (`cash`, `bank`, `card`, `wallet`).

---

## 📡 API Reference & Endpoint Specifications

### Base URL: `/api/v1`

---

### 🔑 Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new user account | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue tokens | ❌ |
| `POST` | `/api/v1/auth/refresh-token` | Generate new access token using refresh token | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token & clear cookies | 🔒 |

#### `POST /api/v1/auth/register`
```json
// Request Body
{
  "fullName": "Salman Afridi",
  "username": "salmanafridi",
  "email": "salman@example.com",
  "password": "Password123"
}
```

---

### 💳 Transaction Endpoints (`/api/v1/transactions`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/transactions/` | Create a new transaction | 🔒 |
| `GET` | `/api/v1/transactions/` | List transactions with filters, search & pagination | 🔒 |
| `GET` | `/api/v1/transactions/:transactionId` | Retrieve single transaction details | 🔒 |
| `PATCH` | `/api/v1/transactions/:transactionId` | Update an existing transaction | 🔒 |
| `DELETE` | `/api/v1/transactions/:transactionId` | Delete a transaction | 🔒 |

#### Query Parameters for `GET /api/v1/transactions/`:
- `type`: `income` | `expense`
- `categoryId`: `String` (ObjectId)
- `paymentMethod`: `cash` | `bank` | `card` | `wallet`
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`
- `search`: `String` (Searches description and notes)
- `sortBy`: `date` | `-date` | `amount` | `-amount`
- `page`: `Number` (Default: `1`)
- `limit`: `Number` (Default: `10`)

---

### 🔄 Recurring Transaction Endpoints (`/api/v1/recurrings`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/recurrings/create` | Create a recurring transaction template | 🔒 |
| `GET` | `/api/v1/recurrings/` | Fetch all active recurring templates | 🔒 |
| `GET` | `/api/v1/recurrings/:transactionId` | Get single recurring template | 🔒 |
| `PATCH` | `/api/v1/recurrings/:transactionId` | Update recurring template details | 🔒 |
| `DELETE` | `/api/v1/recurrings/:transactionId` | Delete recurring template | 🔒 |
| `PATCH` | `/api/v1/recurrings/:transactionId/toggle` | Toggle active recurring state | 🔒 |
| `GET` | `/api/v1/recurrings/:transactionId/next-occurrence` | Calculate next occurrence date | 🔒 |
| `GET` | `/api/v1/recurrings/:transactionId/generate-next` | Manually generate next recurring occurrence | 🔒 |
| `GET` | `/api/v1/recurrings/:transactionId/history` | View execution history of generated child transactions | 🔒 |

---

### 🎯 Budget Endpoints (`/api/v1/budgets`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/budgets/` | Create a monthly category budget goal | 🔒 |
| `GET` | `/api/v1/budgets/` | List all budgets with category populated | 🔒 |
| `GET` | `/api/v1/budgets/:budgetId` | Get single budget item | 🔒 |
| `PATCH` | `/api/v1/budgets/:budgetId` | Update budget amount or period | 🔒 |
| `DELETE` | `/api/v1/budgets/:budgetId` | Remove a budget goal | 🔒 |
| `GET` | `/api/v1/budgets/vs-actual` | Compare budgeted amount vs actual expense spending | 🔒 |
| `GET` | `/api/v1/budgets/progress` | Budget progress with percentage used | 🔒 |
| `GET` | `/api/v1/budgets/status` | Budget status breakdown (`under_budget`, `near_limit`, `over_budget`) | 🔒 |
| `GET` | `/api/v1/budgets/summary` | Overall total budget vs total spent for a month | 🔒 |
| `GET` | `/api/v1/budgets/comparison` | Month-over-month budget comparison | 🔒 |
| `GET` | `/api/v1/budgets/alert` | Ranked list of critical/exceeded budget goals | 🔒 |

---

### 📊 Analytics Endpoints (`/api/v1/analytics`)

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/monthly` | Total income, total expense & balance for month | `month`, `year` |
| `GET` | `/api/v1/analytics/category-spending` | Monthly category spending breakdown | `month`, `year` |
| `GET` | `/api/v1/analytics/category-spending-yearly` | Yearly category spending breakdown | `year` |
| `GET` | `/api/v1/analytics/monthly-trend` | Month-by-month income vs expense trends | `year` |
| `GET` | `/api/v1/analytics/top-categories` | Top spending categories ranking | `year`, `limit` |
| `GET` | `/api/v1/analytics/payment-method-summary` | Income & expense per payment method | `year` |
| `GET` | `/api/v1/analytics/yearly-trend` | Yearly totals for income, expense & net balance | `year` |
| `GET` | `/api/v1/analytics/monthly-balance-trend` | Monthly balance progression across the year | `year` |
| `GET` | `/api/v1/analytics/average-transaction` | Average amount per transaction type | `year` |
| `GET` | `/api/v1/analytics/highest-expense` | Single highest expense transaction details | `year` |
| `GET` | `/api/v1/analytics/weekday-spending` | Total spending grouped by weekday (Sun-Sat) | `year` |
| `GET` | `/api/v1/analytics/payment-method-spending` | Total expenses by payment method | `year` |

---

## 🛠️ Error Handling & API Standard Response

### Success Response Format (`ApiResponse`)
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully",
  "success": true
}
```

### Error Response Format (`ApiError` / `errorHandler`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Password must contain uppercase, lowercase and digit"
  ]
}
```

### Standardized Status Codes

| Code | Description | Trigger Scenario |
| :---: | :--- | :--- |
| `200` / `201` | Success / Created | Request processed successfully |
| `400` | Bad Request | Validation failure / invalid parameter payload |
| `401` | Unauthorized | Missing, invalid, or expired JWT token |
| `404` | Not Found | Resource or endpoint does not exist |
| `409` | Conflict | Duplicate entry (e.g., username/email or duplicate budget) |
| `500` | Internal Server Error | Unhandled server exception |

---

## 🚀 Environment Setup & Installation

### Prerequisites
- **Node.js** (`v18.x` or higher)
- **MongoDB** (Local instance running on `27017` or MongoDB Atlas Cluster URI)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd 06Expense-tracker-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of `06Expense-tracker-api` based on `.env.sample`:
   ```env
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/expense-tracker
   BCRYPT_SALT_ROUNDS=10
   CORS_ORIGIN=*

   ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
   ACCESS_TOKEN_EXPIRY=15m

   REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
   REFRESH_TOKEN_EXPIRY=10d
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Verify Server Health**:
   Send a GET request to `http://localhost:3000/`:
   ```json
   {
     "message": "ExpenseTracker-API is running"
   }
   ```

---

## 📝 License & Author

- **Author**: Salman Afridi
- **License**: ISC
- **Project**: Part of Backend Development Masterclass
