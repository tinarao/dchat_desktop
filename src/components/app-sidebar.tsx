import { MessageSquare, MoreHorizontal, PlusCircle } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Room } from "@/lib/api/rooms/types"
import { CreateRoomDialog } from "./dialogs/create-room-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { toast } from "sonner"

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
                            <PlusCircle /> <span className="sr-only">Add Project</span>
                        </SidebarGroupAction>
                    </CreateRoomDialog>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {createdRooms.map(room => (
                                <SidebarMenuItem key={room.id}>
                                    <SidebarMenuButton>
                                        <MessageSquare />
                                        {room.name}
                                    </SidebarMenuButton>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction>
                                                <MoreHorizontal />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuItem variant="destructive" onClick={() => toast.error("удалено")}>
                                                Удалить
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
