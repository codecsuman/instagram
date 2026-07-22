import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AtSign,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { setSelectedChatUser } from "@/redux/chatSlice";

const Profile = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useGetUserProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");
  const [followLoading, setFollowLoading] = useState(false);

  const { userProfile, user, profileLoading } = useSelector(
    (store) => store.auth,
  );

  const posts = Array.isArray(userProfile?.posts) ? userProfile.posts : [];
  const bookmarks = Array.isArray(userProfile?.bookmarks)
    ? userProfile.bookmarks
    : [];
  const followers = Array.isArray(userProfile?.followers)
    ? userProfile.followers
    : [];
  const following = Array.isArray(userProfile?.following)
    ? userProfile.following
    : [];

  const isLoggedInUserProfile =
    user?._id?.toString() === userProfile?._id?.toString();

  const isFollowing = useMemo(() => {
    if (!user?._id || !userProfile?._id) return false;
    return followers.some((id) => id.toString() === user._id.toString());
  }, [followers, user?._id]);

  const displayedPosts = useMemo(() => {
    if (activeTab === "saved" && isLoggedInUserProfile) return bookmarks;
    return posts;
  }, [activeTab, posts, bookmarks, isLoggedInUserProfile]);

  const followHandler = async () => {
    if (!userProfile?._id || followLoading || isLoggedInUserProfile) return;
    try {
      setFollowLoading(true);
      const res = await api.post(`/user/followorunfollow/${userProfile._id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.currentUser) dispatch(setAuthUser(res.data.currentUser));
        if (res.data.targetUser) dispatch(setUserProfile(res.data.targetUser));
      }
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  const messageHandler = () => {
    dispatch(
      setSelectedChatUser({
        _id: userProfile._id,
        username: userProfile.username,
        profilePicture: userProfile.profilePicture,
      }),
    );
    navigate("/chat");
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-pulse h-40 w-40 bg-gray-200 rounded-full" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center mt-20 text-gray-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="flex max-w-5xl mx-auto px-4 md:px-10">
      <div className="flex flex-col gap-20 p-8 w-full">
        <div className="grid md:grid-cols-2 gap-8">
          <section className="flex items-center justify-center md:justify-start">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilePicture || ""}
                alt="profile"
              />
              <AvatarFallback>
                {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xl font-semibold">
                {userProfile.username}
              </span>

              {isLoggedInUserProfile ? (
                <Link to="/account/edit">
                  <Button variant="secondary" className="h-8">
                    Edit profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    className={`h-8 transition-all duration-200 ${
                      isFollowing
                        ? "bg-gray-100 text-black hover:bg-gray-200 border border-gray-300"
                        : "bg-[#0095F6] hover:bg-[#1877F2] text-white"
                    }`}
                    onClick={followHandler}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : isFollowing ? (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        Following
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    className="h-8"
                    onClick={messageHandler}
                  >
                    Message
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm flex-wrap">
              <p>
                <span className="font-semibold">{posts.length}</span> posts
              </p>
              <p>
                <span className="font-semibold">{followers.length}</span>{" "}
                followers
              </p>
              <p>
                <span className="font-semibold">{following.length}</span>{" "}
                following
              </p>
            </div>

            <div>
              <p className="font-semibold">
                {userProfile?.bio || "No bio yet."}
              </p>
              <Badge variant="secondary" className="w-fit mt-2">
                <AtSign className="mr-1 h-4 w-4" />
                {userProfile.username}
              </Badge>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <button
              type="button"
              className={`py-3 cursor-pointer transition-all ${activeTab === "posts" ? "font-bold border-b border-black" : "text-gray-500"}`}
              onClick={() => setActiveTab("posts")}
            >
              POSTS
            </button>
            {isLoggedInUserProfile && (
              <button
                type="button"
                className={`py-3 cursor-pointer transition-all ${activeTab === "saved" ? "font-bold border-b border-black" : "text-gray-500"}`}
                onClick={() => setActiveTab("saved")}
              >
                SAVED
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-4">
            {displayedPosts.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 py-10">
                {activeTab === "posts" ? "No posts yet." : "No saved posts."}
              </p>
            )}
            {displayedPosts.map((post) => {
              const likes = Array.isArray(post?.likes) ? post.likes : [];
              const comments = Array.isArray(post?.comments)
                ? post.comments
                : [];

              // 🆕 Handle images array (backward compatible)
              const images = Array.isArray(post?.images)
                ? post.images
                : post?.image
                  ? [post.image]
                  : [];
              const hasMultipleImages = images.length > 1;

              return (
                <div key={post._id} className="relative group cursor-pointer">
                  <img
                    src={images[0] || "/fallback.png"}
                    alt="post"
                    className="rounded-sm aspect-square w-full object-cover"
                  />

                  {/* 🆕 Multiple images indicator */}
                  {hasMultipleImages && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <line x1="9" y1="3" x2="9" y2="21" />
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                    <div className="flex items-center text-white space-x-5">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5" />
                        <span>{likes.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-5 w-5" />
                        <span>{comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
