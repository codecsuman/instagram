import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "@/lib/api";
import { toast } from "sonner";
import { setSuggestedUsers } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers = [], user } = useSelector((store) => store.auth);

  const [loadingId, setLoadingId] = useState(null);

  const filteredUsers = useMemo(() => {
    return suggestedUsers.filter((u) => String(u._id) !== String(user?._id));
  }, [suggestedUsers, user?._id]);

  const followHandler = async (id) => {
    try {
      setLoadingId(id);
      const res = await api.post(`/user/followorunfollow/${id}`);

      if (res?.data?.success) {
        toast.success(res.data.message || "Followed");

        // ✅ Always remove from suggested list immediately
        dispatch(
          setSuggestedUsers(
            suggestedUsers.filter((u) => u._id !== id)
          )
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Follow failed");
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredUsers.length === 0) {
    return <div className="my-10 text-gray-500 text-sm">No suggestions</div>;
  }

  return (
    <div className="my-10">
      <div className="flex justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>

      {filteredUsers.map((u) => (
        <div key={u._id} className="flex justify-between items-center my-5">

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
              <h1 className="text-sm font-semibold">
                <Link to={`/profile/${u._id}`}>{u.username}</Link>
              </h1>
              <span className="text-xs text-gray-600">
                {u.bio || "Bio here..."}
              </span>
            </div>
          </div>

          <button
            disabled={loadingId === u._id}
            onClick={() => followHandler(u._id)}
            className={`text-xs font-bold ${
              loadingId === u._id
                ? "text-gray-400"
                : "text-[#3BADF8] hover:text-[#3495d6]"
            }`}
          >
            {loadingId === u._id ? "..." : "Follow"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SuggestedUsers);
