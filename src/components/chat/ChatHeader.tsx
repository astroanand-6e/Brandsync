"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Phone, Video, Menu, X } from "lucide-react"; // Import Menu and X icons

interface ChatHeaderProps {
  contact: {
    name: string;
    avatar: string;
    status: "online" | "offline";
    role?: string;
  };
  onToggleContacts: () => void; // Add prop for toggling contacts
  isContactListVisible: boolean; // Add prop to know the current state
}

export default function ChatHeader({ contact, onToggleContacts, isContactListVisible }: ChatHeaderProps) {
  // Format role for display
  const displayRole = () => {
    if (!contact.role) return null;
    
    return (
      <Badge variant="outline" className="ml-2 text-xs">
        {contact.role === "BRAND" ? "Brand" : "Influencer"}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" // Only show on mobile
          onClick={onToggleContacts}
        >
          {isContactListVisible ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        
        <Avatar>
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback>
            {contact.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center">
            <h2 className="font-semibold">{contact.name}</h2>
            {displayRole()}
          </div>
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2 ${contact.status === "online" ? "bg-green-500" : "bg-gray-400"} rounded-full mr-1`}>
              {contact.status === "online" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
            </span>
            <p className="text-sm text-muted-foreground">
              {contact.status === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}