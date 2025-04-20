"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessageContext";
import { v4 as uuidv4 } from "uuid";

interface DealProposalProps {
  contactId: string;
  onClose: () => void;
}

export default function DealProposal({ contactId, onClose }: DealProposalProps) {
  const { user } = useAuth();
  const { sendMessage } = useMessages();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deliverables: "",
    timeline: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.title || !formData.description || !formData.budget) {
      setError("Please fill in required fields: Title, Description, and Budget.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Generate a unique deal ID
      const dealId = uuidv4();
      
      // Format the deal proposal as a structured message
      const dealProposalMessage = `📝 DEAL PROPOSAL\n\n` +
        `Title: ${formData.title}\n` +
        `Budget: $${formData.budget}\n` +
        `Timeline: ${formData.timeline || "Not specified"}\n\n` +
        `Description:\n${formData.description}\n\n` +
        `Deliverables:\n${formData.deliverables || "To be discussed"}\n\n` +
        `To respond to this proposal, please reply to this message.`;
      
      // Send the deal proposal message
      await sendMessage(contactId, dealProposalMessage, dealId);
      
      setSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("Error sending deal proposal:", err);
      setError(err.message || "Failed to send deal proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Create Deal Proposal</h3>
        <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-3 rounded-md flex items-center gap-2 mb-4">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">Deal proposal sent successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter deal title"
            disabled={isSubmitting || success}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe the deal details"
            rows={3}
            disabled={isSubmitting || success}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="budget" className="text-sm font-medium">
              Budget <span className="text-red-500">*</span>
            </label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="Enter budget"
              disabled={isSubmitting || success}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="timeline" className="text-sm font-medium">
              Timeline
            </label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) =>
                setFormData({ ...formData, timeline: e.target.value })
              }
              placeholder="e.g., 2 weeks"
              disabled={isSubmitting || success}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="deliverables" className="text-sm font-medium">
            Deliverables
          </label>
          <Textarea
            id="deliverables"
            value={formData.deliverables}
            onChange={(e) =>
              setFormData({ ...formData, deliverables: e.target.value })
            }
            placeholder="List the deliverables"
            rows={2}
            disabled={isSubmitting || success}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting || success}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sent!
              </>
            ) : (
              'Send Proposal'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}