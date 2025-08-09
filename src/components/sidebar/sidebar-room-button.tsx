import { Room } from "@/lib/api/rooms/types"
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { MessageSquare, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { toast } from "sonner"
import { deleteRoom } from "@/lib/api/rooms"

interface Props {
    room: Room
}

export function SidebarRoomButton({ room }: Props) {
    async function handleDeleteRoom() {
        // change to alert dialog?
        const sure = confirm("Вы уверены? Все сообщения будут безвозвратно удалены")
        if (!sure) {
            return;
        }

        const result = await deleteRoom(room.id)
        if (result.ok) {
            toast.success("комната удалена")
            return
        }

        toast.error(result.error)
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
