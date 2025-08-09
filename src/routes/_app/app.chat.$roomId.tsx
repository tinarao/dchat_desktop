import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSocket } from '@/hooks/use-socket'
import { getRoomById } from '@/lib/api/rooms'
import { cn } from '@/lib/utils'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { MessageCirclePlus, UnplugIcon } from 'lucide-react'
import { useEffect } from 'react'
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

function RouteComponent() {
    const { room } = Route.useLoaderData()
    const socket = useSocket()
    const navigate = useNavigate()

    useEffect(() => {
        if (!room) {
            throw navigate({ to: "/" })
        }

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
                <Textarea rows={5} className='resize-none' />
                <Button size="sm" variant="secondary">
                    <MessageCirclePlus />
                    Отправить
                </Button>
            </div>
        </div>
    )
}
