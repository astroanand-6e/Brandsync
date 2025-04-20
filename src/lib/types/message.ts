// Types for our messaging system

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  content: string;
  timestamp: string;  // ISO string format
  senderId: string;
  receiverId: string;
  status: MessageStatus;
  dealId?: string;  // Optional reference to a deal if message is related to one
  attachmentUrl?: string; // Optional URL for attachments
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
  status: 'online' | 'offline';
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN';
}

export interface UserContact {
  userId: string;
  contactId: string;
  unreadCount: number;
  lastMessageId?: string;
  lastReadTimestamp?: string;
}

export interface ChatRoom {
  id: string;
  participantIds: string[]; // Array of userId strings
  lastMessageTimestamp: string;
  dealId?: string; // Optional reference to a deal
}