"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface DealProposalProps {
  contactId: string;
  onClose: () => void;
}

export default function DealProposal({ contactId, onClose }: DealProposalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deliverables: "",
    timeline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle deal proposal submission
    console.log("Deal proposal submitted:", formData);
    onClose();
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Create Deal Proposal</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter deal title"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe the deal details"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="budget" className="text-sm font-medium">
              Budget
            </label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="Enter budget"
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
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Proposal</Button>
        </div>
      </form>
    </div>
  );
} 