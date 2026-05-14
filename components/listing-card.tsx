import Link from 'next/link'
import { MapPin, Users, Clock, Star, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { type HostListing } from '@/types'
import { formatCurrency, getInitials, SUPPORT_OPTIONS } from '@/lib/utils'

interface ListingCardProps {
  listing: HostListing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const host = listing.profiles

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow group ${listing.is_booked ? 'opacity-75' : ''}`}>
      {/* Color header */}
      <div className="h-3 bg-gradient-to-r from-primary to-blue-400" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={host?.avatar_url ?? undefined} />
              <AvatarFallback>{getInitials(host?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-base leading-tight">{listing.title}</h3>
                {listing.is_verified && (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" aria-label="Verified host" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{host?.full_name ?? 'Anonymous Host'}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {listing.is_booked ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                Booked
              </Badge>
            ) : listing.is_free ? (
              <span className="text-green-600 font-bold text-lg">Free</span>
            ) : (
              <div>
                <span className="font-bold text-lg">{formatCurrency(listing.price_per_night ?? 0)}</span>
                <span className="text-xs text-muted-foreground block">/night</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}, {listing.state}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Up to {listing.max_guests}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Max {listing.max_stay_days} days</span>
          </div>
        </div>

        {listing.support_offered.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.support_offered.map((s) => {
              const opt = SUPPORT_OPTIONS.find((o) => o.value === s)
              return opt ? (
                <Badge key={s} variant="secondary" className="text-xs">
                  {opt.icon} {opt.label}
                </Badge>
              ) : null
            })}
          </div>
        )}

        {listing.languages_spoken.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Speaks: {listing.languages_spoken.join(', ')}
          </p>
        )}

        <Button asChild className="w-full" size="sm" variant={listing.is_booked ? 'outline' : 'default'}>
          <Link href={`/hosts/${listing.id}`}>
            {listing.is_booked ? 'View listing' : 'View & Book'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
