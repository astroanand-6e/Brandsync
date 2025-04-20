"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MessagesSquare } from "lucide-react";
import { Contact } from "@/lib/types/message";
import { formatDistance } from 'date-fns'; // Import formatDistance

interface ContactListProps {
  contacts: Contact[];
  activeContact: Contact | null;
  setActiveContact: (contact: Contact) => void; // Ensure this matches the usage in messages/page.tsx
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading?: boolean;
}

export default function ContactList({
  contacts,
  activeContact,
  setActiveContact,
  searchTerm,
  setSearchTerm,
  isLoading = false,
}: ContactListProps) {
  const getRoleBadgeColor = (role?: string) => {
    if (!role) return "bg-gray-100 text-gray-800";
    
    switch (role) {
      case "BRAND":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "INFLUENCER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Function to format time relative to now
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return formatDistance(new Date(isoString), new Date(), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return ''; // Return empty string on error
    }
  };

  return (
    // Added overflow-y-auto and flex-1 to make the list scrollable
    <div className="border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search" // Use type="search" for better semantics
            placeholder="Search contacts..."
            className="pl-10 w-full h-10" // Ensure consistent height
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Scrollable contact list area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
            <MessagesSquare className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? "No contacts match your search" 
                : "No conversations yet. Start chatting!"}
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)} // This now correctly calls the passed function
              className={`w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${ // Use p-3 for slightly less padding
                activeContact?.id === contact.id ? "bg-muted" : ""
              }`}
            >
              <div className="relative flex-shrink-0"> {/* Added flex-shrink-0 */}
                <Avatar className="h-10 w-10"> {/* Consistent size */}
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>
                    {contact.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${ // Adjusted size/position slightly
                    contact.status === "online" ? "bg-green-500" : "bg-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0"> {/* Ensure text truncates */}
                <div className="flex items-center justify-between mb-0.5"> {/* Reduced margin */}
                  <div className="flex items-center gap-1.5 max-w-[70%] truncate"> {/* Ensure name truncates */}
                    <h3 className="font-medium truncate text-sm">{contact.name}</h3> {/* Adjusted text size */}
                    {contact.role && (
                      <span 
                        className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${getRoleBadgeColor(contact.role)}`} // Added whitespace-nowrap
                      >
                        {contact.role === "BRAND" ? "Brand" : contact.role === "INFLUENCER" ? "Influencer" : contact.role} {/* Handle different roles */}
                      </span>
                    )}
                  </div>
                  {contact.lastMessageTime && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-1"> {/* Added flex-shrink-0 */}
                      {formatRelativeTime(contact.lastMessageTime)} {/* Use relative time */}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                    {contact.lastMessage || "No messages yet"}
                  </p>
                  {contact.unread > 0 && (
                    <Badge className="bg-primary rounded-full h-5 w-5 flex items-center justify-center p-0 min-w-[20px] text-xs flex-shrink-0"> {/* Added flex-shrink-0 */}
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}