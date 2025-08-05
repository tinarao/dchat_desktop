import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LogInIcon, UserPlus } from 'lucide-react'

export const Route = createFileRoute('/_auth/auth')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="flex flex-col h-screen items-center justify-center gap-y-2">
            <Button size="lg" asChild>
                <Link to="/register">
                    <UserPlus />
                    у меня нет аккаунта
                </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                    <LogInIcon />
                    у меня есть аккаунт
                </Link>
            </Button>
        </div>
    )
}
