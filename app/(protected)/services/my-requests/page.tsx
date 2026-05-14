'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type ServiceRequest, type ServiceType } from '@/types'
import { ServiceRequestStatusBadge } from '@/components/services/service-request-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ClipboardList, Plane, Building2, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const SERVICE_META: Record<ServiceType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  airport_pickup:    { label: 'Airport Pickup',        icon: Plane,      color: 'text-blue-600',   bg: 'bg-blue-100'   },
  apartment_search:  { label: 'Apartment Search Help', icon: Building2,  color: 'text-green-600',  bg: 'bg-green-100'  },
  local_guidance:    { label: 'Local Guidance',        icon: MapPin,     color: 'text-purple-600', bg: 'bg-purple-100' },
}

function requestSummary(req: ServiceRequest): string {
  const d = req.request_data as unknown as Record<string, unknown>
  if (req.service_type === 'airport_pickup') {
    return `${d.airport_name ?? ''} · ${formatDate(String(d.arrival_date ?? ''))}`
  }
  if (req.service_type === 'apartment_search') {
    return `${d.target_city ?? ''}, ${d.target_state ?? ''} · $${d.budget_min}–$${d.budget_max}/mo`
  }
  if (req.service_type === 'local_guidance') {
    return `${d.city ?? ''}, ${d.state ?? ''} · ${String(d.guidance_category ?? '').replace(/_/g, ' ')}`
  }
  return ''
}

export default function MyRequestsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading,  setLoading]  = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRequests((data as ServiceRequest[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const cancelRequest = async (id: string) => {
    setCancelling(id)
    await supabase
      .from('service_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending')
    await load()
    setCancelling(null)
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/services"><ArrowLeft className="h-4 w-4 mr-1" /> All services</Link>
        </Button>
        <h1 className="text-2xl font-bold">My Service Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Track the status of all your submitted service requests.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No requests yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Submit a service request to get started.</p>
            <Button asChild>
              <Link href="/services">Browse services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const meta = SERVICE_META[req.service_type]
            const Icon = meta.icon
            return (
              <Card key={req.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{meta.label}</span>
                        <ServiceRequestStatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{requestSummary(req)}</p>
                      <p className="text-xs text-muted-foreground">Submitted {formatDate(req.created_at)}</p>
                      {req.admin_notes && (
                        <p className="mt-2 text-xs rounded bg-secondary px-2 py-1.5">
                          <span className="font-medium">Note from admin: </span>{req.admin_notes}
                        </p>
                      )}
                    </div>
                    {req.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-xs h-7 text-destructive border-destructive/20 hover:bg-destructive/5"
                        disabled={cancelling === req.id}
                        onClick={() => cancelRequest(req.id)}
                      >
                        {cancelling === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
