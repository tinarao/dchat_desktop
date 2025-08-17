import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EncryptedMessage, useSocket } from '@/hooks/use-socket'
import { getEncryptedRoomKey } from '@/lib/api/roomkeys'
import { getRoomById } from '@/lib/api/rooms'
import { base64ToEncryptRoomKeyJSON, base64ToUint8, decryptMessage, decryptRoomKeyForUser, encryptMessage, uint8ToBase64 } from '@/lib/encr'
import { getPrivateKey } from '@/lib/private-keys'
import { cn } from '@/lib/utils'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { MessageCirclePlus, UnplugIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
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

        console.log(privateKey)

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

function RouteComponent() {
    const [messages, setMessages] = useState<DecryptedMessage[]>([])
    const [newMessageStr, setNewMessageStr] = useState('')
    const { room, roomKey } = Route.useLoaderData()
    const socket = useSocket()
    const navigate = useNavigate()

    async function getDecryptedMessage(message: EncryptedMessage) {
        const bytesMsg = base64ToUint8(message.cipher_text)
        const decrypted = await decryptMessage(bytesMsg, roomKey)

        return {
            id: message.id,
            user: message.user.name,
            message: decrypted,
            createdAt: message.inserted_at
        }
    }

    useEffect(() => {
        if (!room) throw navigate({ to: "/" })

        socket.init(`chat_channel:${room.id}`, {
            async onConnect(messages) {
                if (!messages || !Array.isArray(messages)) {
                    toast.error("Не удалось загрузить историю сообщений")
                    return
                }

                const decrMessages = await Promise.all(messages.map(getDecryptedMessage))
                setMessages(decrMessages)
            },
            async onMessage(message) {
                const decr = await getDecryptedMessage(message)
                setMessages(p => [...p, decr])
            },
            onError(error) {
                toast.error(error.title)
            },
        })

        return () => socket.stop()
    }, [])

    async function handleSendMessage() {
        if (!newMessageStr) return

        const encrypted = await encryptMessage(newMessageStr, roomKey)
        const encrMessage = uint8ToBase64(encrypted)

        await socket.sendMessage(encrMessage)
    }

    return (
        <div className='flex flex-col justify-between h-full'>
            <div className='flex items-center justify-between'>
                <h1 className='text-4xl font-bold'>{room?.name}</h1>

                <div className='flex items-center gap-x-4'>
                    <Button title="Нажмите, чтобы прервать соединение" size="icon" variant="destructive" onClick={socket.stop}>
                        <UnplugIcon />
                    </Button>
                    <div className={cn("size-2 animate-ping rounded-full", socket.isConnected ? "bg-green-300" : "bg-red-300")}></div>
                </div>
            </div>
            <div>
                <ul>
                    {messages.map(msg => (
                        <li key={msg.id} className='space-x-1'>
                            <span className='text-pink-500 font-medium'>@{msg.user}</span>
                            <span>{">"}</span>
                            <span>{msg.message}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='space-y-2'>
                <Textarea value={newMessageStr} onChange={e => setNewMessageStr(e.currentTarget.value)} rows={5} className='resize-none' />
                <Button disabled={!socket.isConnected || !roomKey} onClick={handleSendMessage} size="sm" variant="secondary">
                    <MessageCirclePlus />
                    Отправить
                </Button>
            </div>
        </div>
    )
}
