import { z } from "zod"

export const createRoomMemberSchema = z.object({
    roomId: z.number().int().positive(),
    userId: z.number().int().positive(),
    key: z.string()
})

export type CreateRoomMemberSchema = z.infer<typeof createRoomMemberSchema>
