import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AirportPickupForm } from '@/components/services/airport-pickup-form'
import { Plane, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AirportPickupPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/services"><ArrowLeft className="h-4 w-4 mr-1" /> All services</Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Plane className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">Airport Pickup</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          A verified local host will pick you up from the airport and take you to your destination.
          Fill in your arrival details and we&apos;ll assign someone to you.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Arrival details</CardTitle>
          <CardDescription>All fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <AirportPickupForm />
        </CardContent>
      </Card>
    </div>
  )
}
