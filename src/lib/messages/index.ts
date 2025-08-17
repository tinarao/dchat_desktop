import { ErrorResponse, getApiRoute } from "../api";
import { Result } from "../result";
import { getToken } from "../tokens";

export async function clearChatHistory(roomId: number): Promise<Result> {
    const token = await getToken()

    try {
        const route = getApiRoute("/messages/" + roomId)
        const response = await fetch(route, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
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
