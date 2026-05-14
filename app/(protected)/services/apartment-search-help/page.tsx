import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApartmentSearchForm } from '@/components/services/apartment-search-form'
import { Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ApartmentSearchHelpPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/services"><ArrowLeft className="h-4 w-4 mr-1" /> All services</Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Apartment Search Help</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          A local guide will help you find and secure an apartment in your target city —
          navigating listings, applications, and lease agreements on your behalf.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your apartment needs</CardTitle>
          <CardDescription>All fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApartmentSearchForm />
        </CardContent>
      </Card>
    </div>
  )
}
