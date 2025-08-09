import { ThemeProvider } from '@/components/providers/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <SidebarProvider>
                <Toaster />
                <Outlet />
                <TanStackRouterDevtools />
            </SidebarProvider>
        </ThemeProvider>
    ),
})
