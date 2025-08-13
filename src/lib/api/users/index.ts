import { getToken } from "@/lib/tokens";
import { ErrorResponse, getApiRoute } from "..";
import { userResponseToCamelCase } from "../auth";
import { User, UserKebabCase } from "../auth/types";
import { Result } from "@/lib/result";


export async function findUsers(query: string): Promise<Result<User[]>> {
    const token = await getToken()
    const route = getApiRoute("/users/find/" + query)

    try {
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

        const json: { users: UserKebabCase[] } = await response.json()
        return { ok: true, data: json.users.map(userResponseToCamelCase) }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function getUserPublicKey(userId: number): Promise<Result<string>> {
    const token = await getToken()
    const route = getApiRoute("/users/public-key/" + userId)

    try {
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

        const json: { key: string } = await response.json()
        return { ok: true, data: json.key }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}
