import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { verifySession } from '@/lib/api/auth'
import { getMyRooms } from '@/lib/api/rooms'
import { $rooms, fetchedRoomsList, roomCreated } from '@/store/chats'
import { userStore } from '@/store/user'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useUnit } from "effector-react"

export const Route = createFileRoute('/_app')({
    component: RouteComponent,
    async beforeLoad(_ctx) {
        const result = await verifySession()
        if (!result.ok) {
            throw redirect({
                to: "/auth",
            })
        }
    }
})

function RouteComponent() {
    const fetched = useUnit(fetchedRoomsList)
    const { fetchUserData } = userStore()

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        getMyRooms()
            .then(result => {
                if (result.ok && result.data) {
                    fetched(result.data)
                    return
                }

                throw redirect({
                    to: "/app"
                })
            })
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='flex h-screen w-full p-2'>
                <Outlet />
                <SidebarTrigger className='flex md:hidden' />
            </main>
        </SidebarProvider>
    )
}
