export const WS_CHAT_URL =
    process.env.NODE_ENV === "production" ? "" : "ws://localhost:4000/chat"
