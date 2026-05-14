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
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { getInitials, LANGUAGE_OPTIONS } from '@/lib/utils'

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Partial<Profile>>({})
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [verifyingLI, setVerifyingLI] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [verifyBanner, setVerifyBanner] = useState<'linkedin' | 'linkedin_failed' | null>(null)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isNew        = searchParams.get('new') === 'true'
  const supabase     = createClient()

  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'linkedin') setVerifyBanner('linkedin')
    if (verified === 'linkedin_failed') setVerifyBanner('linkedin_failed')
    if (verified) router.replace('/profile')
  }, [])

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
        instagram_url:     profile.instagram_url ?? null,
      })
      .eq('id', user.id)

    if (error) { setError(error.message); setSaving(false); return }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)

    if (isNew) router.push('/dashboard')
  }

  const verifyWithLinkedIn = async () => {
    setVerifyingLI(true)
    const redirectTo = `${window.location.origin}/auth/callback?next=/profile&mode=verify_linkedin`
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo },
    })
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

      {/* Verification result banners */}
      {verifyBanner === 'linkedin' && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          LinkedIn verified successfully! Your profile now shows a LinkedIn badge.
        </div>
      )}
      {verifyBanner === 'linkedin_failed' && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          LinkedIn verification failed. Make sure you authorized the app and try again.
        </div>
      )}

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

        {/* Social Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity Verification</CardTitle>
            <CardDescription>
              Verified hosts build significantly more trust with guests. Connect your social accounts to prove you are who you say you are.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* LinkedIn */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">LinkedIn</p>
                  {profile.linkedin_verified
                    ? <p className="text-xs text-green-600 font-medium">
                        Verified{profile.linkedin_name ? ` as ${profile.linkedin_name}` : ''}
                      </p>
                    : <p className="text-xs text-muted-foreground">Not verified</p>
                  }
                </div>
              </div>
              {profile.linkedin_verified ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={verifyWithLinkedIn}
                  disabled={verifyingLI}
                  className="shrink-0"
                >
                  {verifyingLI && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Verify with LinkedIn
                </Button>
              )}
            </div>

            <Separator />

            {/* Instagram */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Instagram</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.instagram_url
                      ? 'Pending admin review'
                      : 'Add your profile link for extra trust'}
                  </p>
                </div>
              </div>
              <Input
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={profile.instagram_url ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, instagram_url: e.target.value }))}
              />
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
