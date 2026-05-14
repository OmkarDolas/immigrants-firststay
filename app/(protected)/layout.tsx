import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verification_status')
    .eq('id', user.id)
    .single()

  // Admins bypass the approval gate
  if (profile?.role === 'admin') return <>{children}</>

  // Approved users proceed normally
  if (profile?.verification_status === 'approved') return <>{children}</>

  // Everyone else (pending / rejected / no profile yet) waits
  redirect('/pending-approval')
}
