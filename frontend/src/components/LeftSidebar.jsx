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
import { clearNotifications, markAllRead } from "@/redux/rtnSlice";
import { clearOnlineUsers } from "@/redux/socketSlice";
import { setMessages, setSelectedChatUser } from "@/redux/chatSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);

  const { notifications = [], unreadCount = 0 } = useSelector(
    (store) => store.realTimeNotification,
  );

  const [openCreate, setOpenCreate] = useState(false);

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
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
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

          {/* NOTIFICATIONS */}
          <Popover
            onOpenChange={(open) => {
              // Only mark as read (reset badge) — never wipe the list on open
              if (open) dispatch(markAllRead());
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg cursor-pointer p-3 my-1 relative text-left w-full transition-all duration-200"
              >
                <Heart size={22} />
                <span>Notifications</span>

                {unreadCount > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    className="absolute right-3 top-2 h-5 w-5 rounded-full bg-red-600 text-[10px] hover:bg-red-600"
                  >
                    {unreadCount}
                  </Button>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold text-sm mb-3">Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Heart className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    When someone likes, comments, follows, messages, or posts,
                    you'll see it here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map((notif, idx) => (
                    <div
                      key={notif.uniqueKey || idx}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => {
                        if (notif.type === "follow") {
                          navigate(`/profile/${notif.userId}`);
                        } else if (notif.type === "message") {
                          navigate("/chat");
                        } else if (notif.postId) {
                          navigate(`/profile/${notif.userId}`);
                        }
                      }}
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={notif.userDetails?.profilePicture || ""}
                          alt="user"
                        />
                        <AvatarFallback>
                          {notif.userDetails?.username
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-sm leading-5 flex-1">
                        <span className="font-semibold">
                          {notif.userDetails?.username || "Someone"}
                        </span>{" "}
                        {notif.message || "liked your post"}
                      </p>

                      {notif.type === "post" && notif.postImage && (
                        <img
                          src={notif.postImage}
                          alt="post"
                          className="w-9 h-9 rounded object-cover"
                        />
                      )}

                      {getNotifIcon(notif.type)}
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
