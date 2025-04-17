"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video } from "lucide-react";

interface ChatHeaderProps {
  contact: {
    name: string;
    avatar: string;
    status: "online" | "offline";
  };
}

export default function ChatHeader({ contact }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback>
            {contact.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{contact.name}</h2>
          <p className="text-sm text-muted-foreground">
            {contact.status === "online" ? "Online" : "Offline"}
          </p>
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