import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bot, Send, Mic, Paperclip, Wind, Music, Phone, PenTool, User, ChevronLeft, ChevronRight, MessageCircle, Plus, Trash2 } from 'lucide-react';

// ⬇️ your brand mark
import chatsLogo from '@/assets/chats.svg';
import mindfulLogo from '@/assets/mindfulbot.svg'; // change to .png if needed
import whitemindfulLogo from '@/assets/whitemindfulbot.svg'

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const MindfulBot = () => {
  const [currentSession, setCurrentSession] = useState<string>('default');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      title: 'New Chat',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          content:
            "Hi, how are you feeling today? I'm here to help you with mindfulness, breathing exercises, or just to listen. What would you like to talk about?",
          sender: 'bot',
          timestamp: new Date(),
        },
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentMessages =
    chatSessions.find((session) => session.id === currentSession)?.messages || [];

  const quickActions = [
    { label: 'Breathing Exercises', icon: Wind, action: () => handleQuickAction('I need help with breathing exercises') },
    { label: 'Calming Music', icon: Music, action: () => handleQuickAction('Please suggest some calming music or sounds') },
    { label: 'Crisis Support', icon: Phone, action: () => handleQuickAction('I need crisis support help - please provide resources') },
    { label: 'Anxiety Relief', icon: PenTool, action: () => handleQuickAction("I'm feeling anxious and need help calming down") },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const updateCurrentSession = (messages: Message[]) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === currentSession
          ? { ...session, messages, timestamp: new Date() }
          : session
      )
    );
  };

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
    handleSendMessage(message);
  };

  const createNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          content:
            "Hi, how are you feeling today? I'm here to help you with mindfulness, breathing exercises, or just to listen. What would you like to talk about?",
          sender: 'bot',
          timestamp: new Date(),
        },
      ],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSessionId);
  };

  const deleteChat = (sessionId: string) => {
    if (chatSessions.length === 1) return; // avoid deleting last chat

    setChatSessions((prev) => prev.filter((session) => session.id !== sessionId));

    if (currentSession === sessionId) {
      const remaining = chatSessions.filter((s) => s.id !== sessionId);
      setCurrentSession(remaining[0]?.id || 'default');
    }
  };

  const sendToChatAPI = async (message: string, history: Message[]) => {
    try {
      const systemMessage = {
        role: 'system',
        content: `You are a compassionate mindful wellness assistant. Your role is to:
- Provide empathetic, supportive responses to users' emotional states
- Suggest mindfulness practices like breathing exercises, meditation, or calming music
- Offer gentle guidance for stress, anxiety, or overwhelming feelings
- Be warm, understanding, and non-judgmental
- Keep responses concise but caring (2-3 sentences max)
- Always prioritize the user's wellbeing and suggest professional help if needed
- Use a calm, soothing tone
- Ask follow-up questions to understand how to best help`,
      };

      const conversationHistory = history.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const messages = [systemMessage, ...conversationHistory, { role: 'user', content: message }];

      const response = await fetch('https://api.sea-lion.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer sk-Y8L5mwaeYGh4PSl2xXDbAA`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_completion_tokens: 150,
          messages,
          model: 'aisingapore/Llama-SEA-LION-v3-70B-IT',
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sea Lion API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? 'Sorry, I could not respond.';
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    const updated = [...currentMessages, userMessage];
    updateCurrentSession(updated);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botReply = await sendToChatAPI(message, currentMessages);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };

      const finalMessages = [...updated, botMessage];
      updateCurrentSession(finalMessages);

      // Update chat title based on first user message
      if (currentMessages.length === 1) {
        setChatSessions((prev) =>
          prev.map((session) =>
            session.id === currentSession
              ? {
                  ...session,
                  title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
                }
              : session
          )
        );
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-16'
        } transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-r border-white/20 dark:border-slate-700/50 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              {/* plain logo, no circle */}
              <img src={chatsLogo} alt="Chats" className="w-12 h-12 object-contain" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Sidebar label */}
          {sidebarOpen && (
            <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Chats
            </div>
          )}

          {sidebarOpen && (
            <Button
              onClick={createNewChat}
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>

        {/* Chat Sessions */}
        {sidebarOpen && (
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div key={session.id} className="group relative">
                  <Button
                    variant={currentSession === session.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-left p-3 h-auto ${
                      currentSession === session.id
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                    onClick={() => setCurrentSession(session.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{session.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {chatSessions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(session.id);
                      }}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex min-h-0 flex-col">
        {/* Chat Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-white/20 dark:border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            {/* logo in header, no badge */}
            <img src={mindfulLogo} alt="Mindful Bot" className="w-11 h-11 object-contain" />
            <div>
              <h2 className="font-semibold text-foreground">Mindful Bot</h2>
              <p className="text-sm text-muted-foreground">Always here to help you find peace</p>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="p-4 border-b border-white/20 dark:border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 hover:from-orange-200 hover:to-pink-200 dark:hover:from-orange-800/50 dark:hover:to-pink-800/50"
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {currentMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatars: user keeps blue bubble; bot shows plain logo */}
                  {message.sender === 'user' ? (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    // All bot messages: logo inside purple gradient circle
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-purple-900 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <img
                        src={whitemindfulLogo}
                        alt="Mindful Bot"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  )}

                  <Card
                    className={`p-4 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none'
                        : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </Card>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[80%]">
                  {/* typing indicator avatar = logo */}
                  <img src={mindfulLogo} alt="Mindful Bot" className="w-8 h-8 object-contain" />
                  <Card className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="sticky bottom-0 z-10 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-white/20 dark:border-slate-700/50">
        
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="pr-20 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm border-gray/30 dark:border-slate-600/50 text-base py-3"
                  
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-white/50 dark:hover:bg-slate-600/50">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-white/50 dark:hover:bg-slate-600/50">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindfulBot;