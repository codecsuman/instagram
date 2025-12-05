import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  selectedPost: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,

  reducers: {
    // -----------------------------
    // SET FEED POSTS
    // -----------------------------
    setPosts: (state, action) => {
      state.posts = Array.isArray(action.payload) ? action.payload : [];
    },

    // -----------------------------
    // SELECT A POST (FOR MODAL)
    // -----------------------------
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload || null;
    },

    // -----------------------------
    // UPDATE A SINGLE POST
    // -----------------------------
    updateSinglePost: (state, action) => {
      const updated = action.payload;
      if (!updated || !updated._id) return;

      state.posts = state.posts.map((p) =>
        p._id === updated._id ? updated : p
      );

      // Update modal-selected post too
      if (state.selectedPost?._id === updated._id) {
        state.selectedPost = updated;
      }
    },

    // -----------------------------
    // LIKE / UNLIKE
    // -----------------------------
    toggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (!post) return;

      // Ensure likes is array
      if (!Array.isArray(post.likes)) post.likes = [];

      const uid = userId.toString();
      const exists = post.likes.some((id) => id.toString() === uid);

      if (exists) {
        post.likes = post.likes.filter((id) => id.toString() !== uid);
      } else {
        post.likes.push(uid);
      }

      // also update selectedPost
      if (state.selectedPost?._id === postId) {
        state.selectedPost.likes = post.likes;
      }
    },

    // -----------------------------
    // ADD COMMENT
    // -----------------------------
    addCommentToPost: (state, action) => {
      const { postId, comment } = action.payload;

      const post = state.posts.find((p) => p._id === postId);
      if (!post) return;

      if (!Array.isArray(post.comments)) post.comments = [];

      // Prevent duplicates
      const exists = post.comments.some((c) => c._id === comment._id);
      if (!exists) post.comments.push(comment);

      // Also update selectedPost
      if (state.selectedPost?._id === postId) {
        if (!Array.isArray(state.selectedPost.comments))
          state.selectedPost.comments = [];
        if (!state.selectedPost.comments.some((c) => c._id === comment._id)) {
          state.selectedPost.comments.push(comment);
        }
      }
    },

    // -----------------------------
    // BOOKMARK TOGGLE (UI ONLY)
    // -----------------------------
    toggleBookmark: (state, action) => {
      const { postId, type } = action.payload;

      const post = state.posts.find((p) => p._id === postId);
      if (post) post.isBookmarked = type === "saved";

      if (state.selectedPost?._id === postId) {
        state.selectedPost.isBookmarked = type === "saved";
      }
    },

    // -----------------------------
    // RESET POSTS ON LOGOUT
    // -----------------------------
    resetPosts: (state) => {
      state.posts = [];
      state.selectedPost = null;
    },
  },
});

export const {
  setPosts,
  setSelectedPost,
  updateSinglePost,
  toggleLike,
  addCommentToPost,
  toggleBookmark,
  resetPosts,
} = postSlice.actions;

export default postSlice.reducer;
