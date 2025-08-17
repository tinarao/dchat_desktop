import { PlusCircle } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar"
import { Room } from "@/lib/api/rooms/types"
import { CreateRoomDialog } from "../dialogs/create-room-dialog"
import { SidebarRoomButton } from "./sidebar-room-button"
import { AppSidebarFooter } from "./app-sidebar-footer"
import { useUnit } from "effector-react"
import { $rooms } from "@/store/chats"

export function AppSidebar() {
    const rooms = useUnit($rooms)

    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Ваши комнаты
                    </SidebarGroupLabel>

                    <CreateRoomDialog>
                        <SidebarGroupAction title="Создать новую комнату">
                            <PlusCircle />
                        </SidebarGroupAction>
                    </CreateRoomDialog>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {rooms.map(room => (
                                <SidebarRoomButton key={room.id} room={room} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <AppSidebarFooter />
        </Sidebar>
    )
}
