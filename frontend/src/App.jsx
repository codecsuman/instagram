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
import {
  setOnlineUsers,
  setSocketConnected,
  setSocketId,
  clearOnlineUsers,
} from "./redux/socketSlice";
import { setLikeNotification } from "./redux/rtnSlice";

// Socket.io
import { io } from "socket.io-client";

// --------------------------------------------
// ROUTES
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
      { path: "/", element: <Home /> },
      { path: "/profile/:id", element: <Profile /> },
      { path: "/account/edit", element: <EditProfile /> },
      { path: "/chat", element: <ChatPage /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

// --------------------------------------------
// MAIN APP
// --------------------------------------------
function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // If user logs out → reset socket state
    if (!user?._id) {
      dispatch(clearOnlineUsers());
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    // -----------------------------
    // SOCKET EVENTS
    // -----------------------------
    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
      dispatch(setSocketConnected(true));
      dispatch(setSocketId(socket.id));
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
      dispatch(setSocketConnected(false));
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("notification", (noti) => {
      dispatch(setLikeNotification(noti));
    });

    // -----------------------------
    // CLEANUP ON UNMOUNT / LOGOUT
    // -----------------------------
    return () => {
      socket.disconnect();
      dispatch(clearOnlineUsers());
    };
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
