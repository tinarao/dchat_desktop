import { verifySession } from "@/lib/api/auth"
import { User } from "@/lib/api/auth/types"
import { createEffect, createStore } from "effector"

export const $currentUser = createStore<User | null>(null)
export const fetchCurrentUser = createEffect(async () => {
    return await verifySession()
})

$currentUser.on(fetchCurrentUser.done, (_, { result }) => {
    if (!result.ok) return null
    else return result.data
})
