import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "@/lib/api";
import { toast } from "sonner";
import { setAuthUser, setSuggestedUsers } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers = [], user } = useSelector((store) => store.auth);

  const [loadingId, setLoadingId] = useState(null);

  // remove logged-in user from suggestions
  const filteredUsers = useMemo(() => {
    return suggestedUsers.filter((u) => u?._id && u._id !== user?._id);
  }, [suggestedUsers, user?._id]);

  // --------------------------------------------------
  // FOLLOW HANDLER
  // --------------------------------------------------
  const followHandler = async (id) => {
    if (!id || loadingId) return;

    try {
      setLoadingId(id);

      const res = await api.post(`/user/followorunfollow/${id}`);

      if (res.data.success) {
        toast.success(res.data.message || "Action completed");

        // --------------------------------------------
        // 1) Update logged-in user's following list
        // --------------------------------------------
        if (Array.isArray(res.data.currentUserFollowing)) {
          dispatch(
            setAuthUser({
              ...user,
              following: res.data.currentUserFollowing,
            })
          );
        }

        // --------------------------------------------
        // 2) Remove only when action = follow
        // --------------------------------------------
        if (res.data.action === "follow") {
          const updatedUsers = suggestedUsers.filter((u) => u._id !== id);
          dispatch(setSuggestedUsers(updatedUsers));
        }
      }
    } catch (error) {
      console.error("FOLLOW SUGGESTION ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="mt-6 text-sm text-gray-500">
        No suggestions available
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-sm text-gray-600">
          Suggested for you
        </h1>
        <span className="text-xs font-medium text-gray-500 cursor-pointer hover:text-black">
          See All
        </span>
      </div>

      {/* USERS */}
      <div className="flex flex-col gap-4">
        {filteredUsers.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between gap-3"
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/profile/${u._id}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.profilePicture || ""} alt={u.username} />
                  <AvatarFallback>
                    {u.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="min-w-0">
                <Link
                  to={`/profile/${u._id}`}
                  className="font-semibold text-sm hover:underline block truncate"
                >
                  {u.username}
                </Link>

                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {u.bio?.trim() || "Suggested for you"}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <button
              type="button"
              onClick={() => followHandler(u._id)}
              disabled={loadingId === u._id}
              className={`text-xs font-bold transition ${
                loadingId === u._id
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#0095F6] hover:text-[#1877F2]"
              }`}
            >
              {loadingId === u._id ? "Following..." : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SuggestedUsers);