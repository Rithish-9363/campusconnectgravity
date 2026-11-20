# CampusConnect 🎓⚡
> **Smart Campus Event Discovery & Management Platform**

![CampusConnect Banner](https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200)

---

## 🌟 Executive Overview
**CampusConnect** is a modern, responsive web application engineered to bridge the gap between university students and campus event organisers. Students can explore hackathons, workshops, esports tournaments, and cultural nights, reserve seats in a single click, and receive instant digital QR admission passes. Organisers can publish events in less than 60 seconds with an integrated **AI Event Creator Copilot**, track live capacity and registrations, and export attendee rosters.

---

## 🚀 Key Features

### 1. 🔐 Authentication & Role-Based Access Control
- **Dual Role System**: Separate perspectives and permissions for **Students** and **Organisers**.
- **Instant 1-Click Demo Login**: Switch seamlessly between student and organiser roles without re-entering credentials for quick evaluation:
  - 🎓 **Student Demo**: `alex.student@campus.edu` (Alex Rivera — CS Junior & Hackathon enthusiast)
  - 🏛️ **Organiser Demo**: `sarah.lead@campus.edu` (Sarah Chen — President of Tech & Innovation Council)
- **Safe Authentication**: Bcrypt password hashing with signed JWT session tokens.
- **Privacy & Safety**: Pure dummy data; no real personal info used.

### 2. 🎓 Student Discovery Dashboard
- **Live Event Feed**: High-resolution cards featuring title, banner, date, time, venue, category, description, and real-time available seats.
- **Smart Category Filtering**: Technology, Hackathons, Workshops, Cultural, Sports, Career, Arts, and Gaming.
- **Dynamic Timeframe Filters**: 
  - ⚡ **Happening Today**: Real-time pulsing badge and live countdown.
  - 📅 **This Week**: Filter by current week's schedule.
  - 🚀 **Upcoming**: Browse all future campus activities.
- **Search & Sort**: Real-time fuzzy search by title, tags, or venue; sort by popularity, date, or remaining seats.
- **1-Click Registration**: One-tap registration with instant seat reservation and duplicate registration prevention.
- **Digital Admission QR Pass**: Generates a verified boarding-pass ticket with scannable QR code, attendee details, seat code, and print/PDF export.
- **My Events Wallet**: Dedicated view tracking confirmed registrations, event status, and a 1-click option to cancel and release seats back to the community.
- **Calendar Integration**: "Add to Google Calendar" / iCal export.

### 3. 🏛️ Organiser Dashboard & Analytics
- **Fast Event Creation (&lt; 1 Minute)**: Streamlined creation workflow with curated Unsplash campus image presets.
- **Full CRUD Capabilities**: Create, edit, and delete events with automatic attendee cleanup.
- **Real-Time Attendance & Roster**:
  - Live capacity gauge (e.g., 95/100 seats booked — 95% full).
  - Detailed attendee list with student name, email, department, and ticket code.
  - One-click **CSV Roster Export** for check-in desks.
- **Event Analytics**:
  - Total campus events published.
  - Overall student registrations and attendance rate.
  - Category distribution breakdown.
  - Live registration feed streaming incoming student bookings.

### 4. 🤖 AI Integration (Dual-Engine: Gemini API + Intelligent Campus NLP)
- **Feature 1 — AI Event Creator Copilot**:
  - Organisers enter a rough idea (e.g., *"24-hour hackathon with $5,000 in prizes, free pizza, and mentor clinics"*).
  - AI generates a high-converting title, engaging multi-paragraph description, suggested tags, and an itemized agenda schedule.
- **Feature 2 — AI Category Classifier**:
  - Automatically identifies the most accurate category and search tags based on event context.
- **Feature 3 — AI Personalized Event Matcher**:
  - Analyzes each student's profile interests, department, and previous event activity to compute match percentages (e.g., *"98% Match: Highly aligned with your Computer Science background & interest in AI Hackathons"*).
- **Zero-Failure Architecture**: Supports Google Gemini API (`GEMINI_API_KEY`). If no API key is configured, a built-in NLP heuristics engine seamlessly generates realistic, professional copy out of the box with zero runtime errors.

