import { Room } from "@/lib/api/rooms/types"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { MessageSquare, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { toast } from "sonner"

interface Props {
    room: Room
}

export function SidebarRoomButton({ room }: Props) {
    async function handleDeleteRoom() {
        toast.error("501 not implemented yet")
        console.log("lol")
    }

    return (
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
                    <DropdownMenuItem variant="destructive" onClick={handleDeleteRoom}>
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}
