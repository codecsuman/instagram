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
  setSocket,
  setSocketConnected,
  setSocketId,
  resetReconnectAttempts,
  incrementReconnectAttempts,
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
    if (!user?._id) {
      // 🔥 cleanup redux socket state on logout
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

    // ✅ STORE SOCKET INSTANCE
    dispatch(setSocket(socket));

    // ✅ CONNECTION STATUS
    socket.on("connect", () => {
      dispatch(setSocketConnected(true));
      dispatch(setSocketId(socket.id));
      dispatch(resetReconnectAttempts());
    });

    socket.on("disconnect", () => {
      dispatch(setSocketConnected(false));
    });

    socket.on("reconnect_attempt", () => {
      dispatch(incrementReconnectAttempts());
    });

    // ✅ Online users
    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    // ✅ Real-time notifications
    socket.on("notification", (noti) => {
      dispatch(setLikeNotification(noti));
    });

    // ✅ CLEANUP
    return () => {
      socket.disconnect();
      dispatch(clearOnlineUsers());
      dispatch(setSocket(null));
    };
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
