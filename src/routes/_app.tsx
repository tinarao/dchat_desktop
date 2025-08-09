import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { verifySession } from '@/lib/api/auth'
import { getMyRooms } from '@/lib/api/rooms'
import { userStore } from '@/store/user'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app')({
    component: RouteComponent,
    async beforeLoad(_ctx) {
        const result = await verifySession()
        if (!result.ok) {
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
    const { fetchUserData } = userStore()

    useEffect(() => {
        fetchUserData()
    }, [])

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
