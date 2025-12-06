import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "@/lib/api";
import { toast } from "sonner";
import { setSuggestedUsers } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers, user } = useSelector((store) => store.auth);

  const [loadingId, setLoadingId] = useState(null);

  // Memoized filter to prevent unnecessary rerenders
  const filteredUsers = useMemo(() => {
    return suggestedUsers.filter((u) => u._id !== user?._id);
  }, [suggestedUsers, user]);

  // --------------------------
  // FOLLOW / UNFOLLOW HANDLER
  // --------------------------
  const followHandler = async (id) => {
    try {
      setLoadingId(id);

      const res = await api.post(`/user/followorunfollow/${id}`);

      if (res.data.success) {
        toast.success(res.data.message);

        const action = res.data.action; // backend should return: "follow" or "unfollow"

        // Remove from suggestions only if FOLLOW happens
        if (action === "follow") {
          const updated = suggestedUsers.filter((u) => u._id !== id);
          dispatch(setSuggestedUsers(updated));
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredUsers.length === 0)
    return <div className="my-10 text-gray-500 text-sm">No suggestions</div>;

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>

      {filteredUsers.map((u) => (
        <div
          key={u._id}
          className="flex items-center justify-between my-5"
        >
          {/* User Info */}
          <div className="flex items-center gap-2">
            <Link to={`/profile/${u._id}`}>
              <Avatar>
                <AvatarImage src={u.profilePicture} />
                <AvatarFallback>
                  {u.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div>
              <h1 className="font-semibold text-sm">
                <Link to={`/profile/${u._id}`}>{u.username}</Link>
              </h1>
              <span className="text-gray-600 text-xs">
                {u.bio || "Bio here..."}
              </span>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={() => followHandler(u._id)}
            disabled={loadingId === u._id}
            className={`text-xs font-bold cursor-pointer
              ${
                loadingId === u._id
                  ? "text-gray-400"
                  : "text-[#3BADF8] hover:text-[#3495d6]"
              }
            `}
          >
            {loadingId === u._id ? "..." : "Follow"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SuggestedUsers);
