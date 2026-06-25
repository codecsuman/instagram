import React, { useState } from "react";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setSuggestedUsers, setUserProfile } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { clearNotifications } from "@/redux/rtnSlice";
import { clearOnlineUsers } from "@/redux/socketSlice";
import {
  setMessages,
  setSelectedChatUser,
} from "@/redux/chatSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);

  // FIXED: correct slice fields from rtnSlice
  const { notifications = [], unreadCount = 0 } = useSelector(
    (store) => store.realTimeNotification
  );

  const [openCreate, setOpenCreate] = useState(false);

  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------
  const logoutHandler = async () => {
    try {
      const res = await api.post("/user/logout");

      if (res.data.success) {
        // clear auth
        dispatch(setAuthUser(null));
        dispatch(setSuggestedUsers([]));
        dispatch(setUserProfile(null));

        // clear post state
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));

        // clear notifications
        dispatch(clearNotifications());

        // clear socket state
        dispatch(clearOnlineUsers());

        // clear chat state
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

  // ---------------------------------------------------
  // SIDEBAR CLICK HANDLER
  // ---------------------------------------------------
  const sidebarHandler = (text) => {
    switch (text) {
      case "Home":
        navigate("/");
        break;

      case "Messages":
        navigate("/chat");
        break;

      case "Profile":
        if (user?._id) {
          navigate(`/profile/${user._id}`);
        }
        break;

      case "Create":
        setOpenCreate(true);
        break;

      case "Search":
      case "Explore":
        toast.info(`${text} is coming soon...`);
        break;

      default:
        break;
    }
  };

  const sidebarItems = [
    { icon: <Home size={22} />, text: "Home" },
    { icon: <Search size={22} />, text: "Search" },
    { icon: <TrendingUp size={22} />, text: "Explore" },
    { icon: <MessageCircle size={22} />, text: "Messages" },
    { icon: <PlusSquare size={22} />, text: "Create" },
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
    },
    { icon: <LogOut size={22} />, text: "Logout" },
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
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg cursor-pointer p-3 my-1 text-left w-full relative"
            >
              {item.icon}
              <span>{item.text}</span>
            </button>
          ))}

          {/* NOTIFICATIONS */}
          <Popover
            onOpenChange={(open) => {
              if (open) {
                dispatch(clearNotifications());
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg cursor-pointer p-3 my-1 relative text-left w-full"
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

            <PopoverContent className="w-72">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={notif.uniqueKey || idx} className="flex items-center gap-3 my-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={notif.userDetails?.profilePicture || ""}
                        alt="user"
                      />
                      <AvatarFallback>
                        {notif.userDetails?.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <p className="text-sm leading-5">
                      <span className="font-semibold">
                        {notif.userDetails?.username || "Someone"}
                      </span>{" "}
                      {notif.message || "liked your post"}
                    </p>
                  </div>
                ))
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