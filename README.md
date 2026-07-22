<div align="center">

<br />

<pre>
██╗███╗   ██╗███████╗████████╗ █████╗  ██████╗ ██████╗  █████╗ ███╗   ███╗
██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
██║██╔██╗ ██║███████╗   ██║   ███████║██║  ███╗██████╔╝███████║██╔████╔██║
██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
██║██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
C L O N E
</pre>

### *Share moments. Connect instantly. Built on the MERN Stack.*

<br />

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge&logoColor=white)](instagram-beta-sage.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-10b981?style=for-the-badge)](https://your-backend-url.com)
[![GitHub Repo](https://img.shields.io/badge/📂%20GitHub-Repository-1f2937?style=for-the-badge&logo=github)](https://github.com/your-username/instagram-clone)

<br />

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference — Notifications](#-api-reference--notifications)
- [API Reference — Search & Explore](#-api-reference--search--explore)
- [API Reference — Posts](#-api-reference--posts)
- [API Reference — Follow System](#-api-reference--follow-system)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

**Instagram Clone** is a full-stack social media application built with the **MERN Stack**. It allows users to share photos, follow each other, like and comment on posts, chat in real time, and receive **persistent real-time notifications** for every important interaction.

> Built as a portfolio project to demonstrate full-stack development, REST API design, JWT authentication, WebSocket-based real-time features, and cloud media storage.

---

## ✨ Features

### 👤 User Features

| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | Registration and login with JWT-protected sessions |
| 🖼️ **Profile Management** | Bio, profile picture, followers, and following |
| 📸 **Post Creation** | Upload photos with captions via Cloudinary |
| 🖼️ **Multi-Photo Upload** | Attach up to **10 photos** in a single post |
| ❤️ **Like & Comment** | Real-time interaction on posts |
| 💬 **Direct Messaging** | Real-time 1:1 chat using Socket.io |
| 🔍 **Search Page** | Search users by **username** or **name** with live results |
| 🧭 **Explore Page** | Discover posts from users across the platform |
| 🔔 **Notifications** | Persistent, real-time alerts for likes, comments, follows, messages, and new posts |
| 🔗 **Click-to-Redirect** | Open the exact post or message thread directly from a notification |
| 🗄️ **Notification History** | Notifications are stored in MongoDB and survive refreshes |
| ✅ **Mark as Read** | Mark individual or all notifications as read with synced unread counts |
| 👥 **Real-Time Follow Counts** | Followers and following update instantly via Socket.io |
| 📱 **Responsive UI** | Smooth experience across mobile, tablet, and desktop |

### ⚙️ System Features

- 🔒 JWT authentication with protected routes
- 🌐 RESTful API architecture
- ⚡ Real-time updates via Socket.io for messages, notifications, and follow counts
- 🗄️ MongoDB Atlas with Redux Persist for resilient state handling
- ☁️ Cloudinary integration for multi-image uploads
- 🔔 Dual notification delivery: Socket.io for instant updates + REST API for persistence

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, Redux Toolkit, Redux Persist, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Real-Time** | Socket.io |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT, bcrypt.js |
| **File Upload** | Multer, Cloudinary |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version   # v18+ recommended
npm --version    # v9+ recommended
```

You will also need accounts for:

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com)

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
npm run dev
```

Backend runs at:

```bash
http://localhost:8000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
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
MAX_PHOTOS_PER_POST=10
```

### Frontend — `/frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> ⚠️ Never commit `.env` files. Make sure they are included in `.gitignore`.

---

## 🔔 API Reference — Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/notification/all` | Fetch all notifications for the logged-in user |
| `PATCH` | `/api/v1/notification/read` | Mark notification(s) as read |

**Notification Types:** `like` · `comment` · `follow` · `message` · `post`

Notifications are created server-side using a shared `createNotification()` helper, saved to MongoDB for persistence, and emitted instantly through Socket.io so the client updates in real time.

Each notification stores a `referenceId` (`postId` or `conversationId`) so clicking it on the frontend routes the user directly to `/post/:id` or `/messages/:conversationId`.

---

## 🔍 API Reference — Search & Explore

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/user/search?query=` | Search users by **username** or **name** |
| `GET` | `/api/v1/post/explore` | Fetch a paginated feed of posts from all users |

---

## 📸 API Reference — Posts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/post/create` | Create a new post with up to **10 photos** using `photos[]` |
| `GET` | `/api/v1/post/:id` | Get a single post by ID |
| `DELETE` | `/api/v1/post/:id` | Delete a post |

> Multi-photo uploads are handled with `multer` using an array field with a maximum of 10 files, then batch-uploaded to Cloudinary before the post document is saved.

---

## 👥 API Reference — Follow System

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/user/follow/:id` | Follow a user and emit a real-time follow update |
| `POST` | `/api/v1/user/unfollow/:id` | Unfollow a user and emit a real-time follow update |

Both the follower and the target user listen for the `follow-update` Socket.io event so follower/following counts update instantly without a page refresh.

---

## ☁️ Deployment

| Layer | Platform |
|---|---|
| 🌐 Frontend | [Vercel](https://vercel.com) |
| ⚙️ Backend | [Render](https://render.com) |
| 🗄️ Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| 🖼️ Media Storage | [Cloudinary](https://cloudinary.com) |

---

## 🔮 Future Enhancements

- [ ] 📖 Stories feature
- [ ] 🎥 Reels / short video posts
- [ ] 🔖 Saved posts
- [ ] 🌙 Dark mode toggle
- [ ] 📊 Profile analytics dashboard
- [ ] 🔕 Notification preferences
- [ ] 👥 Group chats

---

## 👨‍💻 Author

<div align="center">

<br />

**Suman Jhanp**

*MERN Stack Developer | Full-Stack Enthusiast*

<br />

[![GitHub](https://img.shields.io/badge/GitHub-codecsuman-1f2937?style=for-the-badge&logo=github)](https://github.com/codecsuman)
[![Portfolio](https://img.shields.io/badge/Portfolio-sumanjhanp.netlify.app-f59e0b?style=for-the-badge&logo=netlify)](https://sumanjhanp.netlify.app)

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.

---

<div align="center">

<br />

If this project helped you or sparked an idea, consider dropping a ⭐ on the repo.

<br />

**Made with ❤️ by Suman Jhanp**

*Happy Coding 🚀*

</div>


