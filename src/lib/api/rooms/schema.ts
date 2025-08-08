import { z } from "zod"
import { userValidators } from "../auth/schema"

export const roomValidators = {
    roomName: z.string({ message: "Название комнаты не указано" })
        .max(128, "Слишком длинное название комнаты")
        .optional(),
    isPrivate: z.boolean(),
}

export const createRoomSchema = z.object({
    withName: userValidators.userName,
    isPrivate: roomValidators.isPrivate
})

export type CreateRoomSchema = z.infer<typeof createRoomSchema>
