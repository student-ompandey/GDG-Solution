<div align="center">

# 🛡️ SCAMSHIELD

**The ultimate threat detection agent.**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](#)

A high-fidelity, production-ready, full-stack platform for detecting phishing URLs, scam messages, malicious QR codes, and fraudulent images in real-time. 

[Explore Features](#-features) • [Getting Started](#-getting-started) • [API Reference](#-api-endpoints)
</div>

---

## ✨ Features

ScamShield combines a stunning, high-performance UI with a robust, heuristically-driven AI backend.

### 🎨 Premium Frontend (Client)
- **Deep-Space Dark Aesthetic**: Custom UI featuring *Abyss Black* (`#050507`) backgrounds with vivid *Signal Green* (`#00d992`) neon highlights.
- **Glassmorphism & Motion**: Immersive component design featuring frosted glass effects, glowing hover states, and smooth 60fps micro-animations.
- **Dynamic Threat Workflow**: Interactive SVG pipelines and infinite marquee scrolling displaying real-time system capabilities and supported platforms.

### 🧠 Intelligent Backend (Server)
- **🔗 URL Analysis**: Detects IP-based URLs, shorteners, suspicious TLDs, and phishing keywords. Integrates with Google Safe Browsing.
- **💬 Message Analysis**: Deep keyword matching, urgency detection, and OpenAI intent classification.
- **📱 QR Code Scan**: Decodes QR codes from uploaded images to analyze hidden URLs.
- **🖼️ Image Analysis**: AI-powered scam content detection using OpenAI Vision.
- **📊 Heuristic Scoring**: Returns a human-readable **Risk Score (0–100)** for every analyzed vector.

---

## 🏗️ Tech Stack

### Frontend (Client)
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS v4 (Custom Design System)
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **AI Processing:** OpenAI API (GPT-4o-mini + Vision)
- **Utilities:** Multer, Jimp, jsQR, Joi, Winston
- **Docs:** Swagger UI

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/student-ompandey/GDG-Solution.git
cd GDG-Solution
```

### 2. Backend Setup
```bash
# Install server dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start the development server
npm run dev
```
*The API will start at `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to the client directory
cd client

# Install client dependencies
npm install

# Start the Vite development server
npm run dev
```
*The UI will be accessible at `http://localhost:5173`.*

---

## ⚙️ Environment Variables (Server)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing |
| `OPENAI_API_KEY` | No | Enables AI message/image analysis |
| `GOOGLE_SAFE_BROWSING_API_KEY` | No | Enables Google Safe Browsing checks |

> **Note:** The platform works without external API keys — heuristic-based scoring is always active as a fallback.

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/auth/register` | Register a new user account |
| **POST** | `/api/v1/auth/login` | Authenticate user & receive JWT |
| **POST** | `/api/v1/scan/url` | Submit a URL for threat analysis |
| **POST** | `/api/v1/scan/message` | Submit text for scam/urgency analysis |
| **POST** | `/api/v1/scan/qr` | Upload a QR code for URL extraction & scan |
| **POST** | `/api/v1/scan/image` | Upload an image for AI vision analysis |
| **GET** | `/api/v1/history` | Retrieve paginated scan history |
| **GET** | `/api/docs` | View interactive Swagger documentation |

*(Detailed API payloads and responses can be tested via the Swagger UI available at `/api/docs` when the server is running).*

---

<div align="center">
  <p className="font-mono text-[10px] uppercase tracking-widest">
    © SCAMSHIELD_AGENT. ALL RIGHTS RESERVED.
  </p>
</div>
