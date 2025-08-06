import { getToken } from '@/lib/tokens'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react/jsx-runtime'

export const Route = createFileRoute('/')({
    component: Index,
    async beforeLoad(_ctx) {
        const token = await getToken()
        if (!token) {
            throw redirect({
                to: "/auth",
            })
        }

        throw redirect({
            to: "/app"
        })
    },
})

function Index() {
    return <Fragment />
}
