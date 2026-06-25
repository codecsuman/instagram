import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { setUserProfile } from "@/redux/authSlice";
import { setSelectedChatUser } from "@/redux/chatSlice";

const Profile = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useGetUserProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");

  const { userProfile, user } = useSelector((store) => store.auth);

  if (!userProfile) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-pulse h-40 w-40 bg-gray-200 rounded-full" />
      </div>
    );
  }

  const isLoggedInUserProfile = user?._id?.toString() === userProfile?._id?.toString();

  const posts = Array.isArray(userProfile?.posts) ? userProfile.posts : [];
  const bookmarks = Array.isArray(userProfile?.bookmarks) ? userProfile.bookmarks : [];
  const followers = Array.isArray(userProfile?.followers) ? userProfile.followers : [];
  const following = Array.isArray(userProfile?.following) ? userProfile.following : [];

  const isFollowing = useMemo(() => {
    return followers.some((id) => id.toString() === user?._id?.toString());
  }, [followers, user?._id]);

  const displayedPosts = useMemo(() => {
    if (activeTab === "saved" && isLoggedInUserProfile) {
      return bookmarks;
    }
    return posts;
  }, [activeTab, posts, bookmarks, isLoggedInUserProfile]);

  // ---------------------------------------------------
  // FOLLOW / UNFOLLOW
  // ---------------------------------------------------
  const followHandler = async () => {
    try {
      const res = await api.post(`/user/followorunfollow/${userProfile._id}`);

      if (res.data.success) {
        toast.success(res.data.message);

        let updatedFollowers;
        if (isFollowing) {
          updatedFollowers = followers.filter(
            (id) => id.toString() !== user?._id?.toString()
          );
        } else {
          updatedFollowers = [...followers, user?._id];
        }

        dispatch(
          setUserProfile({
            ...userProfile,
            followers: updatedFollowers,
          })
        );
      }
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
      toast.error("Something went wrong");
    }
  };

  // ---------------------------------------------------
  // MESSAGE USER
  // ---------------------------------------------------
  const messageHandler = () => {
    dispatch(
      setSelectedChatUser({
        _id: userProfile._id,
        username: userProfile.username,
        profilePicture: userProfile.profilePicture,
      })
    );

    navigate("/chat");
  };

  return (
    <div className="flex max-w-5xl mx-auto px-4 md:px-10">
      <div className="flex flex-col gap-20 p-8 w-full">
        {/* ---------------- HEADER ---------------- */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Avatar */}
          <section className="flex items-center justify-center md:justify-start">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile?.profilePicture || ""} alt="profile" />
              <AvatarFallback>
                {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </section>

          {/* Profile Details */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xl font-semibold">{userProfile.username}</span>

              {isLoggedInUserProfile ? (
                <Link to="/account/edit">
                  <Button variant="secondary" className="h-8">
                    Edit profile
                  </Button>
                </Link>
              ) : isFollowing ? (
                <>
                  <Button
                    variant="secondary"
                    className="h-8"
                    onClick={followHandler}
                  >
                    Unfollow
                  </Button>

                  <Button
                    variant="secondary"
                    className="h-8"
                    onClick={messageHandler}
                  >
                    Message
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="h-8 bg-[#0095F6] hover:bg-[#3192d2]"
                    onClick={followHandler}
                  >
                    Follow
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

            {/* Followers */}
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <p>
                <span className="font-semibold">{posts.length}</span> posts
              </p>
              <p>
                <span className="font-semibold">{followers.length}</span> followers
              </p>
              <p>
                <span className="font-semibold">{following.length}</span> following
              </p>
            </div>

            {/* Bio */}
            <div>
              <p className="font-semibold">{userProfile?.bio || "No bio yet."}</p>

              <Badge variant="secondary" className="w-fit mt-2">
                <AtSign className="mr-1 h-4 w-4" />
                {userProfile.username}
              </Badge>
            </div>
          </section>
        </div>

        {/* ---------------- TABS ---------------- */}
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <button
              type="button"
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold border-b" : ""
              }`}
              onClick={() => setActiveTab("posts")}
            >
              POSTS
            </button>

            {isLoggedInUserProfile && (
              <button
                type="button"
                className={`py-3 cursor-pointer ${
                  activeTab === "saved" ? "font-bold border-b" : ""
                }`}
                onClick={() => setActiveTab("saved")}
              >
                SAVED
              </button>
            )}
          </div>

          {/* ---------------- POSTS GRID ---------------- */}
          <div className="grid grid-cols-3 gap-1 mt-4">
            {displayedPosts.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 py-10">
                {activeTab === "posts" ? "No posts yet." : "No saved posts."}
              </p>
            )}

            {displayedPosts.map((post) => {
              const likes = Array.isArray(post?.likes) ? post.likes : [];
              const comments = Array.isArray(post?.comments) ? post.comments : [];

              return (
                <div
                  key={post._id}
                  className="relative group cursor-pointer"
                >
                  <img
                    src={post.image}
                    alt="post"
                    className="rounded-sm aspect-square w-full object-cover"
                  />

                  <div
                    className="absolute inset-0 flex items-center justify-center
                    bg-black/50 opacity-0 group-hover:opacity-100 transition"
                  >
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