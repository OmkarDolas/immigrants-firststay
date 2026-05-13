'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, CheckCircle } from 'lucide-react'
import { getInitials, LANGUAGE_OPTIONS } from '@/lib/utils'

export default function ProfilePage() {
  const [profile, setProfile]     = useState<Partial<Profile>>({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const isNew       = searchParams.get('new') === 'true'
  const supabase    = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data ?? { id: user.id, email: user.email ?? '' })
      setLoading(false)
    }
    load()
  }, [])

  const toggleLanguage = (lang: string) => {
    const current = profile.languages ?? []
    const updated  = current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang]
    setProfile((p) => ({ ...p, languages: updated }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:         profile.full_name,
        bio:               profile.bio,
        phone:             profile.phone,
        languages:         profile.languages ?? [],
        role:              profile.role ?? 'guest',
        country_of_origin: profile.country_of_origin,
      })
      .eq('id', user.id)

    if (error) { setError(error.message); setSaving(false); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)

    if (isNew) router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{isNew ? 'Complete your profile' : 'Edit profile'}</h1>
        <p className="text-muted-foreground mt-1">
          {isNew
            ? 'Tell us a bit about yourself so hosts and guests can get to know you.'
            : 'Keep your profile up to date.'}
        </p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20 ring-4 ring-primary/20">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile.full_name || 'Your Name'}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {profile.role ?? 'guest'}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name *</Label>
              <Input
                id="fullName"
                value={profile.full_name ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country">Country of origin</Label>
              <Input
                id="country"
                value={profile.country_of_origin ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, country_of_origin: e.target.value }))}
                placeholder="e.g. Mexico, India, Syria…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={profile.bio ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A little about yourself — where you're from, your story, what you love about your city…"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role</CardTitle>
            <CardDescription>
              Choose how you want to participate. You can change this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'guest', label: '🧳 Guest',     desc: "I'm looking for a stay" },
                { value: 'host',  label: '🏠 Host',      desc: "I can host newcomers"   },
                { value: 'both',  label: '🤝 Both',      desc: "I want to do both"      },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, role: value as Profile['role'] }))}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    profile.role === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages</CardTitle>
            <CardDescription>Select all languages you speak.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={(profile.languages ?? []).includes(lang)}
                    onCheckedChange={() => toggleLanguage(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNew ? 'Save & continue' : 'Save changes'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
