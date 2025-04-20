"use client";

import { format } from "date-fns";
import { Check, CheckCheck, Loader2, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  status: "sent" | "delivered" | "read";
  dealId?: string;
  attachmentUrl?: string;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Determine attachment type and render appropriate preview
  const renderAttachment = (url: string) => {
    if (!url) return null;
    
    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const isPdf = url.match(/\.(pdf)$/i);
    
    if (isImage) {
      return (
        <div className="mb-2 cursor-pointer" onClick={() => setExpandedImage(url)}>
          <img 
            src={url} 
            alt="Attachment" 
            className="max-h-40 rounded-md object-cover" 
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 p-2 bg-muted/50 rounded mb-2"
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm underline">View document</span>
        </a>
      );
    } else {
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 p-2 bg-muted/50 rounded mb-2"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="text-sm underline">View attachment</span>
        </a>
      );
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-60">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.attachmentUrl && renderAttachment(message.attachmentUrl)}
              
              <p className="text-sm">{message.content}</p>
              
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">
                  {format(new Date(message.timestamp), "h:mm a")}
                </span>
                {message.sender === "user" && (
                  <span className="text-xs">
                    {message.status === "sent" && (
                      <Check className="h-3 w-3 opacity-50" />
                    )}
                    {message.status === "delivered" && (
                      <Check className="h-3 w-3" />
                    )}
                    {message.status === "read" && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Image preview modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded attachment"
            className="max-w-full max-h-full object-contain"
          />
        </div>  
      )}
    </>
  );
}