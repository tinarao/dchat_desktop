import { load } from "@tauri-apps/plugin-store"
import { STORE_FILE_PATH } from "../constants";

const PRIVATE_KEY = "private-key" as const;

export async function savePrivateKey(token: string) {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    await store.set(PRIVATE_KEY, token)
    await store.save()
}

export async function getPrivateKey() {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    return await store.get<string>(PRIVATE_KEY)
}

export async function deletePrivateKey() {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false
    })

    return await store.delete(PRIVATE_KEY)
}
