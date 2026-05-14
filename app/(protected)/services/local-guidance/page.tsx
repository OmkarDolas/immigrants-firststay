import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LocalGuidanceForm } from '@/components/services/local-guidance-form'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LocalGuidancePage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/services"><ArrowLeft className="h-4 w-4 mr-1" /> All services</Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Local Guidance</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Get personalized help from a local expert on anything from groceries and transportation
          to banking, healthcare, job searching, and legal support.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">What do you need help with?</CardTitle>
          <CardDescription>All fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <LocalGuidanceForm />
        </CardContent>
      </Card>
    </div>
  )
}
