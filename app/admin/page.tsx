import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminActions from './admin-actions'
import { Users, Home, CalendarCheck, CheckCircle, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You need admin privileges to view this page.<br />
          Ask a database admin to set your profile role to &apos;admin&apos; in Supabase.
        </p>
      </div>
    )
  }

  // Fetch all data
  const [usersRes, listingsRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase
      .from('host_listings')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('*, host_listings(title, city, state), guest:profiles!bookings_guest_id_fkey(full_name, email)')
      .order('created_at', { ascending: false }),
  ])

  const users    = usersRes.data    ?? []
  const listings = listingsRes.data ?? []
  const bookings = bookingsRes.data ?? []

  const stats = {
    totalUsers:    users.length,
    totalHosts:    users.filter((u: any) => u.role === 'host' || u.role === 'both').length,
    totalListings: listings.length,
    totalBookings: bookings.length,
    pendingVerifications: listings.filter((l: any) => !l.is_verified && l.is_active).length,
  }

  const BOOKING_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    accepted:  'bg-green-100 text-green-800',
    declined:  'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage users, hosts, and bookings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Users,         label: 'Total Users',       value: stats.totalUsers        },
          { icon: Home,          label: 'Host Accounts',     value: stats.totalHosts        },
          { icon: Home,          label: 'Listings',          value: stats.totalListings     },
          { icon: CalendarCheck, label: 'Bookings',          value: stats.totalBookings     },
          { icon: CheckCircle,   label: 'Pending Verify',    value: stats.pendingVerifications, highlight: stats.pendingVerifications > 0 },
        ].map(({ icon: Icon, label, value, highlight }) => (
          <Card key={label} className={highlight ? 'border-amber-300 bg-amber-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs">{label}</span>
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Languages</th>
                      <th className="text-left px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{u.full_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.languages?.length ? u.languages.slice(0, 2).join(', ') : '—'}
                          {u.languages?.length > 2 && ` +${u.languages.length - 2}`}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader><CardTitle className="text-base">All Host Listings</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium">Title</th>
                      <th className="text-left px-4 py-3 font-medium">Host</th>
                      <th className="text-left px-4 py-3 font-medium">Location</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Verified</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l: any) => (
                      <tr key={l.id} className="border-b hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium max-w-[180px] truncate">{l.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.profiles?.full_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.city}, {l.state}</td>
                        <td className="px-4 py-3">
                          <Badge variant={l.is_active ? 'success' : 'secondary'}>
                            {l.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {l.is_verified
                            ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Yes</span>
                            : <span className="text-muted-foreground">No</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <AdminActions listingId={l.id} isVerified={l.is_verified} isActive={l.is_active} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader><CardTitle className="text-base">All Bookings</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium">Listing</th>
                      <th className="text-left px-4 py-3 font-medium">Guest</th>
                      <th className="text-left px-4 py-3 font-medium">Check-in</th>
                      <th className="text-left px-4 py-3 font-medium">Check-out</th>
                      <th className="text-left px-4 py-3 font-medium">Guests</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b: any) => (
                      <tr key={b.id} className="border-b hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium max-w-[160px] truncate">
                          {b.host_listings?.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{b.guest?.full_name || b.guest?.email || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.check_in)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.check_out)}</td>
                        <td className="px-4 py-3 text-center">{b.num_guests}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_COLORS[b.status] ?? ''}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
