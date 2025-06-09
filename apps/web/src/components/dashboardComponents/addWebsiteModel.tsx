"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWebsite } from "@/hooks/useWebsite";
import { Globe, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddWebsiteModalProps {
  trigger?: React.ReactNode;
}

export function AddWebsiteModal({ trigger }: AddWebsiteModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
  });

  const createWebsite = useCreateWebsite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url || !formData.title) {
      toast.error("URL and title are required");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      await createWebsite.mutateAsync({
        url: formData.url,
        title: formData.title,
        description: formData.description || undefined,
      });

      // Reset form and close modal
      setFormData({ url: "", title: "", description: "" });
      setOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Add New Website
          </DialogTitle>
          <DialogDescription>
            Add a new website to monitor its uptime and performance. We'll start
            checking it immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              required
              disabled={createWebsite.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Include the full URL including https://
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Display Name *</Label>
            <Input
              id="title"
              placeholder="My Website"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              disabled={createWebsite.isPending}
            />
            <p className="text-xs text-muted-foreground">
              A friendly name to identify this website
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this website..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={createWebsite.isPending}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createWebsite.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWebsite.isPending}>
              {createWebsite.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Website
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
