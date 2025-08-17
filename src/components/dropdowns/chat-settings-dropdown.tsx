import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Room } from "@/lib/api/rooms/types"
import { clearChatHistory } from "@/lib/messages"
import { userStore } from "@/store/user"
import { TrashIcon } from "lucide-react"
import { toast } from "sonner"

type CSDProps = React.PropsWithChildren<{ room: Room }>

export function ChatSettingsDropdown({ children, room }: CSDProps) {
    const { user } = userStore()

    async function handleClearHistory() {
        const result = await clearChatHistory(room.id)
        if (!result.ok) {
            toast.error(result.error)
            return
        }

        toast.success("история успешно очищена")
    }

    return (
        <AlertDialog>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Вы уверены?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие приведёт к полному удалению сообщений для всех пользователей.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory} className="bg-red-500 hover:bg-red-400 text-white transition-colors">
                        Да, удалить
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {room.creatorId == user?.id && (
                        <AlertDialogTrigger>
                            <DropdownMenuItem>
                                <TrashIcon />
                                Очистить историю сообщений
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

        </AlertDialog>
    )
}
