import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { readFileAsDataURL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '@/redux/postSlice'

const CreatePost = ({ open, setOpen }) => {

  const imageRef = useRef(null)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)

  const { user } = useSelector(state => state.auth)
  const { posts } = useSelector(state => state.post)
  const dispatch = useDispatch()

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // ✅ Validate Image Type
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Only image files allowed")
      return
    }

    // ✅ Size Limit: 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    const preview = await readFileAsDataURL(selectedFile)

    setFile(selectedFile)
    setImagePreview(preview)
  }

  const createPostHandler = async () => {

    if (!file && !caption.trim()) {
      toast.error("Please add caption or image")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("caption", caption)
      if (file) formData.append("image", file)

      const res = await api.post("/api/v1/post/addpost", formData)

      if (res?.data?.success) {
        dispatch(setPosts([res.data.post, ...posts]))
        toast.success("Post created successfully")
        setOpen(false)
        setCaption("")
        setFile(null)
        setImagePreview("")
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>

        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>

        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-semibold text-xs">
              {user?.username || "User"}
            </h1>
            <span className="text-gray-600 text-xs">
              Share something new...
            </span>
          </div>
        </div>

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="border-none focus-visible:ring-transparent"
        />

        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center">
            <img src={imagePreview} className="w-full h-full object-cover rounded" />
          </div>
        )}

        <input
          ref={imageRef}
          type="file"
          hidden
          accept="image/*"
          onChange={fileChangeHandler}
        />

        <Button onClick={() => imageRef.current.click()} className="bg-[#0095F6]">
          Select Image
        </Button>

        {loading ? (
          <Button disabled className="w-full">
            <Loader2 className="animate-spin mr-2" /> Uploading...
          </Button>
        ) : (
          <Button onClick={createPostHandler} className="w-full">
            Post
          </Button>
        )}

      </DialogContent>
    </Dialog>
  )
}

export default CreatePost
