"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BroadcastDialog() {
  const { notify } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await notify({
        audience: "customer",
        title: title.trim(),
        message: message.trim(),
        kind: "announcement",
      });
      setOpen(false);
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send broadcast:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3] text-xs font-semibold h-9 rounded-md transition-colors shadow-2xs"
        >
          <Megaphone className="h-4 w-4 text-[#A27C48]" />
          <span className="hidden sm:inline">Broadcast Announcement</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24]">
        <DialogHeader>
          <DialogTitle className="text-[#302A24]">Broadcast Message</DialogTitle>
          <DialogDescription className="text-[#74695E]">
            Send an announcement to all customers signed into the app. They will receive it in their notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none text-[#302A24]">
              Message Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Holiday Special!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] focus-visible:ring-[#A27C48]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium leading-none text-[#302A24]">
              Content
            </label>
            <textarea
              id="message"
              className="flex min-h-[100px] w-full rounded-md border border-[#E9E1D6] bg-[#FFFDFA] px-3 py-2 text-sm text-[#302A24] shadow-xs placeholder:text-[#74695E] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A27C48] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending} className="border-[#E9E1D6] text-[#74695E] hover:bg-[#F0EBE3] hover:text-[#302A24]">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending} className="gap-2 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA] font-medium">
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
