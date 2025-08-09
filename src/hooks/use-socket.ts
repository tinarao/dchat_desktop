import { WS_CHAT_URL } from "@/lib/constants";
import { getToken } from "@/lib/tokens";
import { Socket } from "phoenix";
import { useState } from "react";

type Topic = `chat_channel:${string}`

type EncryptedMessage = {
    cipherText: string
    iv: string
}

// Server-returned error messages are
// guaranteed to be in this shape
type RecievedError = {
    title: string
    description?: string
}

type StartConnectionArgs = {
    onError: (error: RecievedError) => void
    onConnect?: (messages: EncryptedMessage[]) => void
    onMessage?: (message: EncryptedMessage) => void
}

export const AUTH_ERROR_STRING = "Ошибка авторизации" as const;

export function useSocket() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [messages, setMessages] = useState<EncryptedMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)

    async function init(topicParam: Topic, args: StartConnectionArgs) {
        const token = await getToken()
        if (!token) {
            throw AUTH_ERROR_STRING
        }

        try {
            const socket_ = new Socket(WS_CHAT_URL, {
                params: {
                    token: token
                }
            })

            socket_.connect()

            const channel = socket_.channel(topicParam, {
                token: token
            })

            channel.join()
                .receive("ok", ({ messages }) => {
                    args.onConnect?.(messages as EncryptedMessage[])
                })
                .receive("error", ({ error }: { error: RecievedError }) => {
                    console.error(error)
                    args.onError?.(error)
                })

            channel.on("new_message", (message: EncryptedMessage) => {
                setMessages(prev => [...prev, message])
                args.onMessage?.(message)
            })

            setIsConnected(true)
            setSocket(socket_)
        } catch (e) {
            console.error(e)
            setError("не удалось установить соединение")
            setIsConnected(false)
            return
        }
    }

    function stop() {
        if (socket) {
            socket.disconnect
            setIsConnected(false)
            console.log("disconntect")
        }
    }

    return {
        init, stop,
        isConnected, messages, error
    }
}
