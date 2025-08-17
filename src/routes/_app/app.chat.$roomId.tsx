import { ChatSettingsDropdown } from '@/components/dropdowns/chat-settings-dropdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EncryptedMessage, useSocket } from '@/hooks/use-socket'
import { getEncryptedRoomKey } from '@/lib/api/roomkeys'
import { getRoomById } from '@/lib/api/rooms'
import { base64ToEncryptRoomKeyJSON, base64ToUint8, decryptMessage, decryptRoomKeyForUser, encryptMessage, uint8ToBase64 } from '@/lib/encr'
import { getPrivateKey } from '@/lib/private-keys'
import { cn } from '@/lib/utils'
import { userStore } from '@/store/user'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { CogIcon, MessageCirclePlus } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/app/chat/$roomId')({
    component: RouteComponent,
    async loader(ctx) {
        const roomId = parseInt(ctx.params.roomId)

        const result = await getRoomById(roomId)
        if (!result.ok) {
            throw redirect({ to: "/" })
        }

        const encrRoomKeyResult = await getEncryptedRoomKey(roomId)
        if (!encrRoomKeyResult.ok || !encrRoomKeyResult.data) {
            console.log("encrRoomKey result", result)
            throw redirect({ to: "/" })
        }

        const privateKey = await getPrivateKey()
        if (!privateKey) {
            throw redirect({ to: "/" })
        }

        const encrKey = base64ToEncryptRoomKeyJSON(encrRoomKeyResult.data)
        const decrKey = await decryptRoomKeyForUser(encrKey, base64ToUint8(privateKey))

        return {
            room: result.data,
            roomKey: decrKey
        }
    },
})

type DecryptedMessage = {
    id: number
    message: string
    user: string
    createdAt: string
}

const MessageLi = memo(({ message }: { message: DecryptedMessage }) => {
    const createdAt = Intl.DateTimeFormat("ru", {
        dateStyle: "short",
        timeStyle: "short"
    })
        .format(new Date(message.createdAt))

    // ufly af TODO

    return (
        <li className='space-x-1' >
            <span className='text-xs'>
                {createdAt}
            </span>
            <span>{"::"}</span>
            <span className='text-neutral-600 font-medium'>@{message.user}</span>
            <span>{">"}</span>
            <span>{message.message}</span>
        </li >
    )
})

function RouteComponent() {
    const [messages, setMessages] = useState<DecryptedMessage[]>([])
    const { room, roomKey } = Route.useLoaderData()
    const newMessageInputRef = useRef<HTMLTextAreaElement | null>(null)
    const { user } = userStore()
    const socket = useSocket()
    const navigate = useNavigate()

    async function getDecryptedMessage(message: EncryptedMessage) {
        try {
            const bytesMsg = base64ToUint8(message.cipher_text)
            const decrypted = await decryptMessage(bytesMsg, roomKey)

            return {
                id: message.id,
                user: message.user.name,
                message: decrypted,
                createdAt: message.inserted_at
            }
        } catch {
            // штука может выкинуть исключение
            // только если ключи невалидны.
            // ключи могут быть невалидны в определённом
            // наборе кейсов, которые я предусмотрел.
            // не вижу возможности для выброса других
            // исключений
            return undefined
        }
    }

    async function handleSendMessage() {
        if (!newMessageInputRef || !newMessageInputRef.current) return
        const msg = newMessageInputRef.current.value.trim()

        const encrypted = await encryptMessage(msg, roomKey)
        const encrMessage = uint8ToBase64(encrypted)

        await socket.sendMessage(encrMessage)
    }

    useEffect(() => {
        if (!room) throw navigate({ to: "/" })
        if (socket.isConnected) return

        socket.init(`chat_channel:${room.id}`, {
            async onConnect(messages) {
                if (!messages || !Array.isArray(messages)) {
                    toast.error("Не удалось загрузить историю сообщений")
                    return
                }

                setMessages([])
                const decrMessages = await Promise.all(messages.map(getDecryptedMessage))
                setMessages(decrMessages.filter((msg): msg is DecryptedMessage => msg !== undefined))
            },
            async onMessage(message) {
                if (message.user.id == user?.id) return;
                const decr = await getDecryptedMessage(message)
                if (!decr) {
                    toast.error("Не удалось расшифровать сообщение")
                    return
                }
                setMessages(prev => {
                    return prev.find(m => m.id === decr.id)
                        ? prev
                        : [...prev, decr]
                })
            },
            onError(error) {
                toast.error(error.title)
            },
        })

        return () => {
            socket.stop()
            setMessages([])
        }
    }, [room?.id])

    return (
        <div className='flex flex-col justify-between flex-1 space-y-2'>
            <div className='flex items-center justify-between bg-secondary p-2 rounded-md'>
                <h1 className='text-2xl font-medium'>{room?.name}</h1>
                <div className='flex items-center gap-x-2 pr-2'>
                    <div title="Подключение установлено" className='flex items-center justify-center size-8'>
                        <div className={cn("size-2 animate-ping rounded-full", socket.isConnected ? "bg-green-300" : "bg-red-300")}></div>
                    </div>
                    {room && (
                        <ChatSettingsDropdown room={room}>
                            <Button size="icon">
                                <CogIcon />
                            </Button>
                        </ChatSettingsDropdown>
                    )}
                </div>
            </div>
            <div className="overflow-y-scroll">
                <ul>
                    {messages.map(msg => (
                        <MessageLi key={msg.id} message={msg} />
                    ))}
                </ul>
            </div>
            <div className='space-y-2'>
                <Textarea ref={newMessageInputRef} rows={5} className='resize-none' />
                <Button
                    disabled={!socket.isConnected || !roomKey}
                    onClick={handleSendMessage}
                    size="sm"
                    variant="secondary"
                    className='border'
                >
                    <MessageCirclePlus />
                    Отправить
                </Button>
            </div>
        </div>
    )
}
