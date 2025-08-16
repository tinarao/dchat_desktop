import { getToken } from "@/lib/tokens";
import { ErrorResponse, getApiRoute } from "..";
import { Result } from "@/lib/result";
import { createRoomMemberSchema, CreateRoomMemberSchema } from "./schema";

type SaveKeyForUser = {
    userId: number
    roomId: number
    key: string
}


export async function createRoomMember(body: CreateRoomMemberSchema): Promise<Result> {
    const token = await getToken()

    const { success } = await createRoomMemberSchema.safeParseAsync(body)
    if (!success) {
        return { ok: false, error: "некорректные данные - сгенерирован некорректный ключ" }
    }

    try {
        const route = getApiRoute("/room_members")
        const response = await fetch(route, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "не удалось добавить участника в комнату" }
        }

        return { ok: true }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
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
        const route = getApiRoute("/room_members/key/" + roomId)
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
