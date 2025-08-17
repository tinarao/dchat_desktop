import { User } from "@/lib/api/auth/types";
import { WS_CHAT_URL } from "@/lib/constants";
import { getToken } from "@/lib/tokens";
import { Channel, Socket } from "phoenix";
import { useState } from "react";

type Topic = `chat_channel:${string}`

export type EncryptedMessage = {
    id: number
    cipher_text: string,
    user: User
    inserted_at: string,
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

const NEW_MESSAGE_EVENT = "new_message" as const
export const AUTH_ERROR_STRING = "Ошибка авторизации" as const;

export function useSocket() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [channel, setChannel] = useState<Channel | null>(null)
    const [messages, setMessages] = useState<EncryptedMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)

    async function sendMessage(cipherText: string) {
        const token = await getToken()
        channel?.push(NEW_MESSAGE_EVENT, {
            cipherText,
            token
        })
            .receive("ok", console.log)
            .receive("error", ({ error }: { error: RecievedError }) => {
                console.error(error)
            })
    }

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

            const channel_ = socket_.channel(topicParam, {
                token: token
            })

            channel_.join()
                .receive("ok", ({ messages }) => {
                    console.log("raw messagse", messages)
                    setIsConnected(true)
                    args.onConnect?.(messages as EncryptedMessage[])
                })
                .receive("error", ({ error }: { error: RecievedError }) => {
                    console.error(error)
                    args.onError?.(error)
                })

            channel_.on("new_message", (message: EncryptedMessage) => {
                setMessages(prev => [...prev, message])
                args.onMessage?.(message)
            })

            setSocket(socket_)
            setChannel(channel_)
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
        init, stop, sendMessage,
        isConnected, messages, error
    }
}
