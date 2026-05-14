import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary/10 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/"><Home className="h-4 w-4 mr-2" /> Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search"><Search className="h-4 w-4 mr-2" /> Find a host</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
