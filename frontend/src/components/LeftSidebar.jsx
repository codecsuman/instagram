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
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { clearNotifications } from "@/redux/rtnSlice";
import { clearOnlineUsers } from "@/redux/socketSlice";
import { setMessages, setSelectedChatUser } from "@/redux/chatSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user = {} } = useSelector((store) => store.auth);

  // ✅ FIXED
  const { notifications = [] } = useSelector(
    (store) => store.realTimeNotification
  );

  const [openCreate, setOpenCreate] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await api.post("/user/logout");

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        dispatch(clearNotifications());
        dispatch(clearOnlineUsers());
        dispatch(setMessages([]));
        dispatch(setSelectedChatUser(null));

        toast.success("Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const sidebarHandler = (text) => {
    switch (text) {
      case "Home":
        navigate("/");
        break;
      case "Messages":
        navigate("/chat");
        break;
      case "Profile":
        navigate(`/profile/${user?._id}`);
        break;
      case "Create":
        setOpenCreate(true);
        break;
      default:
        toast.info(`${text} is coming soon...`);
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>
            {user?.username?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen border-r w-[250px] z-20 bg-white px-4">
      <div className="flex flex-col">
        <h1 className="my-8 font-bold text-xl">LOGO</h1>

        <div>
          {sidebarItems.map((item, i) => (
            <div
              key={i}
              onClick={() =>
                item.text === "Logout"
                  ? logoutHandler()
                  : sidebarHandler(item.text)
              }
              className="flex gap-3 items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer my-2"
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}

          {/* NOTIFICATIONS */}
          <Popover onOpenChange={(open) => open && dispatch(clearNotifications())}>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-3 hover:bg-gray-100 p-3 my-2 rounded-lg cursor-pointer relative">
                <Heart />
                <span>Notifications</span>

                {notifications.length > 0 && (
                  <Button
                    size="icon"
                    className="absolute right-3 top-1.5 h-5 w-5 bg-red-600 text-xs"
                  >
                    {notifications.length}
                  </Button>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-64">
              {notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="flex gap-2 items-center my-2">
                    <Avatar>
                      <AvatarImage src={notif.userDetails?.profilePicture} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">
                      <span className="font-bold">
                        {notif.userDetails?.username}
                      </span>{" "}
                      liked your post
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
