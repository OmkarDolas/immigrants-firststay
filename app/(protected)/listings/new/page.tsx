import HostListingForm from '@/components/host-listing-form'

export default function NewListingPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create a new listing</h1>
        <p className="text-muted-foreground mt-1">
          Share your space and support immigrants arriving in your city.
        </p>
      </div>
      <HostListingForm />
    </div>
  )
}
