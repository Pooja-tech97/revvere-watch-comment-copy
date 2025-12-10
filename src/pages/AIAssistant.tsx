import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LogOut, 
  Mic, 
  MicOff, 
  Play, 
  BookOpen, 
  Sparkles,
  Bot,
  User,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AGENT_ID = "agent_1001kc3t20gxesr94xg3ec7yxy0y";

const AIAssistant = () => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsConnecting(false);
      toast({ title: "Connected", description: "Voice assistant is ready" });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      toast({ title: "Disconnected", description: "Voice chat ended" });
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      if (message.message) {
        const role = message.source === "user" ? "user" : "assistant";
        setMessages(prev => [...prev, {
          role,
          content: message.message,
          timestamp: new Date()
        }]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setIsConnecting(false);
      toast({ 
        title: "Error", 
        description: "Voice connection failed. Please try again.",
        variant: "destructive"
      });
    },
  });

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

  const getSignedUrl = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("elevenlabs-signed-url", {
      body: { agentId: AGENT_ID }
    });
    
    if (error || !data?.signed_url) {
      throw new Error("Failed to get signed URL");
    }
    
    return data.signed_url;
  };

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setIsConnecting(false);
      toast({ 
        title: "Connection failed", 
        description: error instanceof Error ? error.message : "Could not start voice chat",
        variant: "destructive"
      });
    }
  }, [conversation, toast]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    setMessages([]);
  }, [conversation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif text-cream tracking-wide">revvere</h1>
          <nav className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/videos")}
              className="text-cream/80 hover:text-cream hover:bg-cream/10"
            >
              <Play className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Videos</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/journal")}
              className="text-cream/80 hover:text-cream hover:bg-cream/10"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Journal</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/ai-assistant")}
              className="text-cream/80 hover:text-cream hover:bg-cream/10"
            >
              <Bot className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/pricing")}
              className="text-cream/80 hover:text-cream hover:bg-cream/10"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Pricing</span>
            </Button>
          </nav>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-fade-in">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-foreground">
              AI <span className="italic text-cream">Assistant</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Have a voice conversation with your wellness companion
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex justify-center mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              isConnected 
                ? isSpeaking 
                  ? "border-cream/50 bg-cream/10 text-cream" 
                  : "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-border/50 bg-card/50 text-muted-foreground"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected 
                  ? isSpeaking 
                    ? "bg-cream animate-pulse" 
                    : "bg-green-400"
                  : "bg-muted-foreground"
              }`} />
              <span className="text-sm font-medium">
                {isConnecting 
                  ? "Connecting..." 
                  : isConnected 
                    ? isSpeaking 
                      ? "Assistant Speaking..." 
                      : "Listening..." 
                    : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Conversation Transcript */}
          <div className="bg-card/50 rounded-xl border border-border/50 mb-6 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-serif text-foreground flex items-center gap-2">
                <Bot className="w-5 h-5 text-cream" />
                Conversation
              </h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by clicking the microphone button below</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user" 
                          ? "bg-cream/20 text-cream" 
                          : "bg-rose-soft/20 text-rose-soft"
                      }`}>
                        {msg.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                        <div className={`inline-block px-4 py-2 rounded-2xl ${
                          msg.role === "user" 
                            ? "bg-cream/20 text-foreground rounded-br-md" 
                            : "bg-secondary/50 text-foreground rounded-bl-md"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Mic Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={isConnecting}
                size="lg"
                className="rounded-full w-20 h-20 bg-cream hover:bg-cream/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                {isConnecting ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            ) : (
              <Button
                onClick={endConversation}
                size="lg"
                variant="destructive"
                className="rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-all"
              >
                <MicOff className="w-8 h-8" />
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isConnected ? "Click to end conversation" : "Click to start voice chat"}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
