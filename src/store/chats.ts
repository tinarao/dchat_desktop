import { Room } from "@/lib/api/rooms/types"
import { createEvent, createStore } from "effector"

export const $rooms = createStore<Room[]>([])
export const roomCreated = createEvent<Room>()
export const fetchedRoomsList = createEvent<Room[]>()
export const roomDeleted = createEvent<Room>()

$rooms.on(roomCreated, (state, newRoom) => {
    return [...state, newRoom]
})

$rooms.on(fetchedRoomsList, (_state, rooms) => rooms)

$rooms.on(roomDeleted, (state, deletedRoom) =>
    state.filter(room => room.id !== deletedRoom.id)
)
