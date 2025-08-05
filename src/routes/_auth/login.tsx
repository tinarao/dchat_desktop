import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/api/auth'
import { LoginSchema } from '@/lib/api/auth/schema'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/login')({
    component: RouteComponent,
})

const defaultValues: LoginSchema = {
    username: "",
    password: ""
}

function RouteComponent() {
    const [values, setValues] = useState<LoginSchema>(defaultValues)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleLogin() {
        setLoading(true)

        try {
            const result = await login(values)
            if (!result.ok) {
                toast.error(result.error)
                return
            }

            toast.success("вход выполнен успешно")
            await navigate({ to: "/app" })
        } catch (e) {
            toast.error("возникла непредвиденная ошибка")
            console.error(e)
            return
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col h-screen items-center justify-center'>
            <div className='space-y-3'>
                <div className='space-y-1'>
                    <Label>имя пользователя</Label>
                    <Input
                        disabled={loading}
                        value={values.username}
                        onChange={e => setValues(state => ({
                            ...state, username: e.target.value
                        }))}
                    />
                </div>
                <div className='space-y-1'>
                    <Label>пароль</Label>
                    <Input
                        disabled={loading}
                        type="password"
                        value={values.password}
                        onChange={e => setValues(state => ({
                            ...state, password: e.target.value
                        }))}
                    />
                </div>
                <Button
                    disabled={loading}
                    size='sm'
                    onClick={handleLogin}
                >
                    {loading ? <LoaderCircleIcon className='animate-spin' /> : <LogInIcon />}
                    войти
                </Button>
            </div>
            <div className='h-0.25 my-2 bg-border w-20'></div>
            <div className=''>
                <Button disabled={loading} variant="ghost" asChild>
                    <Link to="/register">
                        у меня нет аккаунта
                    </Link>
                </Button>
            </div>
        </div>
    )
}
