import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "@/lib/api";
import { toast } from "sonner";
import { setAuthUser, setSuggestedUsers } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const suggestedUsers = useSelector((state) => state.auth.suggestedUsers) || [];
  const user = useSelector((state) => state.auth.user);

  const [loadingId, setLoadingId] = useState(null);

  const filteredUsers = useMemo(() => {
    return suggestedUsers.filter((u) => u?._id && u._id !== user?._id);
  }, [suggestedUsers, user?._id]);

  // --------------------------------------------------
  // FOLLOW HANDLER — optimistic: remove the card instantly,
  // only roll back if the request actually fails. This is
  // what makes the sidebar feel "real-time" without a refetch.
  // --------------------------------------------------
  const followHandler = async (id) => {
    if (!id || loadingId) return;

    const previousUsers = suggestedUsers;
    setLoadingId(id);

    dispatch(setSuggestedUsers(suggestedUsers.filter((u) => u._id !== id)));

    try {
      const res = await api.post(`/user/followorunfollow/${id}`);

      if (res.data.success) {
        toast.success(res.data.message || "Action completed");

        // Full replace of the logged-in user's data — this is what
        // keeps RightSidebar's mini profile card and Profile.jsx's
        // following-count both correct without extra requests.
        if (res.data.currentUser) {
          dispatch(setAuthUser(res.data.currentUser));
        }

        // Defensive: suggestions only ever show non-followed users,
        // so this branch should always be "follow" — but if the
        // backend ever reports "unfollow" here, restore the card.
        if (res.data.action === "unfollow") {
          dispatch(setSuggestedUsers(previousUsers));
        }
      } else {
        dispatch(setSuggestedUsers(previousUsers));
      }
    } catch (error) {
      console.error("FOLLOW SUGGESTION ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
      dispatch(setSuggestedUsers(previousUsers)); // rollback
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-sm text-gray-600">
          Suggested for you
        </h1>
        <span className="text-xs font-medium text-gray-500 cursor-pointer hover:text-black">
          See All
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {filteredUsers.map((u) => (
          <div key={u._id} className="flex items-center justify-between gap-3">
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