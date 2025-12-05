import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import ProtectedRoutes from "./components/ProtectedRoutes";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/socketSlice";
import { setLikeNotification } from "./redux/rtnSlice";

// Socket.io
import { io } from "socket.io-client";

// --------------------------------------------
// ROUTER
// --------------------------------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "profile/:id", element: <Profile /> },
      { path: "account/edit", element: <EditProfile /> },
      { path: "chat", element: <ChatPage /> },
    ],
  },

  // Public routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

// --------------------------------------------
// MAIN APP COMPONENT
// --------------------------------------------
function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    // ✅ MAKE SOCKET GLOBAL
    window._socket = socket;

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("notification", (noti) => {
      dispatch(setLikeNotification(noti));
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
    });

    // CLEANUP
    return () => {
      socket.disconnect();
      window._socket = null;
    };
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
