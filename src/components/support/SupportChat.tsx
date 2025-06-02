import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Send, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import { Capacitor } from '@capacitor/core';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  format?: 'text' | 'html' | 'markdown';
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();

  // Generate a new chatId when the chat is opened
  useEffect(() => {
    if (isOpen && !chatId) {
      setChatId(uuidv4());
      
      // Add welcome message
      setMessages([
        {
          id: uuidv4(),
          text: "Willkommen beim FI Investments Support! Wie kann ich Ihnen helfen?",
          sender: 'ai',
          timestamp: new Date(),
          format: 'text'
        }
      ]);
    }
  }, [isOpen, chatId]);

  // Reset chat when closed
  useEffect(() => {
    if (!isOpen) {
      // Wait a bit before resetting to allow close animation
      const timer = setTimeout(() => {
        setMessages([]);
        setChatId('');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect message format
  const detectFormat = (text: string): 'text' | 'html' | 'markdown' => {
    if (!text) return 'text';
    
    // Simple detection for HTML - contains tags
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return 'html';
    }
    
    // Simple detection for Markdown - contains common markdown syntax
    if (/(\*\*|__|\*|_|##|###|\[.*\]\(.*\)|`{1,3})/i.test(text)) {
      return 'markdown';
    }
    
    return 'text';
  };

  // Render message based on format
  const renderMessage = (message: Message) => {
    switch (message.format) {
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: message.text }} />;
      case 'markdown':
        return <ReactMarkdown>{message.text}</ReactMarkdown>;
      case 'text':
      default:
        return <p>{message.text}</p>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    // Add user message to chat
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      format: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    // Send to webhook
    try {
      console.log(`Sending message to webhook as ${isNative ? 'native app' : 'web app'}`);
      
      const webhookUrl = 'https://agent.snipe-solutions.de/webhook/fi-chat';
      const requestBody = JSON.stringify({
        message: newMessage,
        userId: user.id,
        chatId: chatId,
        platform: Capacitor.getPlatform()
      });
      
      console.log('Request payload:', requestBody);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'capacitor://localhost',
          'X-Client-Info': `fi-investments-app/${Capacitor.getPlatform()}`
        },
        body: requestBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      const data = await response.json();
      console.log('Webhook response:', data);
      
      const aiResponseText = data.output || "Danke für Ihre Nachricht. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.";
      const format = detectFormat(aiResponseText);
      
      // Add AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date(),
          format: format
        }]);
        setIsTyping(false);
      }, 500);
      
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      
      // Add fallback AI response on error
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: "Es tut mir leid, es scheint ein Problem mit der Verbindung zu geben. Bitte versuchen Sie es später noch einmal.",
          sender: 'ai',
          timestamp: new Date(),
          format: 'text'
        }]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={`p-0 flex flex-col h-full ${isMobile ? 'w-[90vw]' : 'w-[400px] sm:w-[540px]'}`}>
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Support Chat</SheetTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-[#003595] text-white' 
                    : 'bg-gray-100 text-gray-800'
                } ${message.format === 'markdown' ? 'prose dark:prose-invert max-w-none' : ''}`}
              >
                {renderMessage(message)}
                <div className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <SheetFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreiben Sie eine Nachricht..."
              className="flex-1 resize-none"
              maxLength={500}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SupportChat;
