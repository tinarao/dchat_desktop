import { getToken } from "@/lib/tokens";
import { ErrorResponse, getApiRoute } from "..";
import { Result } from "@/lib/result";
import { Room } from "./types";
import { CreateRoomSchema } from "./schema";

export async function getMyRooms(): Promise<Result<Room[]>> {
    const token = await getToken()

    try {
        const route = getApiRoute("/rooms/my")
        const response = await fetch(route, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "ошибка авторизации" }
        }

        const json: { rooms: Room[] } = await response.json()
        return { ok: true, data: json.rooms }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function getRoomsICreated(): Promise<Result<Room[]>> {
    const token = await getToken()

    try {
        const route = getApiRoute("/rooms/created_by_me")
        const response = await fetch(route, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "ошибка авторизации" }
        }

        const json: { rooms: Room[] } = await response.json()
        return { ok: true, data: json.rooms }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function createRoom(data: CreateRoomSchema): Promise<Result<{ room: Room }>> {
    const token = await getToken()

    try {
        const route = getApiRoute("/rooms")
        const response = await fetch(route, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
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

export async function deleteRoom(roomId: number): Promise<Result> {
    const token = await getToken();
    const route = getApiRoute("/rooms/" + roomId)

    try {
        const response = await fetch(route, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error }
        }

        return { ok: true }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

