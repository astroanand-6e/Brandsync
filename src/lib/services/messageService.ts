// Firebase message service for handling messaging functionality
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc, 
  getDoc,
  getDocs,
  updateDoc, 
  serverTimestamp,
  Timestamp,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { Message, ChatRoom, UserContact, MessageStatus } from '@/lib/types/message';
import { v4 as uuidv4 } from 'uuid';

// Collection references
const messagesRef = collection(firestore, 'messages');
const chatRoomsRef = collection(firestore, 'chatRooms');
const userContactsRef = collection(firestore, 'userContacts');
const usersRef = collection(firestore, 'users'); // For user profile info

// Convert Firestore data to our Message type
const convertMessage = (doc: QueryDocumentSnapshot<DocumentData>): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    content: data.content,
    timestamp: data.timestamp.toDate().toISOString(),
    senderId: data.senderId,
    receiverId: data.receiverId,
    status: data.status,
    dealId: data.dealId,
    attachmentUrl: data.attachmentUrl,
  };
};

/**
 * Create or get an existing chat room between two users
 */
export const getChatRoom = async (userId1: string, userId2: string): Promise<string> => {
  // Sort IDs to ensure consistent room creation/lookup
  const participantIds = [userId1, userId2].sort();
  
  // Try to find existing chat room
  const chatRoomQuery = query(
    chatRoomsRef,
    where('participantIds', '==', participantIds)
  );

  const chatRooms = await getDocs(chatRoomQuery);
  
  // If room exists, return its ID
  if (!chatRooms.empty) {
    return chatRooms.docs[0].id;
  }
  
  // Otherwise create a new room
  const newChatRoom: ChatRoom = {
    id: uuidv4(),
    participantIds,
    lastMessageTimestamp: new Date().toISOString(),
  };
  
  const chatRoomDoc = await addDoc(chatRoomsRef, newChatRoom);
  return chatRoomDoc.id;
};

/**
 * Send a message between two users
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  dealId?: string,
  attachmentUrl?: string
): Promise<string> => {
  try {
    // Get chat room
    const chatRoomId = await getChatRoom(senderId, receiverId);
    
    // Create message
    const timestamp = Timestamp.now();
    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp,
      status: 'sent' as MessageStatus,
      chatRoomId,
      dealId,
      attachmentUrl,
    };
    
    // Add message to Firestore
    const messageRef = await addDoc(messagesRef, messageData);
    
    // Update the chat room with last message timestamp
    await updateDoc(doc(chatRoomsRef, chatRoomId), {
      lastMessageTimestamp: timestamp,
      lastMessageContent: content.substring(0, 100), // Preview of message
    });
    
    // Increment unread counter for receiver
    await updateUserContact(senderId, receiverId, content, timestamp.toDate().toISOString(), messageRef.id);
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Update user contact with last message details and unread count
 */
const updateUserContact = async (
  senderId: string,
  receiverId: string,
  lastMessage: string,
  timestamp: string,
  messageId: string
) => {
  // Find the receiver's contact record
  const contactQuery = query(
    userContactsRef,
    where('userId', '==', receiverId),
    where('contactId', '==', senderId)
  );
  
  const contactDocs = await getDocs(contactQuery);
  
  if (contactDocs.empty) {
    // Create new contact
    await addDoc(userContactsRef, {
      userId: receiverId,
      contactId: senderId,
      unreadCount: 1,
      lastMessageId: messageId,
      lastMessagePreview: lastMessage.substring(0, 100),
      lastMessageTimestamp: timestamp,
    });
  } else {
    // Update existing contact
    const contactDoc = contactDocs.docs[0];
    await updateDoc(contactDoc.ref, {
      unreadCount: (contactDoc.data().unreadCount || 0) + 1,
      lastMessageId: messageId,
      lastMessagePreview: lastMessage.substring(0, 100),
      lastMessageTimestamp: timestamp,
    });
  }
  
  // Make sure sender also has a contact record
  const senderContactQuery = query(
    userContactsRef,
    where('userId', '==', senderId),
    where('contactId', '==', receiverId)
  );
  
  const senderContactDocs = await getDocs(senderContactQuery);
  
  if (senderContactDocs.empty) {
    // Create sender's contact record with 0 unread
    await addDoc(userContactsRef, {
      userId: senderId,
      contactId: receiverId,
      unreadCount: 0,
      lastMessageId: messageId,
      lastMessagePreview: lastMessage.substring(0, 100),
      lastMessageTimestamp: timestamp,
    });
  } else {
    // Update sender's contact record
    await updateDoc(senderContactDocs.docs[0].ref, {
      lastMessageId: messageId,
      lastMessagePreview: lastMessage.substring(0, 100),
      lastMessageTimestamp: timestamp,
    });
  }
};

