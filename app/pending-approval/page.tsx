import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Clock, XCircle, CheckCircle, LogOut } from 'lucide-react'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, verification_status, rejection_reason, gov_id_path, role')
    .eq('id', user.id)
    .single()

  // Approved users and admins should never land here
  if (profile?.role === 'admin' || profile?.verification_status === 'approved') {
    redirect('/dashboard')
  }

  const status = profile?.verification_status ?? 'pending'
  const name   = profile?.full_name ?? user.email

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status === 'pending' && (
          <Card className="border-amber-200 shadow-md">
            <CardContent className="pt-10 pb-8 text-center space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mx-auto">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold">Pending review</h1>
              <p className="text-muted-foreground">
                Hi {name}, your identity verification is being reviewed by our admin team.
                You will be able to access the platform once approved — typically within 24 hours.
              </p>

              {!profile?.gov_id_path && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  We have not received your government ID yet.{' '}
                  <Link href="/upload-id" className="font-semibold underline">
                    Upload it now
                  </Link>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/upload-id">Re-upload ID</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-muted-foreground">
                  <Link href="/login">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'rejected' && (
          <Card className="border-destructive/30 shadow-md">
            <CardContent className="pt-10 pb-8 text-center space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mx-auto">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Verification rejected</h1>
              <p className="text-muted-foreground">
                Sorry {name}, we could not verify your identity with the provided document.
              </p>
              {profile?.rejection_reason && (
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-left">
                  <p className="font-medium text-destructive mb-1">Reason from admin:</p>
                  <p className="text-foreground">{profile.rejection_reason}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Please upload a clearer or different government ID to try again.
              </p>
              <Button asChild className="w-full">
                <Link href="/upload-id">Upload a new ID</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fallback for no status */}
        {status !== 'pending' && status !== 'rejected' && (
          <Card className="shadow-md">
            <CardContent className="pt-10 pb-8 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <h1 className="text-2xl font-bold">Almost there!</h1>
              <p className="text-muted-foreground">Complete identity verification to access the platform.</p>
              <Button asChild className="w-full">
                <Link href="/upload-id">Verify identity</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
