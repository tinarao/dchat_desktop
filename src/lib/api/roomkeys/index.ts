import { getToken } from "@/lib/tokens";
import { ErrorResponse, getApiRoute } from "..";
import { Result } from "@/lib/result";

type SaveKeyForUser = {
    userId: number
    roomId: number
    key: string
}

export async function saveRoomKeyForUser(data: SaveKeyForUser): Promise<Result> {
    const token = await getToken()

    try {
        const route = getApiRoute("/room-keys")
        const response = await fetch(route, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "ошибка авторизации" }
        }

        return { ok: true }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function getEncryptedRoomKey(roomId: number): Promise<Result<string>> {
    const token = await getToken()

    try {
        const route = getApiRoute("/room-keys/" + roomId)
        const response = await fetch(route, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "ошибка авторизации" }
        }

        const json: { key: string } = await response.json()
        return { ok: true, data: json.key }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }

}
