import { verifySession } from "@/lib/api/auth"
import { User } from "@/lib/api/auth/types"
import { create } from "zustand"

interface UserStorage {
    user?: User
    fetchUserData: () => Promise<void>
}

export const userStore = create<UserStorage>()((set, _get) => ({
    user: undefined,
    async fetchUserData() {
        const result = await verifySession()
        if (result.ok) {
            set({ user: result.data })
            return
        }

        throw "Unauthorized"
    },
}))
