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

interface Props {
    createdRooms: Room[]
}

export function AppSidebar({ createdRooms }: Props) {
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
                            {createdRooms.map(room => (
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
