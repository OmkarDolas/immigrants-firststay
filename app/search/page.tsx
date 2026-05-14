import { createClient } from '@/lib/supabase/server'
import { type HostListing } from '@/types'
import ListingCard from '@/components/listing-card'
import { Search } from 'lucide-react'

interface SearchProps {
  searchParams: {
    city?:    string
    state?:   string
    support?: string
    free?:    string
  }
}

// Strip HTML/script tags so search param values are never echoed as markup
function sanitize(s: string | undefined): string {
  return (s ?? '').replace(/<[^>]*>/g, '').trim()
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const supabase = await createClient()

  const city    = sanitize(searchParams.city)
  const state   = sanitize(searchParams.state)
  const support = sanitize(searchParams.support)
  const free    = searchParams.free === '1'

  // Only query Supabase when the user has actually submitted the form
  const hasSearched = !!(city || state || support || free)

  let listings: HostListing[] = []

  if (hasSearched) {
    let query = supabase
      .from('host_listings')
      .select('*, profiles(id, full_name, avatar_url, bio, languages)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (city)    query = query.ilike('city', `%${city}%`)
    if (state)   query = query.eq('state', state.toUpperCase())
    if (free)    query = query.eq('is_free', true)
    if (support) query = query.contains('support_offered', [support])

    const { data } = await query.limit(50)
    listings = (data as HostListing[]) ?? []
  } else {
    // Show all active listings by default (browse mode)
    const { data } = await supabase
      .from('host_listings')
      .select('*, profiles(id, full_name, avatar_url, bio, languages)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)
    listings = (data as HostListing[]) ?? []
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Search bar */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Find a Host</h1>
        <p className="text-muted-foreground mb-6">Search for welcoming hosts in your destination city.</p>

        <form method="GET" action="/search" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              name="city"
              defaultValue={city}
              placeholder="City (e.g. Chicago, New York)"
              className="w-full pl-9 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <select
            name="state"
            defaultValue={state}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All states</option>
            {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            name="support"
            defaultValue={support}
            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All support types</option>
            <option value="temporary_stay">Temporary Stay</option>
            <option value="airport_pickup">Airport Pickup</option>
            <option value="apartment_search">Apartment Search Help</option>
            <option value="local_guidance">Local Guidance</option>
          </select>

          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              name="free"
              value="1"
              defaultChecked={free}
              className="rounded"
            />
            Free stays only
          </label>

          <button
            type="submit"
            className="h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-muted-foreground text-sm">
            {listings.length} host{listings.length !== 1 ? 's' : ''} found
            {city ? ` in ${city}` : ''}
            {state ? ` · ${state}` : ''}
          </p>
        </div>
      )}

      {hasSearched && listings.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No hosts found</h3>
          <p className="text-muted-foreground mb-4">Try broadening your search — remove a filter or search a nearby city.</p>
          <a href="/search" className="text-sm text-primary hover:underline">Clear all filters</a>
        </div>
      ) : (
        <>
          {!hasSearched && (
            <p className="text-muted-foreground text-sm mb-5">
              Showing all {listings.length} available host{listings.length !== 1 ? 's' : ''} — use the filters above to narrow your search.
            </p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as HostListing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
