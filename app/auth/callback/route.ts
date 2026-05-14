import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const mode = searchParams.get('mode')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (mode === 'verify_linkedin' && session?.user) {
      const linkedinIdentity = session.user.identities?.find(
        (identity) => identity.provider === 'linkedin_oidc'
      )

      if (linkedinIdentity) {
        const linkedinName = linkedinIdentity.identity_data?.name as string | undefined
        await supabase.from('profiles').update({
          linkedin_verified: true,
          ...(linkedinName ? { linkedin_name: linkedinName } : {}),
        }).eq('id', session.user.id)

        return NextResponse.redirect(`${origin}/profile?verified=linkedin`)
      }

      return NextResponse.redirect(`${origin}/profile?verified=linkedin_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
