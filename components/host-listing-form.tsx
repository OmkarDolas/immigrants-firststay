'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type HostListing } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle } from 'lucide-react'
import { SUPPORT_OPTIONS, LANGUAGE_OPTIONS, US_STATES, PAYMENT_METHODS } from '@/lib/utils'

type FormData = Partial<Omit<HostListing, 'id' | 'host_id' | 'created_at' | 'updated_at' | 'is_verified' | 'is_booked' | 'profiles'>>

interface Props {
  initialData?: Partial<HostListing>
  listingId?: string
}

export default function HostListingForm({ initialData, listingId }: Props) {
  const isEdit = !!listingId
  const router  = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<FormData>({
    title:            initialData?.title            ?? '',
    city:             initialData?.city             ?? '',
    state:            initialData?.state            ?? '',
    address:          initialData?.address          ?? '',
    neighborhood:     initialData?.neighborhood     ?? '',
    description:      initialData?.description      ?? '',
    max_guests:       initialData?.max_guests       ?? 1,
    max_stay_days:    initialData?.max_stay_days    ?? 30,
    is_free:          initialData?.is_free          ?? true,
    price_per_night:  initialData?.price_per_night  ?? null,
    house_rules:      initialData?.house_rules      ?? '',
    languages_spoken:         initialData?.languages_spoken         ?? [],
    support_offered:          initialData?.support_offered          ?? [],
    payment_methods_accepted: initialData?.payment_methods_accepted ?? [],
    available_from:           initialData?.available_from           ?? '',
    available_to:             initialData?.available_to             ?? '',
    is_active:                initialData?.is_active                ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleArray = (key: 'languages_spoken' | 'support_offered' | 'payment_methods_accepted', val: string) => {
    const arr = (form[key] as string[]) ?? []
    set(key, (arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]) as FormData[typeof key])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    const payload = {
      ...form,
      price_per_night: form.is_free ? null : (form.price_per_night ?? null),
      available_from:  form.available_from || null,
      available_to:    form.available_to   || null,
    }

    if (isEdit) {
      const { error: err } = await supabase.from('host_listings').update(payload).eq('id', listingId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('host_listings').insert({ ...payload, host_id: user.id })
      if (err) { setError(err.message); setSaving(false); return }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/listings'), 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Listing Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Listing title *</Label>
            <Input id="title" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Cozy room in Chicago — bilingual host" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your space, neighborhood, what you offer…" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)}
                placeholder="Chicago" required />
            </div>
            <div className="space-y-1.5">
              <Label>State *</Label>
              <Select value={form.state ?? ''} onValueChange={(v) => set('state', v)}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input id="neighborhood" value={form.neighborhood ?? ''}
                onChange={(e) => set('neighborhood', e.target.value)} placeholder="e.g. Logan Square" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Street address</Label>
              <Input id="address" value={form.address ?? ''}
                onChange={(e) => set('address', e.target.value)} placeholder="Shared with guests on confirmation" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Dates */}
      <Card>
        <CardHeader><CardTitle className="text-base">Capacity &amp; Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxGuests">Max guests *</Label>
              <Input id="maxGuests" type="number" min={1} max={20}
                value={form.max_guests ?? 1}
                onChange={(e) => set('max_guests', parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxStay">Max stay (days) *</Label>
              <Input id="maxStay" type="number" min={1} max={365}
                value={form.max_stay_days ?? 30}
                onChange={(e) => set('max_stay_days', parseInt(e.target.value) || 30)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="availFrom">Available from</Label>
              <Input id="availFrom" type="date" value={form.available_from ?? ''}
                onChange={(e) => set('available_from', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="availTo">Available until</Label>
              <Input id="availTo" type="date" value={form.available_to ?? ''}
                onChange={(e) => set('available_to', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={form.is_free ?? true}
              onCheckedChange={(v) => set('is_free', !!v)}
            />
            <span className="text-sm font-medium">This is a free stay</span>
          </label>

          {!form.is_free && (
            <div className="space-y-1.5">
              <Label htmlFor="price">Price per night (USD) *</Label>
              <Input id="price" type="number" min={0} step={0.01}
                value={form.price_per_night ?? ''}
                onChange={(e) => set('price_per_night', parseFloat(e.target.value) || 0)}
                placeholder="0.00" required={!form.is_free} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment methods */}
      {!form.is_free && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accepted Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(({ value, label, icon }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-secondary transition-colors">
                  <Checkbox
                    checked={(form.payment_methods_accepted as string[] ?? []).includes(value)}
                    onCheckedChange={() => toggleArray('payment_methods_accepted', value)}
                  />
                  <span className="text-sm">{icon} {label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support offered */}
      <Card>
        <CardHeader><CardTitle className="text-base">Support Offered</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {SUPPORT_OPTIONS.map(({ value, label, icon }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-secondary transition-colors">
                <Checkbox
                  checked={(form.support_offered as string[]).includes(value)}
                  onCheckedChange={() => toggleArray('support_offered', value)}
                />
                <span className="text-sm">{icon} {label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader><CardTitle className="text-base">Languages Spoken</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={(form.languages_spoken as string[]).includes(lang)}
                  onCheckedChange={() => toggleArray('languages_spoken', lang)}
                />
                {lang}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* House rules */}
      <Card>
        <CardHeader><CardTitle className="text-base">House Rules</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={4} value={form.house_rules ?? ''}
            onChange={(e) => set('house_rules', e.target.value)}
            placeholder="Quiet hours, no smoking, pet policy, shared spaces, etc." />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving || saved} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saved ? 'Saved! Redirecting…' : isEdit ? 'Save changes' : 'Create listing'}
        </Button>
        {saved && <CheckCircle className="h-5 w-5 text-green-500" />}
      </div>
    </form>
  )
}
