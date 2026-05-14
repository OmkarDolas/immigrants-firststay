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
    .select('*, profiles(id, full_name, avatar_url, bio, languages, country_of_origin, created_at, linkedin_verified, linkedin_name, instagram_url)')
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

          {/* Identity verification */}
          <Card className={l.is_verified || host?.linkedin_verified || host?.instagram_url ? '' : 'border-dashed'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Admin-verified badge */}
              {l.is_verified && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Verified by ImmigrantsFirstStay</span>
                </div>
              )}

              {/* LinkedIn badge */}
              {host?.linkedin_verified && (
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <svg className="h-4 w-4 text-[#0A66C2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm">
                    LinkedIn verified{host.linkedin_name ? ` — ${host.linkedin_name}` : ''}
                  </span>
                </div>
              )}

              {/* Instagram badge */}
              {host?.instagram_url && (
                <a
                  href={host.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-secondary/50 transition-colors"
                >
                  <svg className="h-4 w-4 text-pink-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                  <span className="text-sm">View Instagram profile</span>
                </a>
              )}

              {/* No verification at all */}
              {!l.is_verified && !host?.linkedin_verified && !host?.instagram_url && (
                <p className="text-sm text-muted-foreground">
                  This host has not yet completed identity verification.
                </p>
              )}
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
              isBooked={l.is_booked}
              paymentMethodsAccepted={l.payment_methods_accepted ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
