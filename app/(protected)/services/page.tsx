import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plane, Building2, MapPin, ClipboardList, ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    icon: Plane,
    title: 'Airport Pickup',
    description: 'Get a ride from the airport to your first destination. A local host will pick you up and help you settle in comfortably.',
    href: '/services/airport-pickup',
    iconColor: 'text-blue-600',
    iconBg:    'bg-blue-100',
  },
  {
    icon: Building2,
    title: 'Apartment Search Help',
    description: 'Let a local guide help you find the perfect apartment — navigating listings, landlords, and lease requirements in your target city.',
    href: '/services/apartment-search-help',
    iconColor: 'text-green-600',
    iconBg:    'bg-green-100',
  },
  {
    icon: MapPin,
    title: 'Local Guidance',
    description: 'Get personalized help with groceries, banking, healthcare, transportation, SIM cards, schools, and more.',
    href: '/services/local-guidance',
    iconColor: 'text-purple-600',
    iconBg:    'bg-purple-100',
  },
]

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Services</h1>
        <p className="text-muted-foreground">
          We offer a range of support services to help you get settled quickly and comfortably.
          Submit a request and a local helper will be assigned to you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {SERVICES.map(({ icon: Icon, title, description, href, iconColor, iconBg }) => (
          <Card key={href} className="hover:shadow-md transition-shadow flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 shrink-0`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <h2 className="font-semibold text-lg mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground flex-1 mb-4">{description}</p>
              <Button asChild className="w-full">
                <Link href={href}>
                  Request service <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">My Service Requests</p>
              <p className="text-xs text-muted-foreground">Track and manage all your submitted requests</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/services/my-requests">View all requests</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
