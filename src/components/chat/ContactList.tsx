"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
  status: "online" | "offline";
}

interface ContactListProps {
  contacts: Contact[];
  activeContact: Contact | null;
  setActiveContact: (contact: Contact) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ContactList({
  contacts,
  activeContact,
  setActiveContact,
  searchTerm,
  setSearchTerm,
}: ContactListProps) {
  return (
    <div className="border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => setActiveContact(contact)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
              activeContact?.id === contact.id ? "bg-muted" : ""
            }`}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>
                  {contact.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                  contact.status === "online" ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{contact.name}</h3>
                {contact.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">
                    {contact.lastMessageTime}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {contact.lastMessage}
                </p>
                {contact.unread > 0 && (
                  <Badge variant="secondary">{contact.unread}</Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 