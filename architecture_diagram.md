# Car Specialist GPT - Sequence Diagram

Aapki request par maine diagram ko **Sequence Diagram** mein tabdeel kar diya hai! Iska faida ye hai ke text arrows ke beech mein nahi aata, balke arrows ke bilkul upar perfectly set hota hai.

```mermaid
sequenceDiagram
    participant U as 👤 Aap (User)
    participant UI as 🖥️ React Chat UI
    participant API as ⚙️ FastAPI Backend
    participant N as 🔗 Ngrok Tunnel
    participant K as 🚀 Kaggle Server
    participant M as 🧠 Gemma Model

    U->>UI: 1. Sawal Poochta Hai
    UI->>API: 2. Sends Chat History
    API->>N: 3. Forward to URL (.env)
    N->>K: 4. Secure Tunnel Routing
    K->>M: 5. Generates Prompt

    Note over M: Model Sochta Hai...

    M-->>K: 6. Returns Generated Answer
    K-->>N: 7. Returns JSON
    N-->>API: 8. Receives JSON
    API-->>UI: 9. Forwards to UI
    UI-->>U: 10. Shows Answer on Screen
```

### Flow Summary:
1. **Local PC:** Aap React app par message type karte hain, jo local FastAPI ko milta hai.
2. **Internet Tunnel:** Local API wo message **Ngrok** (internet pul/tunnel) ko bhejti hai.
3. **Kaggle GPU:** Ngrok us message ko seedha Kaggle par chalne waley **Model** tak pohnchata hai.
4. **Answer:** Model jawab likh kar usi pul (tunnel) se wapis aapki screen par show kar deta hai!
