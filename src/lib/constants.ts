export const WS_CHAT_URL =
    process.env.NODE_ENV === "production" ? "" : "ws://localhost:4000/chat"


export const STORE_FILE_PATH = "store.json" as const;
