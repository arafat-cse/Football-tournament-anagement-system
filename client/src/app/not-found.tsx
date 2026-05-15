import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 text-center shadow-xs">
        <div className="flex justify-center">
          <XCircle className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">404 - Not Found</h1>
        <p className="text-muted-foreground">Oops! The page you're looking for doesn't exist.</p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

