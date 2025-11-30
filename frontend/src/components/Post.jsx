import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa"
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {

  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { posts } = useSelector(state => state.post)

  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [postLike, setPostLike] = useState(0)

  useEffect(() => {
    setLiked(post.likes?.includes(user?._id))
    setPostLike(post.likes?.length || 0)
  }, [post, user])

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like"
      const res = await api.get(`/api/v1/post/${post._id}/${action}`)

      if (res?.data?.success) {
        const updated = posts.map(p =>
          p._id === post._id
            ? { ...p, likes: res.data.likes }
            : p
        )
        dispatch(setPosts(updated))
      }
    } catch {
      toast.error("Like failed")
    }
  }

  const commentHandler = async () => {
    if (!text.trim()) return

    try {
      const res = await api.post(`/api/v1/post/${post._id}/comment`, { text })
      if (res?.data?.success) {
        const updated = posts.map(p =>
          p._id === post._id
            ? { ...p, comments: res.data.comments }
            : p
        )
        dispatch(setPosts(updated))
        setText("")
      }
    } catch {
      toast.error("Comment failed")
    }
  }

  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`/api/v1/post/delete/${post._id}`)
      if (res?.data?.success) {
        dispatch(setPosts(posts.filter(p => p._id !== post._id)))
        setOpen(false)
      }
    } catch {
      toast.error("Delete failed")
    }
  }

  return (
    <div className="max-w-sm mx-auto my-6">

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>{post.author?.username?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="font-medium">{post.author?.username}</h1>
          {user?._id === post.author?._id && <Badge>Author</Badge>}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <MoreHorizontal />
          </DialogTrigger>
          <DialogContent>
            {user?._id === post.author?._id && (
              <Button onClick={deletePostHandler} className="text-red-500">
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <img className="w-full aspect-square object-cover mt-2" src={post.image} />

      <div className="flex gap-3 mt-2">
        {liked
          ? <FaHeart onClick={likeOrDislikeHandler} className="text-red-500 cursor-pointer" />
          : <FaRegHeart onClick={likeOrDislikeHandler} className="cursor-pointer" />
        }
        <MessageCircle onClick={() => setOpen(true)} />
        <Send />
        <Bookmark />
      </div>

      <p className="mt-1"><b>{postLike}</b> likes</p>
      <p><b>{post.author?.username}</b> {post.caption}</p>

      <input
        className="mt-2 w-full outline-none"
        placeholder="Add comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {text && (
        <span onClick={commentHandler} className="text-blue-500 cursor-pointer">
          Post
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
    </div>
  )
}

export default Post
