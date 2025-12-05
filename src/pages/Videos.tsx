import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play, MessageCircle, Heart, LogOut, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyBG1oJzeCY7GSR6nEGKhP862FtpQaF_UR8";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
}

interface Comment {
  id: string;
  videoId: string;
  userName: string;
  text: string;
  timestamp: Date;
  likes: number;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Morning Meditation for Inner Peace",
    description: "Start your day with this calming meditation designed to center your mind and prepare you for the day ahead.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "15 min",
    category: "Meditation",
  },
  {
    id: "2",
    title: "Heart Opener Yoga Flow",
    description: "A gentle yoga sequence focused on opening the heart chakra and releasing tension from the shoulders.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "25 min",
    category: "Movement",
  },
  {
    id: "3",
    title: "Journaling for Self-Discovery",
    description: "Learn powerful journaling techniques to uncover your deepest desires and connect with your authentic self.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "20 min",
    category: "Mindfulness",
  },
  {
    id: "4",
    title: "Evening Wind Down Routine",
    description: "A soothing evening practice to help you release the day and prepare for restful sleep.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "12 min",
    category: "Sleep",
  },
];

const Videos = () => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      videoId: "1",
      userName: "Sarah M.",
      text: "This meditation changed my mornings completely. I feel so much more centered now. 🙏",
      timestamp: new Date(Date.now() - 86400000),
      likes: 12,
    },
    {
      id: "2",
      videoId: "1",
      userName: "Emma L.",
      text: "Beautiful guidance. The breathwork section was particularly powerful for me.",
      timestamp: new Date(Date.now() - 172800000),
      likes: 8,
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const summarizeComments = async () => {
    if (videoComments.length === 0) {
      toast({ title: "No comments", description: "There are no comments to summarize." });
      return;
    }

    setIsSummarizing(true);
    setSummary(null);

    const commentsText = videoComments.map(c => `${c.userName}: "${c.text}"`).join("\n");
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Summarize the following comments from a wellness video in 2-3 sentences. Focus on the overall sentiment and key themes mentioned:\n\n${commentsText}`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (summaryText) {
        setSummary(summaryText);
      } else {
        throw new Error("No summary generated");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      toast({ 
        title: "Summarization failed", 
        description: "Could not generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedVideo || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      videoId: selectedVideo.id,
      userName: user.name,
      text: newComment.trim(),
      timestamp: new Date(),
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast({ title: "Comment added", description: "Your thoughts have been shared." });
  };

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const videoComments = selectedVideo
    ? comments.filter((c) => c.videoId === selectedVideo.id)
    : [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif text-cream tracking-wide">revvere</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedVideo ? (
          /* Video Detail View */
          <div className="animate-fade-in">
            <button
              onClick={() => setSelectedVideo(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-cream transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to videos
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Video Player */}
              <div className="lg:col-span-2">
                <div className="aspect-video bg-card rounded-xl overflow-hidden border border-border/50 shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="mt-6">
                  <span className="text-xs font-medium text-cream/80 bg-cream/10 px-3 py-1 rounded-full">
                    {selectedVideo.category}
                  </span>
                  <h2 className="text-2xl font-serif text-foreground mt-3">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="lg:col-span-1">
                <div className="bg-card/50 rounded-xl border border-border/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-cream" />
                      Comments ({videoComments.length})
                    </h3>
                    {videoComments.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={summarizeComments}
                        disabled={isSummarizing}
                        className="text-cream hover:text-cream/80"
                      >
                        {isSummarizing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="ml-1.5 text-xs">AI Summary</span>
                      </Button>
                    )}
                  </div>

                  {/* AI Summary */}
                  {summary && (
                    <div className="mb-6 p-4 bg-cream/5 border border-cream/20 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cream" />
                        <span className="text-xs font-medium text-cream">AI Summary</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="mb-6">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      variant="cream"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="w-full"
                    >
                      Post Comment
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {videoComments.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        Be the first to share your thoughts
                      </p>
                    ) : (
                      videoComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-secondary/30 rounded-lg p-4 animate-scale-in"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-cream/10 text-cream text-xs">
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {comment.userName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(comment.timestamp)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 mb-3">
                            {comment.text}
                          </p>
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-soft transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            {comment.likes}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Video Grid View */
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-serif text-foreground">
                Your <span className="italic text-cream">practices</span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Explore guided content designed for your wellness journey
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-video bg-card rounded-xl overflow-hidden border border-border/50 mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:border-cream/30">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-xs font-medium text-cream/80 bg-charcoal-deep/60 px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-cream/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-cream/70">
                    {video.category}
                  </span>
                  <h3 className="font-serif text-foreground mt-1 group-hover:text-cream transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;
