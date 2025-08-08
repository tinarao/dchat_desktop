import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { verifySession } from '@/lib/api/auth'
import { getMyRooms, getRoomsICreated } from '@/lib/api/rooms'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
    component: RouteComponent,
    async beforeLoad(_ctx) {
        const result = await verifySession()
        if (!result.ok) {
            console.log(result.error)
            throw redirect({
                to: "/auth",
            })
        }
    },
    async loader(_ctx) {
        const roomsResult = await getMyRooms()
        if (!roomsResult.ok) {
            // todo handle
            console.error(roomsResult.error)
            throw redirect({
                to: "/app"
            })
        }

        return {
            rooms: roomsResult.data || []
        }
    },
})

function RouteComponent() {
    const { rooms } = Route.useLoaderData()

    return (
        <SidebarProvider>
            <AppSidebar createdRooms={rooms || []} />
            <main>
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}
