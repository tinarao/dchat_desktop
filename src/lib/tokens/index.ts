import { load } from "@tauri-apps/plugin-store"
import { STORE_FILE_PATH } from "../constants"

const TOKEN_KEY = "token"

export async function setToken(token: string) {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    await store.set(TOKEN_KEY, token)
    await store.save()
}

export async function getToken() {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    return await store.get<string>(TOKEN_KEY)
}

export async function deleteToken() {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    return await store.delete(TOKEN_KEY)
}
