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

  // Public routes
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
    if (!user) return;

    // Create socket only when user is logged in
    const socket = io(import.meta.env.VITE_API_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    // Online users
    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    // Real-time notifications
    socket.on("notification", (noti) => {
      dispatch(setLikeNotification(noti));
    });

    // cleanup when component unmounts OR user logs out
    return () => {
      socket.disconnect();
    };
  }, [user]);

  return <RouterProvider router={router} />;
}

export default App;
