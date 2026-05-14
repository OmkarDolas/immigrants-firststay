'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, EyeOff, Loader2, Trash2, UserCheck, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ListingProps = {
  type: 'listing'
  listingId: string
  isVerified: boolean
  isActive: boolean
}

type UserProps = {
  type: 'user'
  userId: string
  verificationStatus: string
}

type Props = ListingProps | UserProps

export default function AdminActions(props: Props) {
  const [loading,        setLoading]        = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reason,         setReason]         = useState('')
  const router   = useRouter()
  const supabase = createClient()

  if (props.type === 'listing') {
    const { listingId, isVerified, isActive } = props

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
          <Button size="sm" variant="outline"
            className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => update({ is_verified: true })} disabled={loading}>
            <CheckCircle className="h-3 w-3 mr-1" /> Verify
          </Button>
        ) : (
          <Button size="sm" variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => update({ is_verified: false })} disabled={loading}>
            Unverify
          </Button>
        )}
        {isActive ? (
          <Button size="sm" variant="outline"
            className="h-7 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={() => update({ is_active: false })} disabled={loading}>
            <EyeOff className="h-3 w-3 mr-1" /> Remove
          </Button>
        ) : (
          <Button size="sm" variant="outline"
            className="h-7 text-xs"
            onClick={() => update({ is_active: true })} disabled={loading}>
            Restore
          </Button>
        )}
      </div>
    )
  }

  // User verification actions
  const { userId, verificationStatus } = props

  const deleteUser = async () => {
    setLoading(true)
    await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
    setLoading(false)
    setShowDeleteConfirm(false)
  }

  const approveUser = async () => {
    setLoading(true)
    await supabase.from('profiles').update({
      verification_status: 'approved',
      rejection_reason:    null,
    }).eq('id', userId)
    router.refresh()
    setLoading(false)
  }

  const rejectUser = async () => {
    if (!reason.trim()) return
    setLoading(true)
    await supabase.from('profiles').update({
      verification_status: 'rejected',
      rejection_reason:    reason.trim(),
    }).eq('id', userId)
    router.refresh()
    setLoading(false)
    setShowRejectForm(false)
    setReason('')
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive font-medium">Delete user permanently?</span>
        <Button size="sm" variant="destructive"
          className="h-7 text-xs shrink-0"
          onClick={deleteUser} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
        </Button>
        <Button size="sm" variant="ghost"
          className="h-7 text-xs shrink-0"
          onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  if (showRejectForm) {
    return (
      <div className="flex items-center gap-2 min-w-[260px]">
        <Input
          className="h-7 text-xs"
          placeholder="Rejection reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') rejectUser() }}
          autoFocus
        />
        <Button size="sm" variant="destructive"
          className="h-7 text-xs shrink-0"
          onClick={rejectUser} disabled={loading || !reason.trim()}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
        </Button>
        <Button size="sm" variant="ghost"
          className="h-7 text-xs shrink-0"
          onClick={() => { setShowRejectForm(false); setReason('') }}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

      {verificationStatus !== 'approved' && (
        <Button size="sm" variant="outline"
          className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
          onClick={approveUser} disabled={loading}>
          <UserCheck className="h-3 w-3 mr-1" /> Approve
        </Button>
      )}

      {verificationStatus === 'approved' && (
        <Button size="sm" variant="ghost"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => {
            setReason('Account review required')
            setShowRejectForm(true)
          }} disabled={loading}>
          Revoke
        </Button>
      )}

      {verificationStatus !== 'rejected' && (
        <Button size="sm" variant="outline"
          className="h-7 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={() => setShowRejectForm(true)} disabled={loading}>
          <UserX className="h-3 w-3 mr-1" /> Reject
        </Button>
      )}

      <Button size="sm" variant="ghost"
        className="h-7 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5"
        onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
