import { useEffect, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";

// Pages / Components
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Signup from "./components/Signup";

// Redux actions
import {
  setOnlineUsers,
  setSocketConnected,
  setSocketId,
  clearOnlineUsers,
} from "./redux/socketSlice";
import { setLikeNotification } from "./redux/rtnSlice";

// --------------------------------------------------
// ROUTER
// --------------------------------------------------
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
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

// --------------------------------------------------
// APP
// --------------------------------------------------
function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    // --------------------------------------------------
    // NO USER -> DISCONNECT OLD SOCKET
    // --------------------------------------------------
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      window._socket = null;

      dispatch(clearOnlineUsers());
      return;
    }

    // --------------------------------------------------
    // PREVENT DUPLICATE CONNECTION
    // --------------------------------------------------
    if (socketRef.current) return;

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

    const socket = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    window._socket = socket; // for chat / RTM hooks

    // --------------------------------------------------
    // ONLINE USERS
    // --------------------------------------------------
    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(Array.isArray(users) ? users : []));
    });

    // --------------------------------------------------
    // REAL-TIME NOTIFICATIONS
    // --------------------------------------------------
    socket.on("notification", (notification) => {
      if (notification) {
        dispatch(setLikeNotification(notification));
      }
    });

    // --------------------------------------------------
    // SOCKET STATUS
    // --------------------------------------------------
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      dispatch(setSocketConnected(true));
      dispatch(setSocketId(socket.id));
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      dispatch(setSocketConnected(false));
      dispatch(setSocketId(null));
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      dispatch(setSocketConnected(false));
    });

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------
    return () => {
      socket.off("getOnlineUsers");
      socket.off("notification");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");

      socket.disconnect();
      socketRef.current = null;
      window._socket = null;

      dispatch(clearOnlineUsers());
    };
  }, [user?._id, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;