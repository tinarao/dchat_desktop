import { getMyRooms, deleteRoom as deleteRoomApi } from "@/lib/api/rooms"
import { Room } from "@/lib/api/rooms/types"
import { createEffect, createEvent, createStore } from "effector"
import { toast } from "sonner"

export const $rooms = createStore<Room[]>([])
export const roomCreated = createEvent<Room>()
export const roomDeleted = createEvent<Room>()

export const deleteRoom = createEffect(async (room: Room) => {
    const result = await deleteRoomApi(room.id)
    return result
})

export const fetchMyRooms = createEffect(async () => {
    const result = await getMyRooms()
    if (result.ok) {
        return result.data || []
    }

    return []
})

$rooms.on(roomCreated, (state, newRoom) => {
    return [...state, newRoom]
})

$rooms.on(fetchMyRooms.done, (_state, { result }) => result)

$rooms.on(deleteRoom.done, (state, { result }) => {
    if (!result.ok) {
        toast.error(result.error)
        return
    }

    if (result.ok && result.data) {
        toast.success("комната удалена")
        return state.filter(room => room.id !== result.data)
    }
})
