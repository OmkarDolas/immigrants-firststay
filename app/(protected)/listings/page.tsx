'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { type HostListing } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, MapPin, Users, Pencil, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function MyListingsPage() {
  const [listings, setListings] = useState<HostListing[]>([])
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('host_listings')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    setListings(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('host_listings').update({ is_active: !current }).eq('id', id)
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_active: !current } : l))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <PlusCircle className="h-4 w-4 mr-2" /> New listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first listing and start welcoming immigrants to your city.
            </p>
            <Button asChild>
              <Link href="/listings/new">
                <PlusCircle className="h-4 w-4 mr-2" /> Create listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className={listing.is_active ? '' : 'opacity-60'}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{listing.title}</h3>
                      {listing.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-label="Verified" />
                      )}
                      <Badge variant={listing.is_active ? 'success' : 'secondary'}>
                        {listing.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {listing.city}, {listing.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Up to {listing.max_guests}
                      </span>
                      <span>
                        {listing.is_free ? 'Free' : formatCurrency(listing.price_per_night ?? 0) + '/night'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(listing.id, listing.is_active)}
                      title={listing.is_active ? 'Hide listing' : 'Show listing'}
                    >
                      {listing.is_active
                        ? <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                        : <><Eye className="h-4 w-4 mr-1" /> Show</>
                      }
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/hosts/${listing.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
