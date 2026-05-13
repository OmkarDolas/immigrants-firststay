import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import HostListingForm from '@/components/host-listing-form'

interface Props {
  params: { id: string }
}

export default async function EditListingPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('host_listings')
    .select('*')
    .eq('id', params.id)
    .eq('host_id', user.id)
    .single()

  if (!listing) notFound()

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit listing</h1>
        <p className="text-muted-foreground mt-1">{listing.title}</p>
      </div>
      <HostListingForm initialData={listing} listingId={listing.id} />
    </div>
  )
}
