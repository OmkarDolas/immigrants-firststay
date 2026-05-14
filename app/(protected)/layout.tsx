import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status, gov_id_path')
    .eq('id', user.id)
    .single()

  // No profile row yet (new user or RLS gap) — send to upload-id
  if (!profile) redirect('/upload-id')

  // Admins bypass the approval gate
  if (profile.role === 'admin') return <>{children}</>

  // Approved users proceed normally
  if (profile.verification_status === 'approved') return <>{children}</>

  // No ID uploaded yet — user skipped verification, allow access
  if (!profile.gov_id_path) return <>{children}</>

  // Uploaded ID but not yet approved — wait for admin review
  redirect('/pending-approval')
}
