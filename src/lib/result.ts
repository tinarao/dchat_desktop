type Failure = { ok: false, error: string }
type Ok<T = void> = { ok: true, data?: T }

export type Result<T = void> = Ok<T> | Failure
