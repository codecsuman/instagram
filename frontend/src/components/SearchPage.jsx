import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, X, User, Image, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import api from "@/lib/api";
import { toast } from "sonner";

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(
        `/search/all?q=${encodeURIComponent(searchTerm)}`,
      );

      if (res.data.success) {
        setUsers(res.data.users || []);
        setPosts(res.data.posts || []);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("SEARCH ERROR:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  const clearSearch = () => {
    setQuery("");
    setUsers([]);
    setPosts([]);
    setHasSearched(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, captions..."
          className="pl-10 pr-10 h-12 text-base focus-visible:ring-[#0095F6]"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <Image className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => navigate(`/profile/${u._id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition border border-transparent hover:border-gray-200"
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={u.profilePicture || ""} />
                      <AvatarFallback>
                        {u.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{u.username}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {u.bio || "No bio"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {u.followers?.length || 0} followers
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${u._id}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No posts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/profile/${post.author?._id}`)}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-sm"
                  >
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-4 text-white">
                        <span className="flex items-center gap-1 font-semibold">
                          ❤ {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          💬 {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!loading && !hasSearched && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 text-lg">Start typing to search</p>
          <p className="text-gray-300 text-sm mt-1">
            Find users and posts by username, bio, or caption
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
