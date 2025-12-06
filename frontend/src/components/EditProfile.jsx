import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import api from "@/lib/api";
import { readFileAsDataURL } from "@/lib/utils";

const EditProfile = () => {
  const imageRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    bio: "",
    gender: "",
    profilePhotoFile: null,
    profilePhotoPreview: "",
  });

  // ---------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------
  useEffect(() => {
    if (user) {
      setInput({
        bio: user?.bio || "",
        gender: user?.gender || "",
        profilePhotoFile: null,
        profilePhotoPreview: user?.profilePicture || "",
      });
    }
  }, [user]);

  // ---------------------------------------------------
  // FILE UPLOAD
  // ---------------------------------------------------
  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const preview = await readFileAsDataURL(file);

    setInput((prev) => ({
      ...prev,
      profilePhotoFile: file,
      profilePhotoPreview: preview,
    }));
  };

  // ---------------------------------------------------
  // SUBMIT PROFILE UPDATE
  // ---------------------------------------------------
  const editProfileHandler = async () => {
    if (loading) return;

    const formData = new FormData();

    formData.append("bio", input.bio.trim());
    if (input.gender) formData.append("gender", input.gender);

    // field name MUST MATCH backend multer
    if (input.profilePhotoFile) {
      formData.append("profilePicture", input.profilePhotoFile);
    }

    try {
      setLoading(true);

      const res = await api.patch("/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        // Update redux + localStorage
        dispatch(setAuthUser(res.data.user));

        toast.success("Profile updated successfully");

        navigate(`/profile/${res.data.user._id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* PROFILE ROW */}
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={input.profilePhotoPreview} alt="profile" />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600 text-xs">
                {input.bio || "Add a bio..."}
              </span>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            className="hidden"
            accept="image/*"
          />

          <Button
            onClick={() => imageRef.current.click()}
            className="bg-[#0095F6] h-8 hover:bg-[#318bc7]"
          >
            Change photo
          </Button>
        </div>

        {/* BIO */}
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, bio: e.target.value }))
            }
            className="focus-visible:ring-transparent"
            placeholder="Write something about yourself..."
          />
        </div>

        {/* GENDER */}
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select
            value={input.gender}
            onValueChange={(value) =>
              setInput((prev) => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
