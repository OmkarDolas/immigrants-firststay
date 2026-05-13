'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { type Profile, type Booking, type HostListing } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard, ListPlus, Search, CalendarCheck,
  Users, Home, Clock, PlusCircle, ArrowRight,
} from 'lucide-react'
import { formatDate, getInitials, BOOKING_STATUS_CONFIG } from '@/lib/utils'

export default function DashboardPage() {
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [bookings, setBookings]     = useState<Booking[]>([])
  const [listings, setListings]     = useState<HostListing[]>([])
  const [loading, setLoading]       = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, bookingsRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('bookings')
          .select('*, host_listings(title, city, state, profiles(full_name))')
          .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('host_listings')
          .select('*')
          .eq('host_id', user.id)
          .eq('is_active', true)
          .limit(3),
      ])

      setProfile(profileRes.data)
      setBookings((bookingsRes.data as Booking[]) ?? [])
      setListings(listingsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard…</div>
      </div>
    )
  }

  const isHost  = profile?.role === 'host' || profile?.role === 'both'
  const isGuest = profile?.role === 'guest' || profile?.role === 'both'

  const pendingRequests  = bookings.filter((b) => b.status === 'pending' && b.host_id === profile?.id)
  const upcomingBookings = bookings.filter((b) => b.status === 'accepted')

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/30">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground text-sm capitalize">
              Role: <span className="font-medium text-foreground">{profile?.role}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile">Edit profile</Link>
        </Button>
      </div>

      {/* Profile incomplete notice */}
      {!profile?.full_name && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">Complete your profile to start booking or hosting.</p>
          <Button size="sm" asChild>
            <Link href="/profile">Complete profile</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CalendarCheck, label: 'Total Bookings',    value: bookings.length                                        },
          { icon: Clock,         label: 'Pending Requests',  value: pendingRequests.length,  highlight: pendingRequests.length > 0 },
          { icon: Home,          label: 'Upcoming Stays',    value: upcomingBookings.length                                },
          { icon: Users,         label: 'Active Listings',   value: listings.length                                        },
        ].map(({ icon: Icon, label, value, highlight }) => (
          <Card key={label} className={highlight ? 'border-amber-300 bg-amber-50' : ''}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <Link href="/search" className="group">
          <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Find a Host</div>
                <div className="text-xs text-muted-foreground">Browse available listings</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/bookings" className="group">
          <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">My Bookings</div>
                <div className="text-xs text-muted-foreground">View all booking requests</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        {isHost && (
          <Link href="/listings/new" className="group">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <PlusCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">New Listing</div>
                  <div className="text-xs text-muted-foreground">Create a host listing</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        )}

        {!isHost && (
          <Link href="/profile" className="group">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/40 border-dashed">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <ListPlus className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Become a Host</div>
                  <div className="text-xs text-muted-foreground">Switch role to host</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {bookings.map((booking) => {
                const cfg    = BOOKING_STATUS_CONFIG[booking.status]
                const listing = (booking as any).host_listings
                return (
                  <div key={booking.id} className="flex items-center justify-between px-6 py-4 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{listing?.title ?? 'Listing'}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing?.city}, {listing?.state} · {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                      </p>
                    </div>
                    <Badge className={`${cfg.color} text-xs shrink-0`}>{cfg.label}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Host: active listings */}
      {isHost && listings.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">My Active Listings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/listings">Manage all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between px-6 py-4 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.city}, {listing.state} · Up to {listing.max_guests} guests
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
