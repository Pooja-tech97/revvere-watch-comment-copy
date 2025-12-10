import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  Search,
  Calendar as CalendarIcon,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  FileText,
  X,
  Play,
  BookOpen,
  LogOut,
  Mic,
  MicOff,
  Bot,
} from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useToast } from "@/hooks/use-toast";

const TAGS = ["#work", "#family", "#selfcare"];
const MOODS = ["😊", "😌", "😢", "😤", "🥰", "😴", "💪", "🌸"];
const PROMPTS = [
  "What am I grateful for today?",
  "Today's win...",
  "How am I feeling right now?",
  "What made me smile today?",
  "What do I need to let go of?",
];
const TEMPLATES = [
  { name: "Gratitude", content: "Today I am grateful for:\n1. \n2. \n3. \n\nOne thing that made me happy:" },
  { name: "Weekly Reflection", content: "This week I accomplished:\n\nChallenges I faced:\n\nWhat I learned:\n\nGoals for next week:" },
  { name: "Self-Care Check-in", content: "How is my body feeling?\n\nHow is my mind?\n\nWhat do I need right now?\n\nOne kind thing I'll do for myself:" },
];

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood: string;
}

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    title: "Morning Reflections",
    content: "Woke up feeling refreshed today. Spent 20 minutes meditating before the kids woke up. It's amazing how those quiet moments set the tone for my entire day. I'm grateful for the sunshine streaming through my window and the smell of fresh coffee.",
    date: new Date(2024, 11, 4),
    tags: ["#selfcare"],
    mood: "😊",
  },
  {
    id: "2",
    title: "Balancing Act",
    content: "Today was challenging at work - had back-to-back meetings but managed to take a 10-minute walk during lunch. Called mom after dinner and it filled my heart. Need to remember that it's okay to not be perfect at everything.",
    date: new Date(2024, 11, 3),
    tags: ["#work", "#family"],
    mood: "😌",
  },
  {
    id: "3",
    title: "Weekend Self-Care",
    content: "Finally took that bubble bath I've been promising myself. Put on a face mask, lit my favorite candle, and read for an hour. My body was telling me to slow down and I actually listened. Small wins matter.",
    date: new Date(2024, 11, 1),
    tags: ["#selfcare"],
    mood: "🥰",
  },
];

