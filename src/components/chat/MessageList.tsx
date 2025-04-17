"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  status: "sent" | "delivered" | "read";
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <p className="text-sm">{message.content}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs opacity-70">
                {format(new Date(message.timestamp), "h:mm a")}
              </span>
              {message.sender === "user" && (
                <span className="text-xs">
                  {message.status === "read" ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 