/**
 * Set messages as read for a specific contact
 */
export const markMessagesAsRead = async (userId: string, contactId: string): Promise<void> => {
  try {
    // Find messages to mark as read
    const messagesToUpdate = query(
      messagesRef,
      where('senderId', '==', contactId),
      where('receiverId', '==', userId),
      where('status', 'in', ['sent', 'delivered'])
    );
    
    const messages = await getDocs(messagesToUpdate);
    
    // Update each message
    const updatePromises = messages.docs.map(messageDoc => 
      updateDoc(messageDoc.ref, { status: 'read' as MessageStatus })
    );
    
    await Promise.all(updatePromises);
    
    // Reset unread counter
    const userContactQuery = query(
      userContactsRef,
      where('userId', '==', userId),
      where('contactId', '==', contactId)
    );
    
    const userContacts = await getDocs(userContactQuery);
    
    if (!userContacts.empty) {
      await updateDoc(userContacts.docs[0].ref, {
        unreadCount: 0,
        lastReadTimestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get real-time messages for a specific chat room
 */
export const listenToMessages = (
  userId: string,
  contactId: string,
  callback: (messages: Message[]) => void
): () => void => {
  // Sort IDs to ensure consistent chat room lookup
  const participants = [userId, contactId].sort();
  
  // Query for the chat room
  const chatRoomQuery = query(
    chatRoomsRef,
    where('participantIds', '==', participants),
    limit(1)
  );
  
  // First, get the chat room
  const unsubscribeChatRoom = onSnapshot(chatRoomQuery, async (chatSnapshot) => {
    if (chatSnapshot.empty) {
      callback([]);
      return;
    }
    
    const chatRoomId = chatSnapshot.docs[0].id;
    
    // Then listen to messages in that room
    const messagesQuery = query(
      messagesRef,
      where('chatRoomId', '==', chatRoomId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(convertMessage);
      callback(messages);
      
      // Auto-mark as delivered any messages sent to this user
      snapshot.docChanges().forEach((change) => {
        if (
          change.type === 'added' && 
          change.doc.data().receiverId === userId && 
          change.doc.data().status === 'sent'
        ) {
          updateDoc(change.doc.ref, { status: 'delivered' });
        }
      });
    });
    
    // Return a clean-up function for both listeners
    return () => {
      unsubscribeMessages();
    };
  });
  
  // Return a cleanup function
  return () => unsubscribeChatRoom();
};

/**
 * Get all contacts for a user with latest message info
 */
export const getUserContacts = async (userId: string): Promise<any[]> => {
  try {
    const contactsQuery = query(
      userContactsRef,
      where('userId', '==', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    const contactSnapshot = await getDocs(contactsQuery);
    const contacts = contactSnapshot.docs.map(doc => doc.data());
    
    // Fetch user details for each contact
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        const userDoc = await getDoc(doc(usersRef, contact.contactId));
        const userData = userDoc.data();
        
        return {
          id: contact.contactId,
          name: userData?.displayName || 'Unknown User',
          avatar: userData?.photoURL || '',
          lastMessage: contact.lastMessagePreview || '',
          lastMessageTime: contact.lastMessageTimestamp || '',
          unread: contact.unreadCount || 0,
          status: userData?.online ? 'online' : 'offline',
          role: userData?.role || 'INFLUENCER',
        };
      })
    );
    
    return contactsWithDetails;
  } catch (error) {
    console.error('Error getting user contacts:', error);
    throw error;
  }
};

/**
 * Listen to changes in the user's contacts
 */
export const listenToUserContacts = (
  userId: string,
  callback: (contacts: any[]) => void
): () => void => {
  const contactsQuery = query(
    userContactsRef,
    where('userId', '==', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );
  
  return onSnapshot(contactsQuery, async (snapshot) => {
    const contacts = snapshot.docs.map(doc => doc.data());
    
    // Fetch user details for each contact
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        const userDoc = await getDoc(doc(usersRef, contact.contactId));
        const userData = userDoc.data();
        
        return {
          id: contact.contactId,
          name: userData?.displayName || 'Unknown User',
          avatar: userData?.photoURL || '',
          lastMessage: contact.lastMessagePreview || '',
          lastMessageTime: contact.lastMessageTimestamp || '',
          unread: contact.unreadCount || 0,
          status: userData?.online ? 'online' : 'offline',
          role: userData?.role || 'INFLUENCER',
        };
      })
    );
    
    callback(contactsWithDetails);
  });
};