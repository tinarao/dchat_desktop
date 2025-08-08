export type Room = {
    id: number
    name: string
    is_private: boolean
    // creator?: User
    creator_id?: number
    inserted_at: string
    updated_at: string
}
