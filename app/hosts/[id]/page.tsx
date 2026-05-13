import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { type HostListing } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import BookingForm from '@/components/booking-form'
import {
  MapPin, Users, Clock, Globe, CheckCircle,
  Shield, Calendar,
} from 'lucide-react'
import { formatCurrency, getInitials, SUPPORT_OPTIONS, formatDate } from '@/lib/utils'

interface Props {
  params: { id: string }
}

export default async function HostProfilePage({ params }: Props) {
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('host_listings')
    .select('*, profiles(id, full_name, avatar_url, bio, languages, country_of_origin, created_at)')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!listing) notFound()

  const host    = (listing as any).profiles
  const l       = listing as HostListing
  const support = l.support_offered.map((s) => SUPPORT_OPTIONS.find((o) => o.value === s)).filter(Boolean)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: listing info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20 shrink-0">
              <AvatarImage src={host?.avatar_url} />
              <AvatarFallback className="text-2xl">{getInitials(host?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">{l.title}</h1>
                {l.is_verified && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" /> Verified
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">Hosted by {host?.full_name ?? 'Anonymous'}</p>
              {host?.country_of_origin && (
                <p className="text-sm text-muted-foreground">Originally from {host.country_of_origin}</p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                <Users className="h-5 w-5 text-primary" />
                {l.max_guests}
              </div>
              <div className="text-xs text-muted-foreground">Max guests</div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                <Clock className="h-5 w-5 text-primary" />
                {l.max_stay_days}
              </div>
              <div className="text-xs text-muted-foreground">Max days</div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {l.is_free ? 'Free' : formatCurrency(l.price_per_night ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">{l.is_free ? 'No charge' : 'Per night'}</div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">{l.city}, {l.state}</div>
            </div>
          </div>

          {/* About */}
          {(listing.description || host?.bio) && (
            <Card>
              <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {listing.description && <p className="text-sm leading-relaxed">{listing.description}</p>}
                {host?.bio && (
                  <>
                    {listing.description && <Separator />}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">About the host</p>
                      <p className="text-sm leading-relaxed">{host.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Support offered */}
          {support.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Support Offered</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {support.map((s) => s && (
                    <div key={s.value} className="flex items-center gap-3 rounded-lg border p-3">
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{l.neighborhood ? `${l.neighborhood}, ` : ''}{l.city}, {l.state}</span>
              </div>
              {l.available_from && l.available_to && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Available {formatDate(l.available_from)} – {formatDate(l.available_to)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages & Rules */}
          <div className="grid sm:grid-cols-2 gap-4">
            {l.languages_spoken.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Languages</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {l.languages_spoken.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />{lang}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {l.house_rules && (
              <Card>
                <CardHeader><CardTitle className="text-base">House Rules</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line text-muted-foreground">{l.house_rules}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Verification placeholder */}
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-3 py-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {l.is_verified ? '✅ Identity verified' : 'Verification pending'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {l.is_verified
                    ? 'This host has been verified by ImmigrantsFirstStay.'
                    : 'Hosts can request verification through our admin team.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: booking form */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BookingForm
              listingId={l.id}
              hostId={l.host_id}
              maxGuests={l.max_guests}
              maxStayDays={l.max_stay_days}
              isFree={l.is_free}
              pricePerNight={l.price_per_night}
              availableFrom={l.available_from}
              availableTo={l.available_to}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
