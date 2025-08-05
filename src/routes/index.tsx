import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react/jsx-runtime'

export const Route = createFileRoute('/')({
    component: Index,
    beforeLoad(_ctx) {
        throw redirect({
            to: "/auth",
        })
    },
})

function Index() {
    return <Fragment />
}
