# VedaAI — AI Assessment Creator

An AI-powered assessment creation platform that helps teachers generate structured question papers using NVIDIA's LLM API.

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Next.js App   │────▶│   Express API + WebSocket Server     │
│  (TypeScript)   │◀────│          (TypeScript)                │
│  Zustand Store  │ WS  │                                      │
└─────────────────┘     │  ┌──────────┐  ┌─────────────────┐  │
                        │  │  BullMQ  │──│  NVIDIA LLM API │  │
                        │  │  Worker  │  │  (OpenAI SDK)   │  │
                        │  └──────────┘  └─────────────────┘  │
                        │       │                              │
                        │  ┌────┴─────┐   ┌───────────┐       │
                        │  │ MongoDB  │   │   Redis   │       │
                        │  └──────────┘   └───────────┘       │
                        └──────────────────────────────────────┘
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 15, TypeScript, Zustand     |
| Backend   | Express, TypeScript                 |
| Database  | MongoDB (Mongoose)                  |
| Cache     | Redis (IORedis)                     |
| Queue     | BullMQ                              |
| WebSocket | ws                                  |
| AI        | NVIDIA API (OpenAI SDK)             |
| PDF       | PDFKit                              |

## Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for MongoDB + Redis)
- NVIDIA API Key

### 1. Clone & Install

```bash
git clone <repo-url>
cd Veda-ai

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Environment

```bash
# Copy and edit .env in project root
cp .env.example .env
# Add your NVIDIA_API_KEY
```

### 3. Start Services

```bash
# Start MongoDB + Redis
docker-compose up -d

# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

### 4. Access
- Frontend: http://localhost:3000
- API: http://localhost:5000
- WebSocket: ws://localhost:5001

## Flow

1. Teacher creates assignment with question types, marks, and optional file
2. Backend validates and stores in MongoDB
3. BullMQ job is enqueued for AI generation
4. Worker builds structured prompt → calls NVIDIA LLM API
5. Response is parsed (JSON), validated, and stored
6. WebSocket notifies frontend of completion
7. Teacher views structured question paper with difficulty tags
8. PDF download available via PDFKit

## Features

- ✅ Drag & drop file upload
- ✅ Dynamic question type configuration
- ✅ Real-time generation status via WebSocket
- ✅ Structured question paper with sections
- ✅ Difficulty tags (Easy / Moderate / Challenging)
- ✅ Answer key generation
- ✅ PDF export
- ✅ Regenerate capability
- ✅ Redis caching
- ✅ Input validation (Zod)
- ✅ Responsive design
