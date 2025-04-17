"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
  status: "online" | "offline";
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  status: "sent" | "delivered" | "read";
}

interface MessageContextType {
  activeContact: Contact | null;
  setActiveContact: (contact: Contact | null) => void;
  messages: Record<string, Message[]>;
  sendMessage: (contactId: string, content: string) => void;
  contacts: Contact[];
  markAsRead: (contactId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      lastMessage: "Looking forward to working together!",
      lastMessageTime: "2h ago",
      unread: 0,
      status: "online"
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "/placeholder.svg",
      lastMessage: "Can we discuss the campaign details?",
      lastMessageTime: "1d ago",
      unread: 2,
      status: "offline"
    },
    {
      id: "3",
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
      lastMessage: "The content looks great!",
      lastMessageTime: "3d ago",
      unread: 0,
      status: "online"
    }
  ]);

  const sendMessage = (contactId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      sender: "user",
      status: "sent"
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage]
    }));
  };

  const markAsRead = (contactId: string) => {
    setContacts((prev: Contact[]) => 
      prev.map((contact: Contact) => 
        contact.id === contactId 
          ? { ...contact, unread: 0 }
          : contact
      )
    );
  };

  return (
    <MessageContext.Provider
      value={{
        activeContact,
        setActiveContact,
        messages,
        sendMessage,
        contacts,
        markAsRead
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
} 