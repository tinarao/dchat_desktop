import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/app/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_app/app/"!</div>
}
