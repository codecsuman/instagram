<div align="center">

<img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram Clone" height="40"/>

# 📸 InstaApp — Instagram Clone

**A full-featured social media platform built with the MERN Stack**  
Authentication · Posts · Real-Time Chat · Follow System · Image Uploads

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Frontend-6366f1?style=for-the-badge)](https://instagram-ohuy.vercel.app/)
[![Backend](https://img.shields.io/badge/⚙️_Backend-API-10b981?style=for-the-badge)](https://instagram-2-jhsg.onrender.com)
[![GitHub](https://img.shields.io/badge/📂_Source-GitHub-0f172a?style=for-the-badge&logo=github)](https://github.com/codecsuman/instagram)

<br/>

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=flat-square&logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)

</div>

---

## ✨ Features at a Glance

| 🔐 Auth | 👤 Profile | 📷 Posts | 💬 Chat | ❤️ Social |
|:---:|:---:|:---:|:---:|:---:|
| JWT + HTTP-Only Cookies | Edit & Upload Avatar | Create, Like, Comment | Real-Time 1-on-1 | Follow / Unfollow |
| Secure Registration | View Other Profiles | Delete Own Posts | Socket.io Powered | User Suggestions |
| Protected Routes | Follow Tracking | Image Uploads | Online Status | Like System |
| Auto Logout | Public Profile Pages | Feed View | Message History | Comment Threads |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### 🎨 Frontend
- ⚛️ **React.js** (Vite)
- 🎯 **Redux Toolkit**
- 🌐 **Axios**
- 🎨 **Tailwind CSS**
- 🧩 **Radix UI**
- 🔀 **React Router DOM**

</td>
<td valign="top" width="33%">

### ⚙️ Backend
- 🟢 **Node.js**
- 🚂 **Express.js**
- 🍃 **MongoDB** (Mongoose)
- 🔑 **JWT Auth**
- 🍪 **Cookie Parser**
- 🔌 **Socket.io**
- ☁️ **Cloudinary**

</td>
<td valign="top" width="33%">

### 🔒 Security
- 🛡️ **Helmet**
- 🚦 **Rate Limiting**
- 🧹 **Mongo Sanitize**
- 🔐 **XSS Protection**
- 🔑 **bcrypt** Hashing
- 🍪 **HTTP-Only Cookies**
- 🔒 **Protected Routes**

</td>
</tr>
</table>

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/codecsuman/instagram.git
cd instagram
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=10000
MONGO_URI=YOUR_MONGODB_URI
SECRET_KEY=YOUR_SECRET_KEY
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:10000
VITE_SOCKET_URL=http://localhost:10000
```

Start the frontend dev server:

```bash
npm run dev
```

> 🌐 Frontend runs at `http://localhost:5173` · Backend runs at `http://localhost:10000`

---

## 📁 Project Structure

```
instagram/
│
├── Backend/
│   ├── controllers/        # Route logic & business rules
│   ├── middlewares/        # Auth, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── socket/             # Socket.io event handlers
│   ├── utils/              # Helper functions
│   └── index.js            # Entry point
│
├── frontend/
│   ├── src/                # React components, pages, store
│   ├── public/             # Static assets
│   └── package.json
│
└── README.md
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/api/v1/user/register` | Register a new user |
| `POST` | `/api/v1/user/login` | Login with credentials |
| `GET` | `/api/v1/user/logout` | Logout current session |
| `GET` | `/api/v1/user/profile` | Get current user profile |

### 📷 Posts

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/api/v1/post/addpost` | Create a new post |
| `GET` | `/api/v1/post/all` | Get all feed posts |
| `POST` | `/api/v1/post/:id/like` | Like or unlike a post |
| `POST` | `/api/v1/post/:id/comment` | Add a comment |
| `DELETE` | `/api/v1/post/delete/:id` | Delete a post |

### 💬 Messages

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/api/v1/message/send/:id` | Send a message to a user |
| `GET` | `/api/v1/message/all/:id` | Get conversation history |

---

## ☁️ Deployment

| Service | Platform | URL |
|---|:---:|---|
| 🎨 Frontend | Vercel | [instagram-ohuy.vercel.app](https://instagram-ohuy.vercel.app/) |
| ⚙️ Backend | Render | [instagram-2-jhsg.onrender.com](https://instagram-2-jhsg.onrender.com) |
| 🗄️ Database | MongoDB Atlas | Cloud-hosted |

---

## 👨‍💻 Developer

<div align="center">

**Suman Jhanp**

[![GitHub](https://img.shields.io/badge/GitHub-codecsuman-0f172a?style=for-the-badge&logo=github)](https://github.com/codecsuman)

*Full-Stack Developer · MERN Stack · DSA Enthusiast*

---

If you found this project useful, please consider giving it a ⭐ star on GitHub!  
It motivates continued development and open-source contributions. 🙏

**Happy Coding! 🚀**

</div>
