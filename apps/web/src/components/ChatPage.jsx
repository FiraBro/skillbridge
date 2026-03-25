import React, { useState, useEffect, useRef } from "react";
import {
  useInbox,
  useChatHistory,
  useChatMutation,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";

const ChatPage = () => {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef(null);

  const { data: inbox, isLoading: loadingInbox } = useInbox();
  const { data: messages, isLoading: loadingChat } = useChatHistory(
    selectedPartner?.partner_id,
  );
  const { mutate: sendMessage, isPending: isSending } = useChatMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPartner) return;

    sendMessage({
      receiverId: selectedPartner.partner_id,
      message: messageText,
    });
    setMessageText("");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] border rounded-xl overflow-hidden bg-background">
      {/* LEFT SIDE: INBOX */}
      <div className="w-80 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b font-bold uppercase tracking-tighter italic">
          Messages
        </div>
        <ScrollArea className="flex-1">
          {loadingInbox ? (
            <div className="p-4 text-center text-xs">Loading chats...</div>
          ) : (
            inbox?.map((chat) => (
              <div
                key={chat.conversation_id}
                onClick={() => setSelectedPartner(chat)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedPartner?.conversation_id === chat.conversation_id
                    ? "bg-muted border-r-4 border-primary"
                    : ""
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {chat.partner_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {chat.partner_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.last_message}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* RIGHT SIDE: CHAT WINDOW */}
      <div className="flex-1 flex flex-col">
        {selectedPartner ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-background/50 backdrop-blur">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold">{selectedPartner.partner_name}</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === selectedPartner.partner_id ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        msg.sender_id === selectedPartner.partner_id
                          ? "bg-secondary text-secondary-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      {msg.message_text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button type="submit" disabled={isSending || !messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Send className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-sm font-medium italic">
              Select a conversation to start talking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
