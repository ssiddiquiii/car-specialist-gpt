import { useEffect, useRef } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import TypingIndicator from "../TypingIndicator/TypingIndicator";

function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever messages change or typing starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "24px 16px 8px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    }}>
      {/* Max width centering wrapper */}
      <div style={{ maxWidth: "760px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>
    </div>
  );
}

export default ChatWindow;
