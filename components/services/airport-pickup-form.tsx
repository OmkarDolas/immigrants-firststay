'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { LANGUAGE_OPTIONS } from '@/lib/utils'

export function AirportPickupForm() {
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    airport_name:         '',
    arrival_date:         '',
    arrival_time:         '',
    flight_number:        '',
    num_passengers:       '1',
    num_bags:             '1',
    destination_address:  '',
    preferred_language:   '',
    special_instructions: '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { error: err } = await supabase.from('service_requests').insert({
      user_id:      user.id,
      service_type: 'airport_pickup',
      request_data: {
        ...form,
        num_passengers: Number(form.num_passengers),
        num_bags:       Number(form.num_bags),
      },
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-10 pb-8 text-center space-y-3">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">Request submitted!</h2>
          <p className="text-muted-foreground text-sm">
            Your airport pickup request is pending review. We&apos;ll notify you once a host is assigned.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Submit another request</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="airport_name">Airport name *</Label>
          <Input id="airport_name" placeholder="e.g. JFK International" value={form.airport_name} onChange={set('airport_name')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="flight_number">Flight number *</Label>
          <Input id="flight_number" placeholder="e.g. AA 1234" value={form.flight_number} onChange={set('flight_number')} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="arrival_date">Arrival date *</Label>
          <Input id="arrival_date" type="date" value={form.arrival_date} onChange={set('arrival_date')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="arrival_time">Arrival time *</Label>
          <Input id="arrival_time" type="time" value={form.arrival_time} onChange={set('arrival_time')} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="num_passengers">Number of passengers *</Label>
          <Input id="num_passengers" type="number" min="1" max="10" value={form.num_passengers} onChange={set('num_passengers')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="num_bags">Number of bags *</Label>
          <Input id="num_bags" type="number" min="0" max="20" value={form.num_bags} onChange={set('num_bags')} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="destination_address">Destination address *</Label>
        <Input id="destination_address" placeholder="Street, City, State, ZIP" value={form.destination_address} onChange={set('destination_address')} required />
      </div>

      <div className="space-y-1.5">
        <Label>Preferred language *</Label>
        <Select value={form.preferred_language} onValueChange={(v) => setForm((f) => ({ ...f, preferred_language: v }))} required>
          <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="special_instructions">Special instructions</Label>
        <Textarea id="special_instructions" placeholder="Wheelchair access, meet at arrivals, etc." value={form.special_instructions} onChange={set('special_instructions')} rows={3} />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading || !form.preferred_language}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Submitting…' : 'Submit request'}
      </Button>
    </form>
  )
}
