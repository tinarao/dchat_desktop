import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { PropsWithChildren, useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { LoaderCircle, PlusCircle } from "lucide-react"
import { Button } from "../ui/button"
import { createRoom } from "@/lib/api/rooms"
import { toast } from "sonner"

export function CreateRoomDialog({ children }: PropsWithChildren) {
    const [withName, setWithName] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleCreateRoom() {
        setLoading(true)

        try {
            const result = await createRoom({
                withName,
                isPrivate
            })

            console.log(result)

            if (!result.ok) {
                toast.error(result.error)
                return
            }

            toast.success("комната создана!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Создать комнату
                    </DialogTitle>
                    <DialogDescription>
                        Введите имя собеседника, чтобы создать новую комнату
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1">
                    <Label>Имя</Label>
                    <Input disabled={loading} value={withName} onChange={e => setWithName(e.target.value)} maxLength={128} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                    <Label>Приватная</Label>
                </div>
                <Button onClick={handleCreateRoom} disabled={loading} variant="outline" className="w-fit">
                    {loading ? <LoaderCircle className="animate-spin" /> : <PlusCircle />}
                    Создать
                </Button>
            </DialogContent>
        </Dialog>
    )
}
