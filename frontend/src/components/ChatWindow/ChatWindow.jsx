import { useEffect, useRef } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import DualResponseCard from "../DualResponseCard/DualResponseCard";

function ChatWindow({ messages, isTyping, dualResponse }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom whenever messages change, typing starts, or dual response arrives
  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Scroll if near bottom or if it's a new typing state
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      if (isNearBottom || isTyping) {
        bottomRef.current?.scrollIntoView({ behavior: "auto" }); // 'auto' avoids animation jitter during streaming
      }
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isTyping, dualResponse]);

  return (
    <div 
      ref={containerRef}
      style={{
      flex: 1,
      overflowY: "auto",
      padding: "24px 16px 8px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    }}>
      {/* Max width centering wrapper */}
      <div style={{ maxWidth: "760px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {messages.map((msg, idx) => (
          <ChatMessage key={`msg-${idx}`} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {/* Dual response comparison cards */}
        {dualResponse && !isTyping && <DualResponseCard />}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>
    </div>
  );
}

export default ChatWindow;

