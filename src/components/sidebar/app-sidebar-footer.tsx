import { ChevronUp, User2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { logout } from "@/lib/api/auth";
import { useNavigate } from "@tanstack/react-router";
import { userStore } from "@/store/user";
import { useState } from "react";

export function AppSidebarFooter() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { user } = userStore()

    async function handleLogout() {
        setLoading(true)
        await logout()
        await navigate({ to: "/auth" })
        setLoading(false)
    }

    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton>
                                <User2 /> {user?.name}
                                <ChevronUp className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            className="w-[--radix-popper-anchor-width]"
                        >
                            <DropdownMenuItem disabled={loading} variant="destructive" onClick={handleLogout}>
                                <span>Выйти</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )
}
