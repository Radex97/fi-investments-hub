
import { useState } from 'react';

export function useSupportChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen(prev => !prev);
  
  return {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat
  };
}
