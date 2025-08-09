import { Result } from "@/lib/result"
import { ErrorResponse, getApiRoute } from ".."
import { deleteToken, getToken, setToken } from "../../tokens"
import { loginSchema, LoginSchema } from "./schema"
import { User, UserKebabCase } from "./types"

export async function verifySession(): Promise<Result<User>> {
    const token = await getToken()

    try {
        const route = getApiRoute("/auth/verify")
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

        const json: { user: UserKebabCase } = await response.json()
        return { ok: true, data: userResponseToCamelCase(json.user) }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function login(data: LoginSchema): Promise<Result> {
    const result = loginSchema.safeParse(data)
    if (!result.success) {
        return { ok: false, error: result.error.issues[0].message }
    }

    const route = getApiRoute("/auth/login")
    try {
        const response = await fetch(route, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "content-type": "application/json"
            }
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "возникла непредвиденная ошибка" }
        }

        const json: { token: string } = await response.json()

        await setToken(json.token)
        return { ok: true }
    } catch (e) {

        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }
}

export async function signup(data: LoginSchema): Promise<Result> {
    const result = loginSchema.safeParse(data)
    if (!result.success) {
        return { ok: false, error: result.error.issues[0].message }
    }

    const route = getApiRoute("/auth/signup")
    try {
        const response = await fetch(route, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "content-type": "application/json"
            }
        })

        if (!response.ok) {
            const json: ErrorResponse = await response.json()
            return { ok: false, error: json.error || "возникла непредвиденная ошибка" }
        }

        return { ok: true }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    }

}

export async function logout(): Promise<Result> {
    const token = await getToken()
    const route = getApiRoute("/auth/logout")

    try {
        await fetch(route, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        })

        return { ok: true }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "Сервер недоступен" }
    } finally {
        await deleteToken();
    }
}

export function userResponseToCamelCase(rawUserData: UserKebabCase): User {
    return {
        id: rawUserData.id,
        name: rawUserData.name,
        insertedAt: rawUserData.inserted_at,
        updatedAt: rawUserData.updated_at
    }
}
