import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
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

  // Auto scroll to bottom when comments change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedPost?.comments]);

  if (!selectedPost) return null;

  // ---------------------------------------------------
  // SEND COMMENT
  // ---------------------------------------------------
  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(`/post/${selectedPost._id}/comment`, { text });

      if (res.data.success) {
        const newComment = res.data.comment;

        const updatedPost = {
          ...selectedPost,
          comments: [...selectedPost.comments, newComment],
        };

        // Update selected post (modal)
        dispatch(setSelectedPost(updatedPost));

        // Update post in feed (postSlice)
        dispatch(updateSinglePost(updatedPost));

        toast.success("Comment added!");
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl p-0 flex flex-col">

        <div className="flex flex-1">

          {/* LEFT IMAGE */}
          <div className="w-1/2 bg-black">
            <img
              src={selectedPost.image}
              alt="post_img"
              className="w-full h-full object-contain rounded-l-lg bg-black"
              onError={(e) => (e.target.src = "/fallback.jpg")}
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-1/2 flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedPost.author?.profilePicture} />
                  <AvatarFallback>
                    {selectedPost.author?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <Link
                  to={`/profile/${selectedPost.author?._id}`}
                  className="font-semibold text-xs"
                >
                  {selectedPost.author?.username}
                </Link>
              </div>

              <MoreHorizontal className="cursor-pointer" />
            </div>

            {/* COMMENT LIST */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto max-h-96 p-4"
            >
              {selectedPost.comments?.length > 0 ? (
                selectedPost.comments.map((c) => (
                  <Comment key={c._id} comment={c} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
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
