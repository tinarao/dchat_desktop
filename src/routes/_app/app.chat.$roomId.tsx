import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSocket } from '@/hooks/use-socket'
import { getEncryptedRoomKey } from '@/lib/api/roomkeys'
import { getRoomById } from '@/lib/api/rooms'
import { base64ToEncryptRoomKeyJSON, base64ToUint8, decryptRoomKeyForUser, encryptMessage } from '@/lib/encr'
import { getPrivateKey } from '@/lib/private-keys'
import { cn } from '@/lib/utils'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { MessageCirclePlus, UnplugIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/app/chat/$roomId')({
    component: RouteComponent,
    async loader(ctx) {
        const result = await getRoomById(parseInt(ctx.params.roomId))
        if (!result.ok) {
            throw redirect({ to: "/" })
        }

        return {
            room: result.data
        }
    },
})

async function getAndDecryptRoomKey(roomId: number) {
    const result = await getEncryptedRoomKey(roomId)
    if (!result.ok || !result.data) {
        return undefined
    }

    const privateKey = await getPrivateKey()
    if (!privateKey) {
        return undefined
    }

    const encrKey = base64ToEncryptRoomKeyJSON(result.data)
    const decrKey = await decryptRoomKeyForUser(encrKey, base64ToUint8(privateKey))
    return decrKey
}

function RouteComponent() {
    const [roomKey, setRoomKey] = useState<Uint8Array>(new Uint8Array())
    const [newMessageStr, setNewMessageStr] = useState('')

    const { room } = Route.useLoaderData()
    const socket = useSocket()
    const navigate = useNavigate()

    useEffect(() => {
        if (!room) throw navigate({ to: "/" })
        getAndDecryptRoomKey(room.id)
            .then(r => {
                if (!r) return
                setRoomKey(r)
            })
    }, [])

    useEffect(() => {
        if (!room) throw navigate({ to: "/" })

        socket.init(`chat_channel:${room.id}`, {
            onConnect(messages) {
                toast.success(JSON.stringify(messages))
            },
            onMessage(message) {
                toast.success(JSON.stringify(message))
            },
            onError(error) {
                toast.error(error.title)
            },
        })

        return () => socket.stop()
    }, [])

    async function handleSendMessage() {
        if (!newMessageStr) return
        toast(newMessageStr)

        const encrypted = encryptMessage(newMessageStr, roomKey)
        console.log(encrypted)
        // await socket 

        // setNewMessageStr('')
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
