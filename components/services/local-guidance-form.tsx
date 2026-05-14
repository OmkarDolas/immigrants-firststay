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
import { LANGUAGE_OPTIONS, US_STATES } from '@/lib/utils'

const GUIDANCE_CATEGORIES = [
  { value: 'groceries',           label: 'Groceries & Food Shopping'     },
  { value: 'transportation',      label: 'Transportation & Getting Around'},
  { value: 'bank_account',        label: 'Opening a Bank Account'        },
  { value: 'sim_card',            label: 'Getting a SIM Card'            },
  { value: 'healthcare',          label: 'Healthcare & Medical'          },
  { value: 'school_university',   label: 'School / University'           },
  { value: 'job_search',          label: 'Job Search'                    },
  { value: 'legal_immigration',   label: 'Legal / Immigration Support'   },
  { value: 'other',               label: 'Other'                         },
]

const URGENCY_LEVELS = [
  { value: 'low',    label: 'Low — within a week'     },
  { value: 'medium', label: 'Medium — within 2-3 days' },
  { value: 'high',   label: 'High — as soon as possible' },
]

export function LocalGuidanceForm() {
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    city:                '',
    state:               '',
    guidance_category:   '',
    preferred_language:  '',
    urgency_level:       '',
    question:            '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.state)             { setError('Please select a state.'); return }
    if (!form.guidance_category) { setError('Please select a guidance category.'); return }
    if (!form.preferred_language){ setError('Please select a preferred language.'); return }
    if (!form.urgency_level)     { setError('Please select an urgency level.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { error: err } = await supabase.from('service_requests').insert({
      user_id:      user.id,
      service_type: 'local_guidance',
      request_data: form,
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
            Your guidance request is pending review. A local expert will reach out soon.
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
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="e.g. Houston" value={form.city} onChange={set('city')} required />
        </div>
        <div className="space-y-1.5">
          <Label>State *</Label>
          <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Guidance category *</Label>
        <Select value={form.guidance_category} onValueChange={(v) => setForm((f) => ({ ...f, guidance_category: v }))}>
          <SelectTrigger><SelectValue placeholder="What do you need help with?" /></SelectTrigger>
          <SelectContent>
            {GUIDANCE_CATEGORIES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Preferred language *</Label>
          <Select value={form.preferred_language} onValueChange={(v) => setForm((f) => ({ ...f, preferred_language: v }))}>
            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Urgency level *</Label>
          <Select value={form.urgency_level} onValueChange={(v) => setForm((f) => ({ ...f, urgency_level: v }))}>
            <SelectTrigger><SelectValue placeholder="How urgent?" /></SelectTrigger>
            <SelectContent>
              {URGENCY_LEVELS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="question">Your question / details *</Label>
        <Textarea
          id="question"
          placeholder="Describe what you need help with in as much detail as possible…"
          value={form.question}
          onChange={set('question')}
          rows={4}
          required
        />
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
