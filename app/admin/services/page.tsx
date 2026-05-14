'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type ServiceRequest, type ServiceType, type ServiceRequestStatus } from '@/types'
import { ServiceRequestStatusBadge } from '@/components/services/service-request-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronDown, ChevronUp, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Host = { id: string; full_name: string | null; email: string }
type RequestRow = ServiceRequest & { user_email?: string; user_name?: string }

const SERVICE_LABELS: Record<ServiceType, string> = {
  airport_pickup:   'Airport Pickup',
  apartment_search: 'Apartment Search',
  local_guidance:   'Local Guidance',
}

const STATUS_OPTIONS: ServiceRequestStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']

function requestSummary(req: ServiceRequest): string {
  const d = req.request_data as unknown as Record<string, unknown>
  if (req.service_type === 'airport_pickup')   return `${d.airport_name ?? ''} · ${d.arrival_date ?? ''} · ${d.num_passengers ?? ''} pax`
  if (req.service_type === 'apartment_search') return `${d.target_city ?? ''}, ${d.target_state ?? ''} · $${d.budget_min}–$${d.budget_max}/mo`
  if (req.service_type === 'local_guidance')   return `${d.city ?? ''}, ${d.state ?? ''} · ${String(d.guidance_category ?? '').replace(/_/g, ' ')}`
  return ''
}

function RequestDetail({ data }: { data: Record<string, unknown>; type: ServiceType }) {
  const rows: [string, unknown][] = Object.entries(data)
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span className="text-muted-foreground capitalize shrink-0">{k.replace(/_/g, ' ')}:</span>
          <span className="font-medium truncate">{String(v === true ? 'Yes' : v === false ? 'No' : v ?? '—')}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminServicesPage() {
  const supabase = createClient()
  const [requests,    setRequests]    = useState<RequestRow[]>([])
  const [hosts,       setHosts]       = useState<Host[]>([])
  const [loading,     setLoading]     = useState(true)
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [saving,      setSaving]      = useState<string | null>(null)

  // Filters
  const [filterType,   setFilterType]   = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Inline edit state per row
  const [editState, setEditState] = useState<Record<string, {
    status: ServiceRequestStatus
    assigned_host_id: string
    admin_notes: string
  }>>({})

  const load = async () => {
    const [reqRes, hostsRes] = await Promise.all([
      supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['host', 'both']),
    ])

    const rawRequests = (reqRes.data ?? []) as ServiceRequest[]

    // Fetch user profiles for display
    const userIds = Array.from(new Set(rawRequests.map((r) => r.user_id)))
    let userMap: Record<string, { full_name: string | null; email: string }> = {}
    if (userIds.length) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
      for (const u of users ?? []) userMap[u.id] = u
    }

    const enriched: RequestRow[] = rawRequests.map((r) => ({
      ...r,
      user_name:  userMap[r.user_id]?.full_name ?? undefined,
      user_email: userMap[r.user_id]?.email ?? undefined,
    }))

    setRequests(enriched)
    setHosts((hostsRes.data ?? []) as Host[])

    // Seed edit state
    const init: typeof editState = {}
    for (const r of enriched) {
      init[r.id] = {
        status:           r.status,
        assigned_host_id: r.assigned_host_id ?? '',
        admin_notes:      r.admin_notes ?? '',
      }
    }
    setEditState(init)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveRequest = async (id: string) => {
    const e = editState[id]
    if (!e) return
    setSaving(id)
    await supabase.from('service_requests').update({
      status:           e.status,
      assigned_host_id: e.assigned_host_id || null,
      admin_notes:      e.admin_notes      || null,
    }).eq('id', id)
    await load()
    setSaving(null)
  }

  const setField = (id: string, key: string, value: string) =>
    setEditState((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))

  const filtered = requests.filter((r) => {
    if (filterType   !== 'all' && r.service_type !== filterType)   return false
    if (filterStatus !== 'all' && r.status       !== filterStatus) return false
    return true
  })

  const counts: Record<ServiceRequestStatus, number> = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
  for (const r of requests) counts[r.status] = (counts[r.status] ?? 0) + 1

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Link>
        </Button>
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground text-sm">Manage all guest service requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(Object.entries(counts) as [ServiceRequestStatus, number][]).map(([status, count]) => (
          <Card key={status} className={status === 'pending' && count > 0 ? 'border-amber-300 bg-amber-50' : ''}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground capitalize mb-1">{status.replace('_', ' ')}</div>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">No service requests found.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Summary</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Submitted</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const isOpen = expanded === req.id
                    const edit   = editState[req.id]
                    return (
                      <>
                        <tr key={req.id} className="border-b hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm">{req.user_name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{req.user_email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs">{SERVICE_LABELS[req.service_type]}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                            {requestSummary(req)}
                          </td>
                          <td className="px-4 py-3">
                            <ServiceRequestStatusBadge status={req.status} />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(req.created_at)}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="ghost" className="h-7 text-xs"
                              onClick={() => setExpanded(isOpen ? null : req.id)}>
                              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              {isOpen ? 'Close' : 'Manage'}
                            </Button>
                          </td>
                        </tr>

                        {isOpen && edit && (
                          <tr key={`${req.id}-expand`} className="border-b bg-secondary/10">
                            <td colSpan={6} className="px-6 py-5">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Request details */}
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Request details</p>
                                  <RequestDetail
                                    data={req.request_data as unknown as Record<string, unknown>}
                                    type={req.service_type}
                                  />
                                </div>

                                {/* Admin controls */}
                                <div className="space-y-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin actions</p>

                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium">Status</label>
                                    <Select value={edit.status} onValueChange={(v) => setField(req.id, 'status', v)}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                          <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium">Assign host</label>
                                    <Select value={edit.assigned_host_id} onValueChange={(v) => setField(req.id, 'assigned_host_id', v)}>
                                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="" className="text-xs">Unassigned</SelectItem>
                                        {hosts.map((h) => (
                                          <SelectItem key={h.id} value={h.id} className="text-xs">
                                            {h.full_name || h.email}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium">Admin notes (visible to guest)</label>
                                    <Textarea
                                      className="text-xs min-h-[70px]"
                                      placeholder="Add a note for the guest…"
                                      value={edit.admin_notes}
                                      onChange={(e) => setField(req.id, 'admin_notes', e.target.value)}
                                    />
                                  </div>

                                  <Button size="sm" className="w-full h-8 text-xs" onClick={() => saveRequest(req.id)} disabled={saving === req.id}>
                                    {saving === req.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                    Save changes
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
