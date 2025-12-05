import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import api from "@/lib/api";
import { toast } from "sonner";
import { setSelectedPost, updateSinglePost } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { selectedPost } = useSelector((state) => state.post);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedPost?.comments]);

  if (!selectedPost) return null;

  // ---------------------------
  // SEND COMMENT
  // ---------------------------
  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(`/post/${selectedPost._id}/comment`, { text });

      if (res?.data?.success) {
        const newComment = res.data.comment;

        const updatedPost = {
          ...selectedPost,
          comments: [...(selectedPost.comments || []), newComment],
        };

        dispatch(setSelectedPost(updatedPost));
        dispatch(updateSinglePost(updatedPost));

        setText("");
        toast.success("Comment added!");
      }
    } catch (error) {
      console.error("❌ Comment failed:", error?.response?.data || error);
      toast.error("Could not add comment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl p-0 flex flex-col">

        {/* ✅ ACCESSIBILITY FIX */}
        <DialogTitle className="hidden">Post comments dialog</DialogTitle>

        <div className="flex flex-1">

          {/* IMAGE */}
          <div className="w-1/2 bg-black">
            <img
              src={selectedPost.image}
              alt="post"
              className="w-full h-full object-contain rounded-l-lg"
              onError={(e) => (e.target.src = "/fallback.jpg")}
            />
          </div>

          {/* CONTENT */}
          <div className="w-1/2 flex flex-col">

            {/* HEADER */}
            <DialogHeader>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedPost.author?.profilePicture} />
                    <AvatarFallback>
                      {selectedPost.author?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <Link
                    to={`/profile/${selectedPost.author?._id || ""}`}
                    className="font-semibold text-xs"
                  >
                    {selectedPost.author?.username || "Unknown"}
                  </Link>
                </div>

                <MoreHorizontal className="cursor-pointer" />
              </div>
            </DialogHeader>

            {/* COMMENTS */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-96 p-4">
              {selectedPost.comments?.length ? (
                selectedPost.comments.map((c) => (
                  <Comment key={c._id} comment={c} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border rounded p-2 text-sm outline-none"
                />
                <Button disabled={!text.trim()} onClick={sendMessageHandler}>
                  Send
                </Button>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