export default function Journal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New entry form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newMood, setNewMood] = useState("😊");

  // Voice to text
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechToText();

  // Append transcript to content when voice input is received
  useEffect(() => {
    if (transcript) {
      setNewContent(prev => prev + transcript);
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      toast({ title: "Voice input stopped" });
    } else {
      startListening();
      toast({ title: "Listening...", description: "Speak now to add to your entry" });
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => entry.tags.includes(tag));
    const matchesDate = !selectedDate || format(entry.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    return matchesSearch && matchesTags && matchesDate;
  });

  const handleSaveEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Please fill in title and content", variant: "destructive" });
      return;
    }

    if (editingId) {
      setEntries(entries.map(e => 
        e.id === editingId 
          ? { ...e, title: newTitle, content: newContent, tags: newTags, mood: newMood }
          : e
      ));
      toast({ title: "Entry updated!" });
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: newTitle,
        content: newContent,
        date: new Date(),
        tags: newTags,
        mood: newMood,
      };
      setEntries([newEntry, ...entries]);
      toast({ title: "Entry saved!" });
    }
    
    resetForm();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setNewTitle(entry.title);
    setNewContent(entry.content);
    setNewTags(entry.tags);
    setNewMood(entry.mood);
    setIsWriting(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast({ title: "Entry deleted" });
  };

  const resetForm = () => {
    setIsWriting(false);
    setEditingId(null);
    setNewTitle("");
    setNewContent("");
    setNewTags([]);
    setNewMood("😊");
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setNewContent(template.content);
    setNewTitle(template.name);
  };

  const applyPrompt = (prompt: string) => {
    setNewContent(prev => prev ? `${prev}\n\n${prompt}` : prompt);
  };

  const toggleTag = (tag: string, isFilter = false) => {
    if (isFilter) {
      setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    } else {
      setNewTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || '{"name": "Guest"}');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-rose-gold/20 bg-gradient-to-r from-mauve/10 via-background to-rose-gold/10 backdrop-blur-sm">
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

      {/* Page Title */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-beige">Wellness Journal</h2>
            <p className="text-sm text-dusty-rose">Your sacred space for reflection</p>
          </div>
          <Button 
            onClick={() => setIsWriting(true)}
            className="bg-rose-gold text-primary-foreground hover:bg-rose-gold-deep"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar - Filters */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mauve" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-mauve/30 focus:border-rose-gold placeholder:text-muted-foreground"
              />
            </div>

            {/* Tag Filters */}
            <Card className="bg-card/50 border-mauve/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-beige mb-3 font-sans">Filter by Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-rose-gold text-primary-foreground border-rose-gold"
                          : "border-mauve/40 text-mauve hover:bg-mauve/10"
                      }`}
                      onClick={() => toggleTag(tag, true)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Filter */}
            <Card className="bg-card/50 border-mauve/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-beige font-sans">Filter by Date</h3>
                  {selectedDate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedDate(undefined)}
                      className="h-6 px-2 text-xs text-dusty-rose"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-mauve/30 hover:bg-mauve/10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-rose-gold" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-mauve/30" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Writing Mode */}
            {isWriting && (
              <Card className="bg-gradient-to-br from-mauve/10 to-rose-gold/5 border-rose-gold/30 animate-fade-in">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl text-beige">{editingId ? "Edit Entry" : "New Entry"}</h2>
                    <Button variant="ghost" size="icon" onClick={resetForm} className="text-dusty-rose">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="flex flex-wrap gap-2">
                    {/* Mood Selector */}
                    <Select value={newMood} onValueChange={setNewMood}>
                      <SelectTrigger className="w-20 border-mauve/30 bg-card">
                        <SelectValue>{newMood}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-mauve/30">
                        {MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood} className="text-xl">
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quick Prompts */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-mauve/30 text-mauve hover:bg-mauve/10">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Prompts
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-mauve/30">
                        {PROMPTS.map((prompt) => (
                          <DropdownMenuItem 
                            key={prompt} 
                            onClick={() => applyPrompt(prompt)}
                            className="cursor-pointer hover:bg-mauve/10"
                          >
                            {prompt}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Templates */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-mauve/30 text-mauve hover:bg-mauve/10">
                          <FileText className="w-4 h-4 mr-2" />
                          Templates
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-mauve/30">
                        {TEMPLATES.map((template) => (
                          <DropdownMenuItem 
                            key={template.name} 
                            onClick={() => applyTemplate(template)}
                            className="cursor-pointer hover:bg-mauve/10"
                          >
                            {template.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title */}
                  <Input
                    placeholder="Entry title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-card border-mauve/30 focus:border-rose-gold text-lg font-serif"
                  />

                  {/* Content with Voice Input */}
                  <div className="relative">
                    <Textarea
                      placeholder="What's on your mind today? Click the mic to speak..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[200px] bg-card border-mauve/30 focus:border-rose-gold resize-none pr-12"
                    />
                    {isSupported && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleVoiceToggle}
                        className={`absolute right-2 top-2 transition-all ${
                          isListening 
                            ? "text-rose-gold animate-pulse bg-rose-gold/20" 
                            : "text-mauve hover:text-rose-gold hover:bg-rose-gold/10"
                        }`}
                        title={isListening ? "Stop listening" : "Start voice input"}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                    )}
                    {isListening && (
                      <div className="absolute right-2 bottom-2 flex items-center gap-2 text-xs text-rose-gold">
                        <span className="w-2 h-2 bg-rose-gold rounded-full animate-pulse" />
                        Listening...
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={newTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          newTags.includes(tag)
                            ? "bg-rose-gold text-primary-foreground border-rose-gold"
                            : "border-mauve/40 text-mauve hover:bg-mauve/10"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSaveEntry}
                    className="w-full bg-rose-gold text-primary-foreground hover:bg-rose-gold-deep"
                  >
                    {editingId ? "Update Entry" : "Save Entry"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Entries List */}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <Card className="bg-card/50 border-mauve/20">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground font-sans">No entries found. Start writing your first reflection!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredEntries.map((entry, index) => (
                  <Card 
                    key={entry.id} 
                    className="bg-card/50 border-mauve/20 hover:border-rose-gold/30 transition-all animate-slide-up group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{entry.mood}</span>
                            <h3 className="text-lg text-beige truncate">{entry.title}</h3>
                          </div>
                          <p className="text-muted-foreground font-sans text-sm line-clamp-3 mb-3">
                            {entry.content}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-dusty-rose font-sans">
                              {format(entry.date, "MMMM d, yyyy")}
                            </span>
                            <div className="flex gap-1">
                              {entry.tags.map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs border-mauve/30 text-mauve"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(entry)}
                            className="h-8 w-8 text-mauve hover:text-rose-gold hover:bg-rose-gold/10"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            className="h-8 w-8 text-dusty-rose hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
