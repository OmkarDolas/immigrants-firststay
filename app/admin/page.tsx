import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminActions from './admin-actions'
import { Users, Home, CalendarCheck, CheckCircle, Shield, Clock, ExternalLink, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const VERIFY_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const BOOKING_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100 text-green-800',
  declined:  'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const [usersRes, listingsRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('host_listings').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*, host_listings(title, city, state), guest:profiles!bookings_guest_id_fkey(full_name, email)').order('created_at', { ascending: false }),
  ])

  const users    = usersRes.data    ?? []
  const listings = listingsRes.data ?? []
  const bookings = bookingsRes.data ?? []

  const pendingUsers = users.filter((u: any) => u.verification_status === 'pending' && u.role !== 'admin')

  // Generate signed URLs for pending users who have uploaded an ID
  const signedUrls: Record<string, string> = {}
  for (const u of pendingUsers) {
    if (u.gov_id_path) {
      const { data } = await supabase.storage
        .from('government-ids')
        .createSignedUrl(u.gov_id_path, 3600)
      if (data?.signedUrl) signedUrls[u.id] = data.signedUrl
    }
  }

  const stats = {
    totalUsers:       users.length,
    totalHosts:       users.filter((u: any) => u.role === 'host' || u.role === 'both').length,
    totalListings:    listings.length,
    totalBookings:    bookings.length,
    pendingApprovals: pendingUsers.length,
  }

  const ID_TYPE_LABELS: Record<string, string> = {
    passport:         'Passport',
    drivers_license:  "Driver's License",
    national_id:      'National ID',
    residence_permit: 'Residence Permit',
    other:            'Other',
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage users, approvals, hosts, and bookings</p>
          </div>
        </div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Briefcase className="h-4 w-4" /> Service Requests
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Users,        label: 'Total Users',      value: stats.totalUsers       },
          { icon: Home,         label: 'Host Accounts',    value: stats.totalHosts       },
          { icon: Home,         label: 'Listings',         value: stats.totalListings    },
          { icon: CalendarCheck,label: 'Bookings',         value: stats.totalBookings    },
          { icon: Clock,        label: 'Pending Approval', value: stats.pendingApprovals, highlight: stats.pendingApprovals > 0 },
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

      <Tabs defaultValue={stats.pendingApprovals > 0 ? 'approvals' : 'users'}>
        <TabsList className="mb-6">
          <TabsTrigger value="approvals" className="relative">
            Pending Approvals
            {stats.pendingApprovals > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 text-white text-xs w-5 h-5 inline-flex items-center justify-center">
                {stats.pendingApprovals}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Identity Verification Queue
                {pendingUsers.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    — {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingUsers.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">No pending approvals.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-secondary/30">
                        <th className="text-left px-4 py-3 font-medium">User</th>
                        <th className="text-left px-4 py-3 font-medium">ID Type</th>
                        <th className="text-left px-4 py-3 font-medium">Uploaded</th>
                        <th className="text-left px-4 py-3 font-medium">Document</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((u: any) => (
                        <tr key={u.id} className="border-b hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{u.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {u.gov_id_type ? ID_TYPE_LABELS[u.gov_id_type] ?? u.gov_id_type : <span className="italic text-xs">No ID uploaded</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {signedUrls[u.id] ? (
                              <a
                                href={signedUrls[u.id]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                              >
                                <ExternalLink className="h-3 w-3" /> View ID
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not uploaded</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <AdminActions
                              type="user"
                              userId={u.id}
                              verificationStatus={u.verification_status}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      <th className="text-left px-4 py-3 font-medium">Verification</th>
                      <th className="text-left px-4 py-3 font-medium">Joined</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
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
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${VERIFY_COLORS[u.verification_status ?? 'pending'] ?? ''}`}>
                            {u.verification_status ?? 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          {u.role !== 'admin' && (
                            <AdminActions
                              type="user"
                              userId={u.id}
                              verificationStatus={u.verification_status ?? 'pending'}
                            />
                          )}
                        </td>
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
                          <AdminActions
                            type="listing"
                            listingId={l.id}
                            isVerified={l.is_verified}
                            isActive={l.is_active}
                          />
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
                        <td className="px-4 py-3 font-medium max-w-[160px] truncate">{b.host_listings?.title || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{b.guest?.full_name || b.guest?.email || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.check_in)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.check_out)}</td>
                        <td className="px-4 py-3 text-center">{b.num_guests}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_COLORS[b.status] ?? ''}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(b.created_at)}</td>
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
