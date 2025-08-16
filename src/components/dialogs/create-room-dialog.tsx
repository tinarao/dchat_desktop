import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { PropsWithChildren, useEffect, useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { LoaderCircle, PlusCircle } from "lucide-react"
import { Button } from "../ui/button"
import { createRoom } from "@/lib/api/rooms"
import { toast } from "sonner"
import useDebounce from "@/hooks/use-debounce"
import { findUsers, getUserPublicKey } from "@/lib/api/users"
import { User } from "@/lib/api/auth/types"
import { createRoomMember } from "@/lib/api/roomkeys"
import { base64ToUint8, encryptRoomKeyForUser, encryptRoomKeyToBase64JSON, generateRoomKey } from "@/lib/encr"
import { userStore } from "@/store/user"
import { useNavigate } from "@tanstack/react-router"
import { saveRawRoomKey } from "@/lib/room-keys"
import { cn } from "@/lib/utils"

export function CreateRoomDialog({ children }: PropsWithChildren) {
    const [withName, setWithName] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const { user: currentUser } = userStore()
    const navigate = useNavigate()

    const debouncedWithName = useDebounce(withName, 500)

    useEffect(() => {
        if (!debouncedWithName) {
            setSearchResults([])
            return
        }

        findUsers(debouncedWithName)
            .then(r => {
                if (r.ok) {
                    setSearchResults(r.data || [])
                    return
                }

                toast.error(r.error)
            })

    }, [debouncedWithName])

    async function handleCreateRoom() {
        if (!selectedUser) {
            toast.error("Пользователь не выбран")
            return
        };

        if (!currentUser) {
            toast.error("Ошибка авторизации")
            return navigate({ to: "/" })
        }

        let currentUserPublicKey = currentUser.publicKey
        if (!currentUser.publicKey) {
            const myKeyResult = await getUserPublicKey(currentUser.id)
            if (!myKeyResult.ok) {
                toast.error("ошибка при создании комнаты - не найден Ваш публичный ключ.")
                // redirect to key generator page
                return
            }

            currentUserPublicKey = myKeyResult.data!
        }

        let selectedUserPublicKey = selectedUser.publicKey
        if (!selectedUserPublicKey) {
            const theirKeyResult = await getUserPublicKey(selectedUser.id)
            if (!theirKeyResult.ok || !theirKeyResult.data) {
                toast.error("не найден публичный ключ пользователя")
                return
            }
            selectedUserPublicKey = theirKeyResult.data
        }

        setLoading(true)

        try {
            const roomResult = await createRoom({
                withName: selectedUser.name,
                isPrivate
            })

            if (!roomResult.ok) {
                toast.error(roomResult.error || "Failed to create room")
                return
            }

            const rawRoomKey = generateRoomKey()
            await saveRawRoomKey(rawRoomKey, roomResult.data!.id)

            const myBytesPublicKey = base64ToUint8(currentUserPublicKey!)
            const theirBytesPublicKey = base64ToUint8(selectedUserPublicKey!)

            const [myRoomKey, theirRoomKey] = await Promise.all([
                encryptRoomKeyForUser(rawRoomKey, myBytesPublicKey, currentUser.id.toString()),
                encryptRoomKeyForUser(rawRoomKey, theirBytesPublicKey, selectedUser.id.toString())
            ]);

            try {
                await Promise.all([
                    createRoomMember({
                        userId: selectedUser.id,
                        roomId: roomResult.data!.id,
                        key: encryptRoomKeyToBase64JSON(theirRoomKey)
                    }),
                    createRoomMember({
                        userId: currentUser.id,
                        roomId: roomResult.data!.id,
                        key: encryptRoomKeyToBase64JSON(myRoomKey)
                    }),
                ])
            } catch (e) {
                // todo improve handling
                // maybe remove created rooms? or queue and try later?
                toast.error("при создании комнаты возникла непредвиденная ошибка")
                console.error(e)
            }

            toast.success("комната создана!")
        } catch (e) {
            console.error(e)
            toast.error("при создании комнаты возникла неизвестная ошибка")
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
                <div>
                    <Label>Результаты поиска</Label>
                    <div className="grid py-2 space-y-1">
                        {searchResults.map(u => (
                            <Button key={u.id} className={cn("justify-start", u.id === selectedUser?.id ? "bg-secondary" : "")} onClick={() => {
                                setSelectedUser(u)
                            }} variant="ghost">{u.name}</Button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                    <Label>Приватная</Label>
                </div>
                <Button onClick={handleCreateRoom} disabled={loading || !selectedUser} variant="outline" className="w-fit">
                    {loading ? <LoaderCircle className="animate-spin" /> : <PlusCircle />}
                    Создать
                </Button>
            </DialogContent>
        </Dialog>
    )
}
