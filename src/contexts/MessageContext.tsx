"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Message as FirebaseMessage, Contact } from "@/lib/types/message";
import { 
  sendMessage as firebaseSendMessage,
  markMessagesAsRead,
  listenToUserContacts,
  listenToMessages
} from "@/lib/services/messageService";
import { formatDistance } from "date-fns";
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Define the shape of the context value
interface MessageContextType {
  activeContact: Contact | null;
  setActiveContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  messages: Record<string, Message[]>;
  sendMessage: (contactId: string, content: string, dealId?: string, attachmentUrl?: string) => Promise<void>;
  contacts: Contact[];
  markAsRead: (contactId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the context with an initial undefined value
const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Convert Firebase message to the format our UI expects
const convertMessage = (message: FirebaseMessage, currentUserId: string): Message => {
  return {
    id: message.id,
    content: message.content,
    timestamp: message.timestamp,
    sender: message.senderId === currentUserId ? "user" : "contact",
    status: message.status,
    dealId: message.dealId,
    attachmentUrl: message.attachmentUrl,
  };
};

// For UI display
interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact"; // This is for UI display direction
  status: "sent" | "delivered" | "read";
  dealId?: string;
  attachmentUrl?: string;
}

// Define the Brandsync contact details
const brandsyncContact: Contact = {
  id: 'brandsync-support', // This ID identifies the sender in the backend message
  name: 'Brandsync',
  avatar: '/logo.svg', // Replace with your actual logo path
  lastMessage: 'Welcome to Brandsync!',
  lastMessageTime: new Date().toISOString(),
  unread: 1,
  status: 'online',
  role: 'ADMIN', // Or a suitable role
};

// Define the welcome message structure (closer to FirebaseMessage initially)
const welcomeMessageData = {
  id: uuidv4(),
  content: 'Welcome to Brandsync, the most trusted platform for managing collab deals between brands and influencers.',
  timestamp: new Date().toISOString(),
  senderId: brandsyncContact.id, // Use senderId matching the backend structure
  receiverId: '', // This will be the current user, but not needed for initial state
  status: 'delivered' as const, // Use 'as const' for type safety
};

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load contacts when user changes
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setMessages({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for contacts
    const unsubscribe = listenToUserContacts(user.uid, (newContacts) => {
      // Format the timestamp for display
      let formattedContacts = newContacts.map(contact => ({
        ...contact,
        lastMessageTime: contact.lastMessageTime 
          ? formatDistance(new Date(contact.lastMessageTime), new Date(), { addSuffix: true }) 
          : ''
      }));
      
      // Check if Brandsync contact exists, add if not
      const hasBrandsync = formattedContacts.some(c => c.id === brandsyncContact.id);
      if (!hasBrandsync) {
        formattedContacts = [brandsyncContact, ...formattedContacts];
        
        // Add the welcome message for the Brandsync contact, converting it for UI
        setMessages(prevMessages => ({
          ...prevMessages,
          [brandsyncContact.id]: [
            {
              id: welcomeMessageData.id,
              content: welcomeMessageData.content,
              timestamp: welcomeMessageData.timestamp,
              sender: 'contact', // Set sender type for UI display as it's from Brandsync
              status: welcomeMessageData.status,
            }
          ]
        }));
      }
      
      setContacts(formattedContacts);
      setIsLoading(false);
    });

    // Clean up the listener when component unmounts or user changes
    return () => {
      unsubscribe();
    };
  }, [user]);

  // Listen for messages when activeContact changes
  useEffect(() => {
    if (!user || !activeContact) return;

    // Don't fetch messages for the static Brandsync contact from backend initially
    // Check if only the initial welcome message exists
    const currentBrandsyncMessages = messages[brandsyncContact.id] || [];
    if (activeContact.id === brandsyncContact.id && 
        currentBrandsyncMessages.length === 1 && 
        currentBrandsyncMessages[0].id === welcomeMessageData.id) { 
       return; 
    }

    const unsubscribe = listenToMessages(
      user.uid,
      activeContact.id,
      (newMessages) => {
        // Convert Firebase messages to the format our UI expects
        const convertedMessages = newMessages.map(msg => 
          convertMessage(msg, user.uid)
        );

        setMessages(prev => {
          // Ensure welcome message isn't overwritten if fetching for Brandsync
          const existingMessages = prev[activeContact.id] || [];
          const welcomeMsg = activeContact.id === brandsyncContact.id ? existingMessages.find(m => m.id === welcomeMessageData.id) : undefined;
          
          // Filter out potential duplicates from the backend fetch if the welcome message ID somehow matches
          const uniqueNewMessages = convertedMessages.filter(m => m.id !== welcomeMessageData.id);
          
          const combinedMessages = welcomeMsg ? [welcomeMsg, ...uniqueNewMessages] : uniqueNewMessages;
          
          return {
             ...prev,
             [activeContact.id]: combinedMessages
          };
        });
      }
    );

    // Clean up the listener when component unmounts or activeContact changes
    return () => {
      unsubscribe();
    };
  }, [user, activeContact, messages]); // Correct dependency array

  // Mark messages as read when activeContact changes
  useEffect(() => {
    if (!user || !activeContact) return;

    // Only mark as read if there are unread messages AND it's not the Brandsync contact
    // (since the welcome message starts as unread but isn't from the backend)
    if (activeContact.id !== brandsyncContact.id && activeContact.unread > 0) {
      markAsRead(activeContact.id).catch(err => {
        console.error("Failed to mark messages as read:", err);
      });
    }
  }, [user, activeContact]); // Removed markAsRead from dependencies as it causes loops

  // Add attachmentUrl parameter and pass it to firebaseSendMessage
  const sendMessage = async (contactId: string, content: string, dealId?: string, attachmentUrl?: string) => {
    if (!user) throw new Error("You must be logged in to send messages");
    
    try {
      // Pass attachmentUrl to the service function
      await firebaseSendMessage(user.uid, contactId, content, dealId, attachmentUrl); 
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      throw err;
    }
  };

  const markAsRead = async (contactId: string) => {
    if (!user) throw new Error("You must be logged in to mark messages as read");
    
    try {
      await markMessagesAsRead(user.uid, contactId);
      
      // Update the local contacts state to reflect read status
      setContacts(prev => 
        prev.map(contact => 
          contact.id === contactId 
            ? { ...contact, unread: 0 }
            : contact
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to mark messages as read");
      throw err;
    }
  };

  return (
    <MessageContext.Provider
      value={{
        activeContact,
        setActiveContact,
        messages,
        sendMessage,
        contacts,
        markAsRead,
        isLoading,
        error
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