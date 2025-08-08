import { z } from "zod"

export const userValidators = {
    userName: z.string({ message: "имя пользователя не указано" })
        .min(4, "Слишком короткое имя пользователя")
        .max(128, "Слишком длинное имя пользователя"),
}

export const loginSchema = z.object({
    name: userValidators.userName,
    password: z
        .string({ message: "пароль не указан" })
        .min(8, "слишком короткий пароль")
        .max(128, "слишком длинный пароль")
})

export type LoginSchema = z.infer<typeof loginSchema>
