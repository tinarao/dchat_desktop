import { getPrivateKey } from '@/lib/private-keys'
import { $currentUser } from '@/store/user'
import { createFileRoute } from '@tanstack/react-router'
import { useUnit } from 'effector-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_app/app/')({
    component: RouteComponent,
})

function RouteComponent() {
    const user = useUnit($currentUser)
    const [privateKey, setPrivateKey] = useState<string | undefined>(undefined)

    useEffect(() => {
        getPrivateKey().then(key => setPrivateKey(key))
    })

    return (
        <div>
            {user?.name}
            <p>
                b64: <span className='text-orange-500'>{privateKey}</span>
            </p>
        </div>
    )
}
