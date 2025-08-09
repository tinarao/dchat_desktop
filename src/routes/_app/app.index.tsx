import { userStore } from '@/store/user'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/app/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = userStore()
    return <div>{user?.name}</div>
}
