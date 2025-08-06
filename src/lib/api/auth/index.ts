import { Result } from "@/lib/result"
import { ErrorResponse, getApiRoute } from ".."
import { getToken, setToken } from "../../tokens"
import { loginSchema, LoginSchema } from "./schema"

export async function verifySession() {
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

        return { ok: true }
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
}

export async function signup(data: LoginSchema): Promise<Result> {
    const result = loginSchema.safeParse(data)
    if (!result.success) {
        return { ok: false, error: result.error.issues[0].message }
    }

    const route = getApiRoute("/auth/signup")
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
}
