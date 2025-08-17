import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { verifySession } from '@/lib/api/auth'
import { fetchMyRooms } from '@/store/chats'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { fetchCurrentUser } from '@/store/user'
import { PendingPage } from '@/components/pending-page'

export const Route = createFileRoute('/_app')({
    component: RouteComponent,
    async beforeLoad(_ctx) {
        const result = await verifySession()
        if (!result.ok) {
            throw redirect({
                to: "/auth",
            })
        }

        await fetchCurrentUser()
        await fetchMyRooms()
    },
    pendingComponent: PendingPage
})

function RouteComponent() {
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
