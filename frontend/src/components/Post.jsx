import React, { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Send,
  Pencil,
  Trash2,
  X,
  Flag,
} from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { toast } from "sonner";
import { setPosts, setSelectedPost, toggleBookmark } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { posts, selectedPost } = useSelector((store) => store.post);

  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCaption, setEditCaption] = useState(post?.caption || "");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Report states
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const userId = user?._id?.toString();
  const likes = useMemo(
    () => (Array.isArray(post?.likes) ? post.likes : []),
    [post?.likes],
  );
  const comments = useMemo(
    () => (Array.isArray(post?.comments) ? post.comments : []),
    [post?.comments],
  );
  const isLiked = likes.map(String).includes(userId);
  const likeCount = likes.length;
  const isAuthor = userId === post.author?._id?.toString();

  const likeHandler = async () => {
    try {
      const action = isLiked ? "dislike" : "like";
      const res = await api.get(`/post/${post._id}/${action}`);
      if (!res.data.success) return;
      const updatedLikes = isLiked
        ? likes.filter((id) => id.toString() !== userId)
        : [...likes, userId];
      const updatedPosts = posts.map((p) =>
        p._id === post._id ? { ...p, likes: updatedLikes } : p,
      );
      dispatch(setPosts(updatedPosts));
      if (selectedPost?._id === post._id)
        dispatch(setSelectedPost({ ...selectedPost, likes: updatedLikes }));
    } catch (error) {
      toast.error("Error updating like");
    }
  };

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
        p._id === post._id ? { ...p, comments: updatedComments } : p,
      );
      dispatch(setPosts(updatedPosts));
      if (selectedPost?._id === post._id)
        dispatch(
          setSelectedPost({ ...selectedPost, comments: updatedComments }),
        );
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const deletePostHandler = async () => {
    if (deleteLoading) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/post/delete/${post._id}`);
      if (res.data.success) {
        dispatch(setPosts(posts.filter((p) => p._id !== post._id)));
        if (selectedPost?._id === post._id) dispatch(setSelectedPost(null));
        setMenuOpen(false);
        toast.success("Post deleted");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const editPostHandler = async () => {
    if (!editCaption.trim() || editLoading) return;
    try {
      setEditLoading(true);
      const res = await api.patch(`/post/edit/${post._id}`, {
        caption: editCaption.trim(),
      });
      if (res.data.success) {
        const updatedPost = res.data.post;
        dispatch(
          setPosts(posts.map((p) => (p._id === post._id ? updatedPost : p))),
        );
        if (selectedPost?._id === post._id)
          dispatch(setSelectedPost(updatedPost));
        toast.success("Post updated");
        setEditOpen(false);
        setMenuOpen(false);
      }
    } catch (error) {
      toast.error("Failed to edit post");
    } finally {
      setEditLoading(false);
    }
  };

  // ---------------------------------------------------
  // REPORT POST
  // ---------------------------------------------------
  const reportHandler = async () => {
    if (!reportReason.trim() || reportLoading) return;
    try {
      setReportLoading(true);
      const res = await api.post(`/report/post/${post._id}`, {
        reason: reportReason.trim(),
      });
      if (res.data.success) {
        toast.success(res.data.message || "Post reported successfully");
        setReportOpen(false);
        setMenuOpen(false);
        setReportReason("");
      } else {
        toast.error(res.data.message || "Failed to report");
      }
    } catch (error) {
      console.error("REPORT ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to report post");
    } finally {
      setReportLoading(false);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`/post/${post._id}/bookmark`);
      if (res.data.success) {
        dispatch(toggleBookmark({ postId: post._id, type: res.data.type }));
        toast.success("Bookmark updated");
      }
    } catch (error) {
      toast.error("Bookmark failed");
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={post.author?.profilePicture || ""}
              alt="profile"
            />
            <AvatarFallback>
              {post.author?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1 className="font-medium">{post.author?.username}</h1>
            {isAuthor && <Badge variant="secondary">Author</Badge>}
          </div>
        </div>

        {/* THREE DOT MENU */}
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal className="cursor-pointer" size={20} />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs p-0 gap-0 overflow-hidden">
            {isAuthor ? (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                    setEditCaption(post.caption || "");
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50 transition border-b border-gray-100 text-sm font-medium"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  type="button"
                  onClick={deletePostHandler}
                  disabled={deleteLoading}
                  className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50 transition text-red-500 text-sm font-medium"
                >
                  <Trash2 size={16} />{" "}
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 hover:bg-gray-50 transition text-sm border-t border-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                    setReportReason("");
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 hover:bg-gray-50 transition text-red-500 text-sm font-medium border-b border-gray-100"
                >
                  <Flag size={16} /> Report
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post"
        onError={(e) => {
          e.currentTarget.src = "/fallback.png";
        }}
      />

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

      <span className="font-medium block mb-2">{likeCount} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>

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

      <CommentDialog open={open} setOpen={setOpen} />

      {/* EDIT POST DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Edit Post</h2>
            <button
              onClick={() => setEditOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mb-4">
            <img
              src={post.image}
              alt="post"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Caption
            </label>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:border-transparent"
              rows={3}
              placeholder="Write a caption..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#0095F6] hover:bg-[#1877F2]"
              onClick={editPostHandler}
              disabled={editLoading || !editCaption.trim()}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* REPORT POST DIALOG */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Report Post</h2>
            <button
              onClick={() => setReportOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Why are you reporting this post?
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                "Spam",
                "Inappropriate content",
                "Harassment",
                "False information",
                "Other",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm transition ${
                    reportReason === reason
                      ? "bg-[#0095F6] text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {reportReason === "Other" && (
              <textarea
                value={reportReason === "Other" ? "" : reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please describe the issue..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                rows={3}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={reportHandler}
              disabled={
                reportLoading ||
                !reportReason.trim() ||
                reportReason === "Other"
              }
            >
              {reportLoading ? "Reporting..." : "Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
