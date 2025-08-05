export type ErrorResponse = {
    error: string
}

export function getApiRoute(route: string) {
    return "http://localhost:4000/api" + route
}
