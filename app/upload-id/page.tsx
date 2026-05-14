'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileCheck, ShieldCheck } from 'lucide-react'

const ID_TYPES = [
  { value: 'passport',        label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id',     label: 'National ID Card' },
  { value: 'residence_permit',label: 'Residence Permit' },
  { value: 'other',           label: 'Other Government ID' },
]

export default function UploadIdPage() {
  const [idType,    setIdType]    = useState('')
  const [file,      setFile]      = useState<File | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [checking,  setChecking]  = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Already approved users don't need to re-upload
      const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status, role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin' || profile?.verification_status === 'approved') {
        router.push('/dashboard')
        return
      }

      setChecking(false)
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file)   { setError('Please select a file.'); return }
    if (!idType) { setError('Please select an ID type.'); return }

    const maxSize = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSize) { setError('File must be under 10 MB.'); return }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG, WEBP, or PDF files are allowed.'); return }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/government_id.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('government-ids')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      setError(`Upload failed: ${uploadErr.message}`)
      setLoading(false)
      return
    }

    const { error: updateErr } = await supabase.from('profiles').update({
      gov_id_path:         path,
      gov_id_type:         idType,
      verification_status: 'pending',
    }).eq('id', user.id)

    if (updateErr) {
      setError(`Failed to save: ${updateErr.message}`)
      setLoading(false)
      return
    }

    router.push('/pending-approval')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verify your identity</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Upload a government-issued ID to complete your account setup. Our admin team will review it within 24 hours.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Government ID</CardTitle>
            <CardDescription>
              Accepted: Passport, Driver&apos;s License, National ID, Residence Permit.
              JPG, PNG, WEBP or PDF · Max 10 MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label>ID Type *</Label>
                <Select value={idType} onValueChange={setIdType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Upload file *</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
                    cursor-pointer p-8 transition-colors
                    ${file ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                  `}
                >
                  {file ? (
                    <>
                      <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                      <p className="font-medium text-sm text-green-700">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium text-sm">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP or PDF</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setFile(f); setError(null) }
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !file || !idType}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Uploading…' : 'Submit for review'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your ID is stored securely and only reviewed by our admin team. It is never shared publicly.
        </p>
      </div>
    </div>
  )
}
