'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Booking, type Profile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, CalendarRange, Users, MessageSquare, MapPin } from 'lucide-react'
import { formatDate, getInitials, BOOKING_STATUS_CONFIG, calculateNights, formatCurrency } from '@/lib/utils'

export default function BookingsPage() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [asGuest, setAsGuest]   = useState<Booking[]>([])
  const [asHost,  setAsHost]    = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, guestRes, hostRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('bookings')
        .select('*, host_listings(title, city, state, is_free, price_per_night, profiles(full_name, avatar_url))')
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('bookings')
        .select('*, host_listings(title, city, state), guest:profiles!bookings_guest_id_fkey(full_name, email, avatar_url, languages, country_of_origin)')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    setProfile(profileRes.data)
    setAsGuest((guestRes.data as Booking[]) ?? [])
    setAsHost((hostRes.data as Booking[])  ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    load()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const BookingCard = ({ booking, viewAs }: { booking: Booking; viewAs: 'guest' | 'host' }) => {
    const cfg     = BOOKING_STATUS_CONFIG[booking.status]
    const listing = (booking as any).host_listings
    const guest   = (booking as any).guest as Profile | undefined
    const nights  = calculateNights(booking.check_in, booking.check_out)
    const price   = booking.total_price ?? (listing?.is_free ? 0 : (listing?.price_per_night ?? 0) * nights)

    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold truncate">{listing?.title ?? 'Listing'}</h3>
                <Badge className={`${cfg.color} shrink-0`}>{cfg.label}</Badge>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing?.city}, {listing?.state}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-3.5 w-3.5" />
                  {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                  <span className="text-xs">({nights} night{nights !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  {booking.num_guests} guest{booking.num_guests !== 1 ? 's' : ''}
                  {price > 0 && <span>· {formatCurrency(price)} total</span>}
                  {price === 0 && <span>· Free stay</span>}
                </div>
              </div>

              {/* Show other party info */}
              {viewAs === 'guest' && listing?.profiles && (
                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={listing.profiles.avatar_url} />
                    <AvatarFallback className="text-xs">{getInitials(listing.profiles.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">Host: {listing.profiles.full_name}</span>
                </div>
              )}

              {viewAs === 'host' && guest && (
                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={guest.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(guest.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-xs text-muted-foreground">Guest: {guest.full_name}</span>
                    {guest.country_of_origin && (
                      <span className="text-xs text-muted-foreground ml-1">from {guest.country_of_origin}</span>
                    )}
                  </div>
                </div>
              )}

              {booking.message && (
                <div className="mt-3 rounded-lg bg-secondary/50 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <MessageSquare className="h-3 w-3" /> Message
                  </div>
                  <p className="text-sm">{booking.message}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0 min-w-[120px]">
              {viewAs === 'host' && booking.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => updateStatus(booking.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => updateStatus(booking.id, 'declined')}>
                    Decline
                  </Button>
                </>
              )}
              {viewAs === 'guest' && booking.status === 'pending' && (
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30"
                  onClick={() => updateStatus(booking.id, 'cancelled')}>
                  Cancel
                </Button>
              )}
              {booking.status === 'accepted' && (
                <Button size="sm" variant="outline"
                  onClick={() => updateStatus(booking.id, 'completed')}>
                  Mark complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Bookings</h1>

      <Tabs defaultValue="guest">
        <TabsList className="mb-6">
          <TabsTrigger value="guest">
            As Guest {asGuest.length > 0 && `(${asGuest.length})`}
          </TabsTrigger>
          <TabsTrigger value="host">
            As Host {asHost.length > 0 && `(${asHost.length})`}
            {asHost.filter((b) => b.status === 'pending').length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 text-white text-xs w-4 h-4 inline-flex items-center justify-center">
                {asHost.filter((b) => b.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guest">
          {asGuest.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="text-4xl mb-3">🧳</div>
                <h3 className="font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-sm">Search for a host and send your first request.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {asGuest.map((b) => <BookingCard key={b.id} booking={b} viewAs="guest" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="host">
          {asHost.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">No hosting requests yet</h3>
                <p className="text-muted-foreground text-sm">Requests from guests will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {asHost.map((b) => <BookingCard key={b.id} booking={b} viewAs="host" />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
