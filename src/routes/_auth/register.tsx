import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, sendPublicKey, signup } from '@/lib/api/auth'
import { LoginSchema } from '@/lib/api/auth/schema'
import { generateUserKeyPair, uint8ToBase64 } from '@/lib/encr'
import { savePrivateKey } from '@/lib/private-keys'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/register')({
    component: RouteComponent,
})

const defaultValues: LoginSchema = {
    name: "",
    password: ""
}

function RouteComponent() {
    const [values, setValues] = useState<LoginSchema>(defaultValues)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSignup() {
        setLoading(true)

        try {
            const result = await signup(values)
            if (!result.ok) {
                toast.error(result.error)
                return
            }


            const keyPair = generateUserKeyPair()
            const publicBase64 = uint8ToBase64(keyPair.publicKey)
            const privateBase64 = uint8ToBase64(keyPair.privateKey)

            await savePrivateKey(privateBase64)

            const loginResult = await login(values)
            console.log(loginResult)

            const keyResult = await sendPublicKey(publicBase64)
            console.log(keyResult)
            if (!keyResult.ok) {
                console.log(keyResult.error)
                toast.error("непредвиденная ошибка сервера")
            }

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
                <h1 className='font-medium'>регистрация</h1>
                <div className='space-y-1'>
                    <Label>имя пользователя</Label>
                    <Input
                        disabled={loading}
                        value={values.name}
                        onChange={e => setValues(state => ({
                            ...state, name: e.target.value
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
                    onClick={handleSignup}
                >
                    {loading ? <LoaderCircleIcon className='animate-spin' /> : <LogInIcon />}
                    войти
                </Button>
            </div>
            <div className='h-0.25 my-2 bg-border w-20'></div>
            <div className=''>
                <Button disabled={loading} variant="ghost" asChild>
                    <Link to="/login">
                        у меня есть аккаунт
                    </Link>
                </Button>
            </div>
        </div>
    )
}
