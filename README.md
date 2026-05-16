# 🚀 Stroovo — AI-Powered Team Collaboration Platform

Stroovo is an AI-powered SaaS platform for team collaboration, task management, and real-time communication — similar to ClickUp, Notion, and Monday.com.
**Visit Official Link** https:stroovo.revoticai.com

🔗 **GitHub:** [github.com/sayababbasi/stroovo](https://github.com/sayababbasi/stroovo)

---

## 🏗️ Project Structure

```
stroovo/
├── web/        → Next.js Frontend  (deploy to Vercel)
├── server/     → Node.js Backend   (deploy to Render)
└── package.json → Workspace root
```

---

## 💻 Getting Started (Local Development)

Run **both** frontend and backend with a single command:

```bash
npm run dev
```

- **Frontend** → http://localhost:3000
- **Backend**  → http://localhost:4000

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL via Neon + Prisma ORM
- **Auth:** JWT-based authentication
- **Real-time:** Socket.io

---

## 📦 Useful Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + backend together |
| `npm run dev:web` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build both for production |
| `.\easy_push.ps1` | Push code to GitHub easily |
| `.\sync_backup.ps1` | Create a local backup |

---

## 🌍 Deployment

| Service | Platform | Free? |
|---|---|---|
| Frontend | Vercel | ✅ Yes |
| Backend  | Render | ✅ Yes |
| Database | Neon   | ✅ Yes |

