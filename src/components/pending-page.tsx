import { LoaderCircle } from "lucide-react";

export function PendingPage() {
    return (
        <div className="h-screen flex items-center justify-center">
            <LoaderCircle className="animate-spin size-6" />
        </div>
    )
}
