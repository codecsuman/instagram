<div align="center">

<br/>

```
██╗███╗   ██╗███████╗████████╗ █████╗  ██████╗ ██████╗  █████╗ ███╗   ███╗
██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
██║██╔██╗ ██║███████╗   ██║   ███████║██║  ███╗██████╔╝███████║██╔████╔██║
██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
██║██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
                              C L O N E
```

### *Share moments. Connect instantly. Built on the MERN Stack.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge&logoColor=white)](#)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-10b981?style=for-the-badge)](#)
[![GitHub Repo](https://img.shields.io/badge/📂%20GitHub-Repository-1f2937?style=for-the-badge&logo=github)](#)

<br/>

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference — Notifications](#-api-reference--notifications)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🎯 About the Project

**Instagram Clone** is a full-stack social media application built on the **MERN Stack**, letting users share photos, follow each other, like and comment on posts, chat in real time, and receive **persistent, real-time notifications** for every interaction.

> Built as a portfolio project to demonstrate full-stack development: REST API design, WebSocket-based real-time features, JWT authentication, and cloud media storage.

---

## ✨ Features

### 👤 User Features
| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | Registration & Login with JWT-protected sessions |
| 🖼️ **Profile Management** | Bio, profile picture, followers/following |
| 📸 **Post Creation** | Upload photos with captions via Cloudinary |
| ❤️ **Like & Comment** | Real-time interaction on posts |
| 💬 **Direct Messaging** | Real-time 1:1 chat via Socket.io |
| 🔔 **Notifications** | Persistent, real-time alerts for likes, comments, follows, messages, and posts |
| 🗄️ **Notification History** | Notifications are saved to MongoDB and survive page refreshes |
| ✅ **Mark as Read** | Unread badge synced with backend, mark individual or all as read |
| 🔍 **Search & Explore** | Discover users and posts |
| 📱 **Responsive UI** | Works smoothly across all screen sizes |

### ⚙️ System Features
- 🔒 JWT Authentication & protected routes
- 🌐 RESTful API architecture
- ⚡ Real-time updates via Socket.io
- 🗄️ MongoDB Atlas + Redux Persist for offline-safe state
- ☁️ Cloudinary integration for image uploads
- 🔔 Dual notification delivery — Socket (instant) + REST API (persistent)

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FULL STACK OVERVIEW                    │
├─────────────────┬───────────────────────────────────────────┤
│  Frontend       │  React.js · Redux Toolkit · Redux Persist │
│                 │  Tailwind CSS · Axios                     │
│  Backend        │  Node.js · Express.js                     │
│  Real-Time      │  Socket.io                                │
│  Database       │  MongoDB Atlas · Mongoose ODM              │
│  Auth           │  JSON Web Tokens (JWT) · bcrypt.js         │
│  File Upload    │  Multer · Cloudinary                      │
│  Deployment     │  Vercel (FE) · Render (BE)                │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version   # v18+ recommended
npm --version    # v9+
```

You'll also need accounts for:
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — cloud database
- [Cloudinary](https://cloudinary.com) — image hosting

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/instagram-clone.git
cd instagram-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#-environment-variables)), then:

```bash
npm run dev
# Server running at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend — `/backend/.env`

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend — `/frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> ⚠️ **Never commit `.env` files.** Add them to `.gitignore`.

---

## 🔔 API Reference — Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/notification/all` | Fetch all notifications for the logged-in user |
| `PATCH` | `/api/v1/notification/read` | Mark notification(s) as read |

**Notification Types:** `like` · `comment` · `follow` · `message` · `post`

Notifications are created server-side via a shared `createNotification()` helper, saved to MongoDB for persistence, and emitted instantly over Socket.io so the client updates in real time.

---

## ☁️ Deployment

| Layer | Platform |
|---|---|
| 🌐 Frontend | [Vercel](https://vercel.com) |
| ⚙️ Backend | [Render](https://render.com) |
| 🗄️ Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| 🖼️ Media | [Cloudinary](https://cloudinary.com) |

---

## 🔮 Future Enhancements

- [ ] 📖 Stories feature
- [ ] 🎥 Reels / short video posts
- [ ] 🔖 Saved posts
- [ ] 🌙 Dark mode toggle
- [ ] 📊 Analytics dashboard for profiles
- [ ] 🔕 Notification preferences/settings
- [ ] 👥 Group chats

---

## 👨‍💻 Author

<div align="center">

<br/>

**Suman Jhanp**

*MERN Stack Developer | Full-Stack Enthusiast*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-codecsuman-1f2937?style=for-the-badge&logo=github)](https://github.com/codecsuman)
[![Portfolio](https://img.shields.io/badge/Portfolio-sumanjhanp.netlify.app-f59e0b?style=for-the-badge&logo=netlify)](https://sumanjhanp.netlify.app)

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add: your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br/>

If this project helped you or sparked an idea — drop a ⭐ on the repo!

<br/>

**Made with ❤️ by Suman Jhanp**

*Happy Coding 🚀*

</div>