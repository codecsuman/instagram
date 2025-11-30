import { useEffect, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import { setSocket } from "./redux/socketSlice";

import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoutes from "./components/ProtectedRoutes";

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
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {

    if (!user) return;
    if (socketRef.current) return;

    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"]
    });

    socketRef.current.on("connect", () => {
      dispatch(setSocket(socketRef.current));
    });

    socketRef.current.on("getOnlineUsers", users => {
      dispatch(setOnlineUsers(users));
    });

    socketRef.current.on("notification", data => {
      dispatch(setLikeNotification(data));
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      dispatch(setSocket(null));
    };

  }, [user]);

  return <RouterProvider router={router} />;
}

export default App;
