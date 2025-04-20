"use client";

import { useState, useEffect, useRef } from "react";
import { FadeUp } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ContactList from "@/components/chat/ContactList";
import DealProposal from "@/components/chat/DealProposal";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog"; // Corrected import path
import { useMessages } from "@/contexts/MessageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Send, 
  PaperclipIcon, 
  Image as ImageIcon, 
  Smile, 
  FileText,
  Loader2,
  AlertCircle,
  Menu, // Import Menu icon for mobile toggle
  MessagesSquare // Import MessagesSquare icon
} from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase/config";
import { v4 as uuidv4 } from "uuid";

const Messages = () => {
  const { user } = useAuth();
  const { 
    activeContact, 
    setActiveContact, 
    messages, 
    sendMessage, 
    contacts,
    markAsRead,
    isLoading,
    error
  } = useMessages();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDealModalOpen, setIsDealModalOpen] = useState(false); // State for deal modal
  const [isSending, setIsSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isContactListVisible, setIsContactListVisible] = useState(false); // State for mobile contact list visibility
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null); // Ref for the message container

  // Scroll to bottom when messages change or active contact changes
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, activeContact]);

  // Mark messages as read when a contact is activated
  useEffect(() => {
    if (activeContact && user) {
      markAsRead(activeContact.id);
    }
  }, [activeContact, user, markAsRead]);

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact || (!newMessage.trim() && !attachmentFile)) return;
    if (!user) return; // Ensure user is logged in

    setIsSending(true);
    let attachmentUrl: string | undefined = undefined;

    try {
      // Upload attachment if exists
      if (attachmentFile) {
        const storage = getStorage(app);
        const fileExtension = attachmentFile.name.split('.').pop();
        const fileName = `attachments/${user?.uid}/${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, attachmentFile);
        attachmentUrl = await getDownloadURL(storageRef);
      }
      
      // Send message
      await sendMessage(
        activeContact.id, 
        newMessage.trim() || (attachmentFile ? 'Sent an attachment' : ''),
        undefined, // dealId
        attachmentUrl
      );
      
      // Reset form
      setNewMessage('');
      setAttachmentFile(null);
      setAttachmentPreview('');
      setUploadProgress(0);
      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation (optional: add size limit, etc.)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type.');
      return;
    }
    
    setAttachmentFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Generic icon for non-image files
      setAttachmentPreview('');
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (isLoading && !activeContact && contacts.length === 0) { // Adjusted condition slightly
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col"> 
        <div className="flex h-[calc(100vh-0px)]"> {/* Adjust height calculation if you have a fixed Navbar */}
          
          {/* Contact Sidebar - Conditional rendering for mobile */}
          <div className={`
            ${isContactListVisible ? 'fixed inset-0 z-40 flex' : 'hidden'} 
            md:static md:z-auto md:flex 
            w-full md:w-80 lg:w-96 
            flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out
          `}>
            <ContactList 
              contacts={filteredContacts}
              activeContact={activeContact}
              // Update setActiveContact to hide list on mobile after selection
              setActiveContact={(contact) => {
                setActiveContact(contact);
                if (window.innerWidth < 768) {
                  setIsContactListVisible(false);
                }
              }}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading && contacts.length === 0} // Pass loading state
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-muted/20">
            {activeContact ? (
              <>
                {/* Pass toggle function and visibility state to header */}
                <ChatHeader 
                  contact={activeContact} 
                  onToggleContacts={() => setIsContactListVisible(!isContactListVisible)}
                  isContactListVisible={isContactListVisible}
                />
                
                {/* Remove embedded DealProposal */}
                
                {/* Messages - Add ref to the scrollable container */}
                <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  <MessageList 
                    messages={messages[activeContact.id] || []}
                    messagesEndRef={messagesEndRef}
                  />
                </div>

                {/* Message input area */}
                <div className="p-4 border-t border-border bg-background">
                  {/* Attachment preview */}
                  {attachmentFile && (
                    <div className="mb-2 p-2 border rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {attachmentPreview ? (
                          <img 
                            src={attachmentPreview} 
                            alt="Attachment preview" 
                            className="h-12 w-12 object-cover rounded" 
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {attachmentFile.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(attachmentFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={removeAttachment}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* File attachment button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach File" // Add tooltip
                    >
                      <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    
                    {/* Image attachment button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      title="Attach Image" // Add tooltip
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = "image/*";
                          fileInputRef.current.click();
                          // Reset accept attribute after a short delay
                          setTimeout(() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                            }
                          }, 500);
                        }
                      }}
                    >
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>

                    {/* Deal Proposal Button - Triggers Modal */}
                    <Dialog open={isDealModalOpen} onOpenChange={setIsDealModalOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          type="button"
                          title="Create Deal Proposal" // Add tooltip
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px]">
                        {/* Render DealProposal inside the modal */}
                        <DealProposal 
                          contactId={activeContact.id}
                          onClose={() => setIsDealModalOpen(false)} // Close modal on success/cancel
                        />
                      </DialogContent>
                    </Dialog>
                    
                    <Input
                      className="flex-1 h-10" // Ensure consistent height
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      autoComplete="off" // Prevent browser autocomplete
                    />
                    
                    {/* Emoji button (optional) */}
                    {/* <Button variant="ghost" size="icon" type="button">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button> */}
                    
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isSending || (!newMessage.trim() && !attachmentFile)}
                      title="Send Message" // Add tooltip
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              // Placeholder when no contact is selected
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 {/* Button to show contacts on mobile when none selected */}
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden absolute top-4 left-4" // Position for mobile
                    onClick={() => setIsContactListVisible(true)}
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                <MessagesSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-1">Select a conversation</h3>
                <p className="text-muted-foreground max-w-xs">
                  Choose a contact from the list to start messaging or view past conversations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;