### 5. 💡 Smart Automation & Notifications
- **Duplicate Prevention**: Rejects duplicate signups with clear error handling.
- **Real-Time Capacity Management**: Automatically shifts event status to `FULL / SOLD OUT` when seat limits are met.
- **In-App Notification Center**:
  - Dynamic bell badge alerting students of upcoming events and confirmation passes.
  - Interactive **"Simulate Event Alert"** button for live evaluation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Pass Generation** | QRCode.js, Custom Print CSS Stylesheet |
| **Backend** | Node.js (v24), Express.js, CORS, Dotenv, Concurrently |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js |
| **Database** | Persistent File-based ACID JSON Store (`data/db.json`) |
| **AI Integration** | Google Gemini 1.5 Flash API + Intelligent Contextual Fallback Engine |

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/campusconnect.git
cd campusconnect

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Contents of `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=campusconnect_jwt_secret_dev_key_2026

# Optional: Add Google Gemini API key if desired
# GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, the built-in AI NLP engine handles all generation and recommendations seamlessly!)*

### 3. Run Development Servers
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 4. Production Build & Run
```bash
npm run build
npm start
```
Open `http://localhost:5000` in your browser.

---

## 🧪 Complete Demo Flow Walkthrough

Follow this step-by-step verification flow:

```
[1. Organiser Perspective]
   ├── Click "Organiser Demo" or switch role pill to 🏛️ Organiser
   ├── Click "AI Create Event (< 1 min)"
   ├── Type: "Game dev sprint 48 hours with unity and prizes"
   ├── Click "Generate Event" ➔ AI writes Title, Description, Tags, Agenda & Category!
   ├── Click "Publish Event" ➔ Event appears live with 0 registrations

[2. Student Discovery Perspective]
   ├── Switch role pill to 🎓 Student (Alex Rivera)
   ├── Notice personalized "Recommended for You" AI card
   ├── Search for "Game dev" in the hero search bar
   ├── Click "Register in 1-Click" ➔ Confetti triggers 🎉
   ├── Open "View Digital Pass" ➔ Scannable QR Ticket #CC-GAM-XXXX appears!
   ├── Try clicking register again ➔ Duplicate registration prevented

[3. Organiser Verification]
   ├── Switch back to 🏛️ Organiser
   ├── Locate the event in the management table
   ├── Notice registration count updated to 1
   └── Click "Attendees (1)" ➔ View Alex Rivera in roster & test "Export to CSV"
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication | No |
| `POST` | `/api/auth/demo-login` | 1-Click login for demo roles | No |
| `POST` | `/api/auth/signup` | Student / Organiser registration | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (JWT) |
| `GET` | `/api/events` | List events with search, category, timeframe | Optional |
| `GET` | `/api/events/:id` | Event details + registration status | Optional |
| `POST` | `/api/events` | Create new event | Yes (Organiser) |
| `PUT` | `/api/events/:id` | Update event | Yes (Organiser) |
| `DELETE` | `/api/events/:id` | Delete event & associated passes | Yes (Organiser) |
| `POST` | `/api/events/:id/register` | 1-Click student registration | Yes (Student) |
| `DELETE` | `/api/events/:id/register` | Cancel registration (releases seat) | Yes (Student) |
| `POST` | `/api/events/:id/interest` | Toggle bookmark / interest count | Yes |
| `GET` | `/api/user/registrations` | Fetch student's registered events | Yes (Student) |
| `GET` | `/api/events/:id/attendees` | Attendee roster for event | Yes (Organiser) |
| `POST` | `/api/ai/generate-event` | AI Event Copywriter | Yes |
| `POST` | `/api/ai/suggest-category`| AI Category classifier | No |
| `GET` | `/api/ai/recommendations` | Personalized event recommendations | Yes (Student) |
| `GET` | `/api/organiser/analytics`| Capacity & category analytics | Yes (Organiser) |
| `POST` | `/api/system/reset-demo` | Factory reset sample data | No |

---

## 🚢 Deployment Guide

### Deploy to Render / Railway / Heroku
1. Push this repository to GitHub.
2. In your cloud provider dashboard, create a **New Web Service**.
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_production_secret`
   - `PORT=5000` (or leave default assigned by host)
5. Deploy!

### Deploy with Docker
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
