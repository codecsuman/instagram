import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  setPosts,
  setSelectedPost,
  toggleBookmark,
} from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { posts, selectedPost } = useSelector((store) => store.post);

  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const userId = user?._id?.toString();

  const likes = useMemo(() => (Array.isArray(post?.likes) ? post.likes : []), [post?.likes]);
  const comments = useMemo(
    () => (Array.isArray(post?.comments) ? post.comments : []),
    [post?.comments]
  );

  const isLiked = likes.map(String).includes(userId);
  const likeCount = likes.length;

  // ---------------------------------------------------
  // LIKE / DISLIKE
  // ---------------------------------------------------
  const likeHandler = async () => {
    try {
      const action = isLiked ? "dislike" : "like";
      const res = await api.get(`/post/${post._id}/${action}`);

      if (!res.data.success) return;

      const updatedLikes = isLiked
        ? likes.filter((id) => id.toString() !== userId)
        : [...likes, userId];

      const updatedPosts = posts.map((p) =>
        p._id === post._id ? { ...p, likes: updatedLikes } : p
      );

      dispatch(setPosts(updatedPosts));

      // update selected post only if this same post is currently selected
      if (selectedPost?._id === post._id) {
        dispatch(
          setSelectedPost({
            ...selectedPost,
            likes: updatedLikes,
          })
        );
      }
    } catch (error) {
      console.error("LIKE ERROR:", error);
      toast.error("Error updating like");
    }
  };

  // ---------------------------------------------------
  // ADD COMMENT
  // ---------------------------------------------------
  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/post/${post._id}/comment`, {
        text: commentText.trim(),
      });

      if (!res.data.success) return;

      const newComment = res.data.comment;
      const updatedComments = [...comments, newComment];

      const updatedPosts = posts.map((p) =>
        p._id === post._id ? { ...p, comments: updatedComments } : p
      );

      dispatch(setPosts(updatedPosts));

      if (selectedPost?._id === post._id) {
        dispatch(
          setSelectedPost({
            ...selectedPost,
            comments: updatedComments,
          })
        );
      }

      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      console.error("COMMENT ERROR:", error);
      toast.error("Failed to add comment");
    }
  };

  // ---------------------------------------------------
  // DELETE POST
  // ---------------------------------------------------
  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`/post/delete/${post._id}`);

      if (res.data.success) {
        const updated = posts.filter((p) => p._id !== post._id);
        dispatch(setPosts(updated));

        if (selectedPost?._id === post._id) {
          dispatch(setSelectedPost(null));
        }

        toast.success("Post deleted");
      }
    } catch (error) {
      console.error("DELETE POST ERROR:", error);
      toast.error("Failed to delete post");
    }
  };

  // ---------------------------------------------------
  // BOOKMARK
  // ---------------------------------------------------
  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`/post/${post._id}/bookmark`);

      if (res.data.success) {
        dispatch(
          toggleBookmark({
            postId: post._id,
            type: res.data.type, // "saved" | "unsaved"
          })
        );

        toast.success(res.data.message || "Bookmark updated");
      }
    } catch (error) {
      console.error("BOOKMARK ERROR:", error);
      toast.error("Bookmark failed");
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture || ""} alt="profile" />
            <AvatarFallback>
              {post.author?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-3">
            <h1 className="font-medium">{post.author?.username}</h1>
            {userId === post.author?._id?.toString() && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>

        {/* OPTIONS */}
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">
              <MoreHorizontal className="cursor-pointer" />
            </button>
          </DialogTrigger>

          <DialogContent className="flex flex-col text-center items-center">
            {userId === post.author?._id?.toString() && (
              <Button variant="ghost" onClick={deletePostHandler}>
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* IMAGE */}
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post"
        onError={(e) => {
          e.currentTarget.src = "/fallback.png";
        }}
      />

      {/* ACTIONS */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {isLiked ? (
            <FaHeart
              size={24}
              className="cursor-pointer text-red-600"
              onClick={likeHandler}
            />
          ) : (
            <FaRegHeart
              size={22}
              className="cursor-pointer"
              onClick={likeHandler}
            />
          )}

          <MessageCircle
            className="cursor-pointer"
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
          />

          <Send className="cursor-pointer" />
        </div>

        <Bookmark className="cursor-pointer" onClick={bookmarkHandler} />
      </div>

      {/* LIKE COUNT */}
      <span className="font-medium block mb-2">{likeCount} likes</span>

      {/* CAPTION */}
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>

      {/* VIEW COMMENTS */}
      {comments.length > 0 && (
        <span
          className="cursor-pointer text-sm text-gray-400"
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
        >
          View all {comments.length} comments
        </span>
      )}

      {/* COMMENT DIALOG */}
      <CommentDialog open={open} setOpen={setOpen} />

      {/* COMMENT INPUT */}
      <div className="flex items-center justify-between mt-1 gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="outline-none text-sm w-full"
        />

        {commentText.trim() && (
          <button
            type="button"
            className="text-[#3BADF8] cursor-pointer font-medium"
            onClick={addComment}
          >
            Post
          </button>
        )}
      </div>
    </div>
  );
};

export default Post;