import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Send } from "lucide-react";

const formSchema = z.object({
  storyTitle: z.string().min(1, "Story title is required").max(200, "Title must be under 200 characters"),
  userName: z.string().optional(),
  userEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  additionalNotes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StoryRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryRequestModal({ isOpen, onClose }: StoryRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storyTitle: "",
      userName: "",
      userEmail: "",
      additionalNotes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Insert into database
      const requestData = {
        story_title: data.storyTitle,
        user_name: data.userName || null,
        user_email: data.userEmail || null,
        additional_notes: data.additionalNotes || null,
        user_id: user?.id || null,
      };

      const { error: dbError } = await supabase
        .from("story_requests")
        .insert([requestData]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save request");
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-story-request-email", {
        body: {
          storyTitle: data.storyTitle,
          userName: data.userName,
          userEmail: data.userEmail,
          additionalNotes: data.additionalNotes,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't throw here - the request is saved, email is secondary
      }

      toast({
        title: "Request Submitted! 📚",
        description: "Thank you for your story suggestion. We'll review it and might feature it soon!",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting story request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Request a Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Is there a particular short story you'd love to hear narrated on our website? 
            Share your suggestion with us! We review all requests and might feature your 
            recommended story in our collection.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="storyTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., The Gift of the Magi by O. Henry"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!user && (
                <>
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="How should we address you?"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="For updates on your request"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific details about the story, author, or why you'd like it featured..."
                        className="min-h-[80px] resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}