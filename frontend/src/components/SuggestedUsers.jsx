import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "@/lib/api";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const suggestedUsers =
    useSelector((state) => state.auth.suggestedUsers) || [];
  const user = useSelector((state) => state.auth.user);

  const [loadingId, setLoadingId] = useState(null);

  // Get list of user IDs that the current user is following
  const followingIds = useMemo(() => {
    return new Set((user?.following || []).map((id) => id.toString()));
  }, [user?.following]);

  const filteredUsers = useMemo(() => {
    return suggestedUsers.filter((u) => u?._id && u._id !== user?._id);
  }, [suggestedUsers, user?._id]);

  const followHandler = async (targetUser) => {
    if (!targetUser?._id || loadingId) return;
    const targetId = targetUser._id;
    setLoadingId(targetId);

    try {
      const res = await api.post(`/user/followorunfollow/${targetId}`);

      if (res.data.success) {
        toast.success(res.data.message || "Action completed");

        // Update auth user with new following list
        // This automatically toggles the button via followingIds
        if (res.data.currentUser) {
          dispatch(setAuthUser(res.data.currentUser));
        }

        // REMOVED: No longer removing user from list on unfollow
        // User stays in suggestions, button just toggles
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="mt-6 text-sm text-gray-500">No suggestions available</div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-sm text-gray-600">
          Suggested for you
        </h1>
        <Link
          to="/explore"
          className="text-xs font-medium text-gray-500 hover:text-black transition"
        >
          See All
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {filteredUsers.map((u) => {
          const isFollowing = followingIds.has(u._id.toString());
          const isLoading = loadingId === u._id;

          return (
            <div
              key={u._id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Link to={`/profile/${u._id}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={u.profilePicture || ""}
                      alt={u.username}
                    />
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

              <button
                type="button"
                onClick={() => followHandler(u)}
                disabled={isLoading}
                className={`text-xs font-bold transition-all duration-200 ${
                  isLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : isFollowing
                      ? "text-gray-700 hover:text-red-500"
                      : "text-[#0095F6] hover:text-[#1877F2]"
                }`}
              >
                {isLoading
                  ? "Loading..."
                  : isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(SuggestedUsers);
