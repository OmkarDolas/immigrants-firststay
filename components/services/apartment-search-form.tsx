'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { US_STATES } from '@/lib/utils'

const LEASE_DURATIONS = [
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '3_months',       label: '3 months'       },
  { value: '6_months',       label: '6 months'       },
  { value: '1_year',         label: '1 year'         },
  { value: 'flexible',       label: 'Flexible'       },
]

export function ApartmentSearchForm() {
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    target_city:              '',
    target_state:             '',
    move_in_date:             '',
    budget_min:               '',
    budget_max:               '',
    num_bedrooms:             '1',
    lease_duration:           '',
    has_pets:                 false,
    needs_furnished:          false,
    preferred_neighborhoods:  '',
    additional_requirements:  '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.target_state)   { setError('Please select a state.'); return }
    if (!form.lease_duration) { setError('Please select a lease duration.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { error: err } = await supabase.from('service_requests').insert({
      user_id:      user.id,
      service_type: 'apartment_search',
      request_data: {
        ...form,
        budget_min:   Number(form.budget_min),
        budget_max:   Number(form.budget_max),
        num_bedrooms: Number(form.num_bedrooms),
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
            Your apartment search request is pending review. A local helper will be assigned shortly.
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
          <Label htmlFor="target_city">Target city *</Label>
          <Input id="target_city" placeholder="e.g. Chicago" value={form.target_city} onChange={set('target_city')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Target state *</Label>
          <Select value={form.target_state} onValueChange={(v) => setForm((f) => ({ ...f, target_state: v }))}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="move_in_date">Move-in date *</Label>
          <Input id="move_in_date" type="date" value={form.move_in_date} onChange={set('move_in_date')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="num_bedrooms">Bedrooms *</Label>
          <Input id="num_bedrooms" type="number" min="0" max="10" value={form.num_bedrooms} onChange={set('num_bedrooms')} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="budget_min">Budget min ($/mo) *</Label>
          <Input id="budget_min" type="number" min="0" placeholder="500" value={form.budget_min} onChange={set('budget_min')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget_max">Budget max ($/mo) *</Label>
          <Input id="budget_max" type="number" min="0" placeholder="2000" value={form.budget_max} onChange={set('budget_max')} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Preferred lease duration *</Label>
        <Select value={form.lease_duration} onValueChange={(v) => setForm((f) => ({ ...f, lease_duration: v }))}>
          <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
          <SelectContent>
            {LEASE_DURATIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id="has_pets" checked={form.has_pets}
            onCheckedChange={(v) => setForm((f) => ({ ...f, has_pets: !!v }))} />
          <Label htmlFor="has_pets" className="cursor-pointer">I have pets</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="needs_furnished" checked={form.needs_furnished}
            onCheckedChange={(v) => setForm((f) => ({ ...f, needs_furnished: !!v }))} />
          <Label htmlFor="needs_furnished" className="cursor-pointer">Need furnished</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferred_neighborhoods">Preferred neighborhoods</Label>
        <Input id="preferred_neighborhoods" placeholder="e.g. Lincoln Park, Wicker Park" value={form.preferred_neighborhoods} onChange={set('preferred_neighborhoods')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="additional_requirements">Additional requirements</Label>
        <Textarea id="additional_requirements" placeholder="Near public transit, no-smoking building, etc." value={form.additional_requirements} onChange={set('additional_requirements')} rows={3} />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Submitting…' : 'Submit request'}
      </Button>
    </form>
  )
}
