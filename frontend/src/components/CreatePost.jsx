import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);
  const dispatch = useDispatch();

  const [files, setFiles] = useState([]); // 🆕 Array of files
  const [imagePreviews, setImagePreviews] = useState([]); // 🆕 Array of previews
  const [currentIndex, setCurrentIndex] = useState(0); // 🆕 Carousel index
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);

  // ---------------------------------------
  // FILE CHANGE (MULTIPLE IMAGES)
  // ---------------------------------------
  const fileChangeHandler = async (e) => {
    try {
      const uploadedFiles = Array.from(e.target.files || []);
      if (uploadedFiles.length === 0) return;

      // Validate all files
      for (const file of uploadedFiles) {
        if (!file.type.startsWith("image/")) {
          toast.error("Only image files are allowed");
          return;
        }
      }

      // Max 10 images
      const totalFiles = [...files, ...uploadedFiles];
      if (totalFiles.length > 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }

      // Generate previews
      const newPreviews = [];
      for (const file of uploadedFiles) {
        const dataUrl = await readFileAsDataURL(file);
        newPreviews.push(dataUrl);
      }

      setFiles((prev) => [...prev, ...uploadedFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setCurrentIndex(0);
    } catch (error) {
      toast.error("Failed to preview images");
    }
  };

  // ---------------------------------------
  // REMOVE IMAGE
  // ---------------------------------------
  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ---------------------------------------
  // CREATE POST (MULTIPLE IMAGES)
  // ---------------------------------------
  const createPostHandler = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);

    // 🆕 Append all images
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);

      const res = await api.post("/post/addpost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const newPost = res.data.post;

        // update feed immediately
        dispatch(setPosts([newPost, ...(posts || [])]));

        toast.success(res.data.message || "Post created successfully");

        // cleanup
        setCaption("");
        setImagePreviews([]);
        setFiles([]);
        setCurrentIndex(0);
        setOpen(false);
      }
    } catch (error) {
      console.error("CREATE POST ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // DIALOG CLOSE CLEANUP
  // ---------------------------------------
  const handleDialogChange = (isOpen) => {
    if (!isOpen) {
      setCaption("");
      setImagePreviews([]);
      setFiles([]);
      setCurrentIndex(0);

      if (imageRef.current) {
        imageRef.current.value = "";
      }
    }
    setOpen(isOpen);
  };

  const goToPrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () =>
    setCurrentIndex((prev) => Math.min(imagePreviews.length - 1, prev + 1));

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>

        {/* USER INFO */}
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="profile" />
            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Post something...</span>
          </div>
        </div>

        {/* CAPTION */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
        />

        {/* IMAGE CAROUSEL PREVIEW */}
        {imagePreviews.length > 0 && (
          <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={imagePreviews[currentIndex]}
              alt={`preview-${currentIndex}`}
              className="w-full h-full object-contain"
            />

            {/* Navigation arrows */}
            {imagePreviews.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === imagePreviews.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Remove button */}
            <button
              onClick={() => removeImage(currentIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X size={14} />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {imagePreviews.length}
            </div>
          </div>
        )}

        {/* THUMBNAIL STRIP */}
        {imagePreviews.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imagePreviews.map((preview, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                  idx === currentIndex
                    ? "border-[#0095F6]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={preview}
                  alt={`thumb-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* FILE SELECT */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple // 🆕 Allow multiple selection
          onChange={fileChangeHandler}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="flex-1 bg-[#0095F6] hover:bg-[#258bcf]"
          >
            {imagePreviews.length > 0
              ? "Add more photos"
              : "Select from computer"}
          </Button>

          {imagePreviews.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFiles([]);
                setImagePreviews([]);
                setCurrentIndex(0);
              }}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* POST BUTTON */}
        {imagePreviews.length > 0 &&
          (loading ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="button"
              onClick={createPostHandler}
              className="w-full"
            >
              Post{" "}
              {imagePreviews.length > 1 && `(${imagePreviews.length} photos)`}
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
