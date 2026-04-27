# 🛡️ Scam Detection Platform  -----

A production-ready backend API for detecting phishing URLs, scam messages, malicious QR codes, and fraudulent images. Built with **Node.js**, **Express.js**, and **MongoDB**.

Each analysis returns a **risk score (0–100)** with a human-readable explanation.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **URL Analysis** | Detect IP-based URLs, shorteners, suspicious TLDs, phishing keywords. Google Safe Browsing integration. |
| 💬 **Message Analysis** | Keyword matching, urgency detection, ALL CAPS check. OpenAI intent classification. |
| 📱 **QR Code Scan** | Decode QR codes from uploaded images and analyse extracted URLs. |
| 🖼️ **Image Analysis** | AI-powered scam content detection using OpenAI Vision API. |
| 🔐 **Authentication** | JWT-based auth with user/admin roles. |
| 📊 **Scan History** | Full scan history with pagination, filtering, and admin statistics. |
| 📖 **API Docs** | Interactive Swagger UI documentation. |
| 🛡️ **Security** | Helmet, CORS, rate limiting, input validation (Joi). |

---

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Joi
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS, express-rate-limit
- **File Upload:** Multer
- **QR Decoding:** Jimp + jsQR
- **AI:** OpenAI API (GPT-4o-mini + Vision)
- **Docs:** Swagger (swagger-jsdoc + swagger-ui-express)

---

## 📂 Folder Structure

```
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app configuration
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── env.js               # Centralised env config
│   │   └── swagger.js           # Swagger/OpenAPI setup
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── url.controller.js
│   │   ├── message.controller.js
│   │   ├── qr.controller.js
│   │   ├── image.controller.js
│   │   └── history.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── upload.middleware.js
│   │   └── rateLimiter.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   └── ScanHistory.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── url.routes.js
│   │   ├── message.routes.js
│   │   ├── qr.routes.js
│   │   ├── image.routes.js
│   │   └── history.routes.js
│   ├── services/
│   │   ├── url.service.js
│   │   ├── message.service.js
│   │   ├── qr.service.js
│   │   ├── image.service.js
│   │   └── history.service.js
│   └── utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       ├── logger.js
│       └── validators.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/GDG-Solution.git
cd GDG-Solution

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start the development server
npm run dev
```

The server will start at `http://localhost:5000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `GOOGLE_SAFE_BROWSING_API_KEY` | No | Enables Google Safe Browsing checks |
| `OPENAI_API_KEY` | No | Enables AI message/image analysis |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default: 100) |

> **Note:** The platform works without external API keys — heuristic-based scoring is always active. API keys enhance accuracy.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register a new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/profile` | Get user profile | Protected |

### Scan Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/scan/url` | Analyse a URL | Optional |
| POST | `/api/v1/scan/message` | Analyse a text message | Optional |
| POST | `/api/v1/scan/qr` | Scan a QR code image | Optional |
| POST | `/api/v1/scan/image` | Analyse an image | Optional |

### History & Stats

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/history` | Get user scan history | Protected |
| GET | `/api/v1/history/stats` | Get scan statistics | Admin |
| GET | `/api/v1/history/:id` | Get single scan entry | Protected |

### System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Health check | Public |
| GET | `/api/docs` | Swagger API documentation | Public |

---

## 🧪 Example Requests

### Analyse a URL

```bash
curl -X POST http://localhost:5000/api/v1/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://192.168.1.1/login/verify-account"}'
```

### Analyse a Message

```bash
curl -X POST http://localhost:5000/api/v1/scan/message \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT! Your account has been suspended. Click here to verify: http://bit.ly/abc123"}'
```

### Scan a QR Code

```bash
curl -X POST http://localhost:5000/api/v1/scan/qr \
  -F "file=@qr-code.png"
```

### Analyse an Image

```bash
curl -X POST http://localhost:5000/api/v1/scan/image \
  -F "file=@suspicious-screenshot.png"
```

---

## 📄 License

ISC
