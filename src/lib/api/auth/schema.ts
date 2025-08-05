import { z } from "zod"

export const loginSchema = z.object({
    username: z
        .string({ message: "имя пользователя не указано" })
        .min(4, "слишком короткое имя пользователя")
        .max(64, "слишком длинное имя пользователя"),
    password: z
        .string({ message: "пароль не указан" })
        .min(8, "слишком короткий пароль")
        .max(128, "слишком длинный пароль")
})

export type LoginSchema = z.infer<typeof loginSchema>
