import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);

  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const userId = String(user?._id);
  const likes = post.likes || [];
  const comments = post.comments || [];

  const isLiked = likes.map(String).includes(userId);
  const likeCount = likes.length;

  // ------------------------------
  // LIKE / DISLIKE
  // ------------------------------
  const likeHandler = async () => {
    try {
      const action = isLiked ? "dislike" : "like";
      const res = await api.get(`/post/${post._id}/${action}`);
      if (!res?.data?.success) return;

      const updatedLikes = isLiked
        ? likes.filter((id) => String(id) !== userId)
        : [...likes, userId];

      const updatedPosts = posts.map((p) =>
        p._id === post._id ? { ...p, likes: updatedLikes } : p
      );

      dispatch(setPosts(updatedPosts));

      const updatedPost = updatedPosts.find((p) => p._id === post._id);
      dispatch(setSelectedPost(updatedPost));
    } catch {
      toast.error("Like failed");
    }
  };

  // ------------------------------
  // ADD COMMENT
  // ------------------------------
  const addComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/post/${post._id}/comment`, {
        text: commentText,
      });

      if (!res?.data?.success) return;

      const newComment = res.data.comment;

      const updatedPosts = posts.map((p) =>
        p._id === post._id
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      );

      dispatch(setPosts(updatedPosts));

      const updatedPost = updatedPosts.find((p) => p._id === post._id);
      dispatch(setSelectedPost(updatedPost));

      setCommentText("");
    } catch {
      toast.error("Comment failed");
    }
  };

  // ------------------------------
  // DELETE
  // ------------------------------
  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`/post/delete/${post._id}`);

      if (res?.data?.success) {
        dispatch(setPosts(posts.filter((p) => p._id !== post._id)));
        toast.success("Post deleted");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  // ------------------------------
  // BOOKMARK
  // ------------------------------
  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`/post/${post._id}/bookmark`);
      toast.success(res.data.message || "Saved");
    } catch {
      toast.error("Bookmark failed");
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="flex gap-3 items-center">
            <h1 className="font-medium">{post.author?.username}</h1>
            {userId === String(post.author?._id) && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>

          <DialogContent className="flex flex-col items-center">
            {userId === String(post.author?._id) && (
              <Button variant="ghost" onClick={deletePostHandler}>
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* IMAGE */}
      <img
        className="my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post"
        onError={(e) => (e.target.src = "/fallback.png")}
      />

      {/* ACTIONS */}
      <div className="flex justify-between my-2">
        <div className="flex gap-3 items-center">
          {isLiked ? (
            <FaHeart
              size={24}
              className="text-red-600 cursor-pointer"
              onClick={likeHandler}
            />
          ) : (
            <FaRegHeart size={22} className="cursor-pointer" onClick={likeHandler} />
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
      <span className="font-medium">{likeCount} likes</span>

      {/* CAPTION */}
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>

      {/* VIEW COMMENTS */}
      {comments.length > 0 && (
        <span
          className="block text-sm text-gray-500 cursor-pointer"
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
        >
          View all {comments.length} comments
        </span>
      )}

      {/* DIALOG */}
      <CommentDialog open={open} setOpen={setOpen} />

      {/* ADD COMMENT INPUT */}
      <div className="flex gap-2 mt-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 outline-none text-sm"
        />

        {commentText.trim() && (
          <span
            onClick={addComment}
            className="text-blue-500 cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
