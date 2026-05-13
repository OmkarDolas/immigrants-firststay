'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  listingId:  string
  isVerified: boolean
  isActive:   boolean
}

export default function AdminActions({ listingId, isVerified, isActive }: Props) {
  const [loading, setLoading] = useState(false)
  const router    = useRouter()
  const supabase  = createClient()

  const update = async (patch: Record<string, boolean>) => {
    setLoading(true)
    await supabase.from('host_listings').update(patch).eq('id', listingId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

      {!isVerified ? (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => update({ is_verified: true })}
          disabled={loading}
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Verify
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => update({ is_verified: false })}
          disabled={loading}
        >
          Unverify
        </Button>
      )}

      {isActive && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={() => update({ is_active: false })}
          disabled={loading}
        >
          <EyeOff className="h-3 w-3 mr-1" /> Remove
        </Button>
      )}

      {!isActive && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => update({ is_active: true })}
          disabled={loading}
        >
          Restore
        </Button>
      )}
    </div>
  )
}
