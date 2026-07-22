import React, { useState } from "react";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Image as ImageIcon,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setAuthUser,
  setSuggestedUsers,
  setUserProfile,
} from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  clearNotifications,
  markAllRead,
  setUnreadCount,
} from "@/redux/rtnSlice";
import { clearOnlineUsers } from "@/redux/socketSlice";
import { setMessages, setSelectedChatUser } from "@/redux/chatSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import useGetNotifications from "@/hooks/useGetNotifications";
import useMarkNotificationsRead from "@/hooks/useMarkNotificationsRead";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);
  const { notifications = [], unreadCount = 0 } = useSelector(
    (store) => store.realTimeNotification,
  );

  const [openCreate, setOpenCreate] = useState(false);

  // Fetch notifications on mount
  useGetNotifications();
  const { markAsRead } = useMarkNotificationsRead();

  const logoutHandler = async () => {
    try {
      const res = await api.post("/user/logout");

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSuggestedUsers([]));
        dispatch(setUserProfile(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        dispatch(clearNotifications());
        dispatch(clearOnlineUsers());
        dispatch(setMessages([]));
        dispatch(setSelectedChatUser(null));

        toast.success("Logged out successfully");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const sidebarHandler = (text) => {
    switch (text) {
      case "Home":
        navigate("/");
        break;
      case "Search":
        navigate("/search");
        break;
      case "Explore":
        navigate("/explore");
        break;
      case "Messages":
        navigate("/chat");
        break;
      case "Profile":
        if (user?._id) navigate(`/profile/${user._id}`);
        break;
      case "Create":
        setOpenCreate(true);
        break;
      default:
        break;
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "message":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case "post":
        return <ImageIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // 🆕 FIXED: use the actual sender object (notif.sender / notif.userDetails),
  // and actually select the chat user before navigating for message notifs
  const handleNotifClick = (notif) => {
    const senderUser = notif.sender || notif.userDetails;
    const senderId = senderUser?._id;

    if (notif.type === "message") {
      if (senderUser) {
        dispatch(setSelectedChatUser(senderUser));
      }
      navigate("/chat");
      return;
    }

    // like, comment, follow, post -> go to the sender's profile
    if (senderId) {
      navigate(`/profile/${senderId}`);
    }
  };

  const sidebarItems = [
    { icon: <Home size={22} />, text: "Home", path: "/" },
    { icon: <Search size={22} />, text: "Search", path: "/search" },
    { icon: <TrendingUp size={22} />, text: "Explore", path: "/explore" },
    { icon: <MessageCircle size={22} />, text: "Messages", path: "/chat" },
    { icon: <PlusSquare size={22} />, text: "Create", path: null },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture || ""} alt="profile" />
          <AvatarFallback>
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
      path: `/profile/${user?._id}`,
    },
    { icon: <LogOut size={22} />, text: "Logout", path: null },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen border-r border-gray-300 w-[250px] px-4 z-20 bg-white">
      <div className="flex flex-col h-full">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>

        <div className="flex flex-col">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                item.text === "Logout"
                  ? logoutHandler()
                  : sidebarHandler(item.text)
              }
              className={`flex items-center gap-3 rounded-lg cursor-pointer p-3 my-1 text-left w-full transition-all duration-200 ${
                isActive(item.path)
                  ? "font-bold bg-gray-100"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.text}</span>
            </button>
          ))}

          {/* NOTIFICATIONS POPOVER */}
          <Popover
            onOpenChange={(open) => {
              if (open) markAsRead();
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg cursor-pointer p-3 my-1 relative text-left w-full transition-all duration-200"
              >
                <Bell size={22} />
                <span>Notifications</span>

                {unreadCount > 0 && (
                  <span className="absolute right-3 top-2 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 max-h-[400px] overflow-y-auto p-0">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => dispatch(clearNotifications())}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1 px-4">
                    When someone likes, comments, follows, messages, or posts,
                    you'll see it here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif, idx) => (
                    <div
                      key={notif.uniqueKey || notif._id || idx}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 last:border-0 ${
                        !notif.read ? "bg-blue-50/30" : ""
                      }`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage
                          src={
                            notif.userDetails?.profilePicture ||
                            notif.sender?.profilePicture ||
                            ""
                          }
                          alt="user"
                        />
                        <AvatarFallback>
                          {(
                            notif.userDetails?.username ||
                            notif.sender?.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-5">
                          <span className="font-semibold">
                            {notif.userDetails?.username ||
                              notif.sender?.username ||
                              "Someone"}
                          </span>{" "}
                          {notif.message || "sent a notification"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString()
                            : "Just now"}
                        </p>
                      </div>

                      {notif.type === "post" &&
                        (notif.postImage || notif.post?.image) && (
                          <img
                            src={notif.postImage || notif.post?.image}
                            alt="post"
                            className="w-9 h-9 rounded object-cover shrink-0"
                          />
                        )}

                      <div className="shrink-0">{getNotifIcon(notif.type)}</div>
                    </div>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <CreatePost open={openCreate} setOpen={setOpenCreate} />
    </div>
  );
};

export default LeftSidebar;
