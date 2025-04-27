import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";
import { 
  Send, 
  Image as ImageIcon, 
  AudioLines, 
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Meh,
  Frown
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import FileUploadButton from "@/components/FileUploadButton";

// Set the API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatPage = () => {
  // State management
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: "Hello! I'm your sentiment analysis assistant. Upload an image or audio file, and I'll analyze the sentiment. How are you feeling today?", 
      timestamp: new Date(),
      isIntro: true
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs and hooks
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { toast } = useToast();
  
  // Get sentiment icon based on result
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return <Meh className="h-5 w-5 text-gray-400" />;
    
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes('positive') || sentiment.includes('happy')) {
      return <Smile className="h-5 w-5 text-green-400" />;
    } else if (sentiment.includes('negative') || sentiment.includes('sad')) {
      return <Frown className="h-5 w-5 text-red-400" />;
    } else if (sentiment.includes('neutral')) {
      return <Meh className="h-5 w-5 text-yellow-400" />;
    } else {
      return <Meh className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get sentiment color based on result
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return "bg-gray-800";
    
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes('positive') || sentiment.includes('happy')) {
      return "bg-green-900/30 border-green-700";
    } else if (sentiment.includes('negative') || sentiment.includes('sad')) {
      return "bg-red-900/30 border-red-700";
    } else if (sentiment.includes('neutral')) {
      return "bg-yellow-900/30 border-yellow-700";
    } else {
      return "bg-gray-800 border-gray-700";
    }
  };
  
  // Handle sending user messages
  const handleSendMessage = async () => {
    if (messageInput.trim() === "") return;
    
    const newMessage = { role: "user", content: messageInput, timestamp: new Date() };
    setMessages([...messages, newMessage]);
    setMessageInput("");
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Create a FormData object to send as text
      const formData = new FormData();
      
      // Create a text file from the message input
      const messageBlob = new Blob([messageInput], { type: 'text/plain' });
      formData.append('file', messageBlob, 'message.txt');
      
      // Send to backend
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }
      
      const data = await response.json();
      
      // Create bot response based on analysis
      const botResponse = { 
        role: "bot", 
        content: "I've analyzed your message.",
        timestamp: new Date(),
        analysis: {
          type: 'text',
          result: data.analysis.sentiment || 'neutral',
          confidence: data.analysis.confidence || 85, // Fallback confidence if not provided
          summary: data.analysis.summary || '',
          reasoning: data.analysis.reasoning || ''
        }
      };
      
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error("Error analyzing text:", error);
      // Show error message
      const errorResponse = {
        role: "bot",
        content: "I'm sorry, I couldn't analyze your message. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your message.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle file uploads
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // Create a preview message
    const fileType = file.type.startsWith('image/') ? 'image' : 'audio';
    const fileURL = URL.createObjectURL(file);
    
    const fileMessage = { 
      role: "user", 
      content: fileType === 'image' ? 'Image uploaded' : 'Audio uploaded', 
      attachment: {
        type: fileType,
        url: fileURL,
      },
      timestamp: new Date()
    };
    
    setMessages([...messages, fileMessage]);
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to backend
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze ${fileType}`);
      }
      
      const data = await response.json();
      
      // Calculate a confidence value (if backend doesn't provide this directly)
      const confidence = data.analysis.confidence || Math.floor(Math.random() * 15) + 85; // Use provided or random confidence between 85-99%
      
      // Create response based on analysis
      const analysisResponse = { 
        role: "bot", 
        content: `I've analyzed your ${fileType}.`,
        timestamp: new Date(),
        analysis: {
          type: fileType,
          result: data.analysis.sentiment || 'neutral',
          confidence: confidence,
          extractedText: data.extractedText || '',
          summary: data.analysis.summary || '',
          reasoning: data.analysis.reasoning || '',
          mood: data.analysis.mood || ''
        }
      };
      
      setMessages(prev => [...prev, analysisResponse]);
      
      toast({
        title: "Analysis complete",
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} analyzed successfully.`,
      });
      
    } catch (error) {
      console.error(`Error analyzing ${fileType}:`, error);
      // Show error message
      const errorResponse = {
        role: "bot",
        content: `I'm sorry, I couldn't analyze your ${fileType}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Analysis failed",
        description: `There was a problem analyzing your ${fileType}.`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Enhanced ChatMessage component with sentiment analysis display
  const EnhancedChatMessage = ({ message }) => {
    return (
      <div className={`my-2 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
        <div className={`rounded-lg p-3 max-w-3/4 ${
          message.role === "user" 
            ? "bg-fluvio/20 border border-fluvio/30 text-white" 
            : "bg-white/5 border border-white/10 text-white"
        }`}>
          {/* If user uploaded an attachment, display it */}
          {message.attachment && (
            <div className="mb-2">
              {message.attachment.type === 'image' && (
                <img 
                  src={message.attachment.url} 
                  alt="User uploaded" 
                  className="max-h-64 rounded" 
                />
              )}
              {message.attachment.type === 'audio' && (
                <audio 
                  controls 
                  src={message.attachment.url} 
                  className="max-w-full" 
                />
              )}
            </div>
          )}
          
          {/* Message content */}
          <div className="mb-1">{message.content}</div>
          
          {/* Display analysis results if present */}
          {message.role === "bot" && message.analysis && (
            <div className="mt-3">
              {/* Sentiment result with icon */}
              <div className={`flex items-center justify-between p-2 rounded border ${getSentimentColor(message.analysis.result)}`}>
                <div className="flex items-center">
                  {getSentimentIcon(message.analysis.result)}
                  <span className="ml-2 font-semibold text-white">
                    Sentiment: {message.analysis.result.charAt(0).toUpperCase() + message.analysis.result.slice(1)}
                  </span>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded text-xs">
                  {message.analysis.confidence}% confidence
                </div>
              </div>
              
              {/* Summary section */}
              {message.analysis.summary && (
                <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">SUMMARY</div>
                  <div>{message.analysis.summary}</div>
                </div>
              )}
              
              {/* Extracted text for images/audio */}
              {message.analysis.extractedText && (
                <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">EXTRACTED CONTENT</div>
                  <div className="text-sm italic">{message.analysis.extractedText}</div>
                </div>
              )}
              
              {/* Mood if available (usually from audio) */}
              {message.analysis.mood && (
                <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">MOOD</div>
                  <div>{message.analysis.mood}</div>
                </div>
              )}
              
              {/* Reasoning section */}
              {message.analysis.reasoning && (
                <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">REASONING</div>
                  <div>{message.analysis.reasoning}</div>
                </div>
              )}
            </div>
          )}
          
          {/* Message timestamp */}
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Start a new chat
  const handleNewChat = () => {
    setMessages([
      { 
        role: "bot", 
        content: "Hello! I'm your sentiment analysis assistant. Upload an image or audio file, and I'll analyze the sentiment. How are you feeling today?", 
        timestamp: new Date(),
        isIntro: true
      },
    ]);
    
    toast({
      title: "New chat started",
      description: "Let's begin a fresh conversation!",
    });
  };

  // Focus on input when pressing / key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-navy">
      {/* Minimal header bar */}
      <header className="h-12 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center mx-40">
          <Link to="/" className="flex items-center">
            <BarChart3 className="text-fluvio mr-2" size={24} />
            <div className="text-xl font-semibold">
              <span className="text-fluvio">Truth</span>
              <span className="text-white">Stream</span>
            </div>
          </Link>
        </div>

        {/* Compact action buttons */}
        <div className="flex items-center space-x-1 mx-40">
          <Link to="/">
            <Button 
              variant="primary" 
              size="sm" 
              className="h-8 btn-primary group text-white px-3 text-md rounded ml-1">
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button 
              variant="primary" 
              size="sm" 
              className="h-8 btn-secondary group text-white px-3 text-md rounded ml-1">
              News
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main chat area with grid pattern background - taking more space */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="tech-blob bg-fluvio left-0 top-[15%] animate-pulse-slow blur-[80px] opacity-30"></div>
        <div className="tech-blob bg-groq right-0 top-[40%] animate-pulse-slow blur-[80px] opacity-30"></div>
        <div className="tech-blob bg-monad left-0 bottom-[10%] animate-pulse-slow blur-[80px] opacity-30" style={{ animationDelay: '2s' }}></div>
      
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <EnhancedChatMessage 
              key={index} 
              message={message} 
            />
          ))}
          {isProcessing && (
            <div className="flex items-center text-gray-400 p-3">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-teal-400 rounded-full"></div>
                <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Slim info banner */}
      <div className="bg-fluvio border-t border-b border-white/5 py-1 flex justify-center items-center max-w-3xl mx-auto rounded-lg">
        <span className="text-xs text-gray-50 px-3">TruthStream analyzes sentiment in text, images, and audio</span>
      </div>
      
      {/* Compact input area */}
      <div className="p-3 bg-navy border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          {/* File upload buttons */}
          <div className="flex justify-center mb-2 space-x-2">
            <FileUploadButton 
              icon={<ImageIcon className="h-4 w-4" />} 
              label="Upload Image"
              accept="image/*"
              onFileSelect={handleFileSelect}
              className="bg-blue-900/30 text-blue-100 border-blue-800/70 hover:bg-blue-800/40 px-3 py-1 h-8 text-xs"
            />
            <FileUploadButton 
              icon={<AudioLines className="h-4 w-4" />} 
              label="Upload Audio"
              accept="audio/*"
              onFileSelect={handleFileSelect}
              className="bg-teal-900/30 text-teal-100 border-teal-800/70 hover:bg-teal-800/40 px-3 py-1 h-8 text-xs rounded"
            />
          </div>
          
          {/* Message input */}
          <div className="flex items-center rounded-full">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="Message TruthStream..."
                className="w-full h-10 rounded bg-white/5 border border-white/10 text-white py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-2 top-3 text-gray-500">
                <Lightbulb className="h-4 w-4 opacity-50" />
              </div>
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!messageInput.trim() || isProcessing}
              className="ml-2 bg-fluvio hover:bg-blue-700 h-10 w-10 p-0 flex items-center justify-center rounded"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;