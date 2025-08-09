import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getRoomById } from '@/lib/api/rooms'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { MessageCirclePlus } from 'lucide-react'

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

    return (
        <div className='flex flex-col justify-between h-full'>
            <h1 className='text-4xl font-bold'>{room?.name}</h1>
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
