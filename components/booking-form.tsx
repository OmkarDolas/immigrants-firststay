'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, CheckCircle, LogIn, CalendarOff } from 'lucide-react'
import { calculateNights, formatCurrency, PAYMENT_METHODS } from '@/lib/utils'

interface Props {
  listingId:               string
  hostId:                  string
  maxGuests:               number
  maxStayDays:             number
  isFree:                  boolean
  pricePerNight:           number | null
  availableFrom:           string | null
  availableTo:             string | null
  isLoggedIn:              boolean
  isBooked:                boolean
  paymentMethodsAccepted:  string[]
}

export default function BookingForm({
  listingId, hostId, maxGuests, maxStayDays,
  isFree, pricePerNight, availableFrom, availableTo,
  isLoggedIn, isBooked, paymentMethodsAccepted,
}: Props) {
  const today   = new Date().toISOString().split('T')[0]
  const minDate = availableFrom ?? today
  const maxDate = availableTo   ?? undefined

  const [checkIn,       setCheckIn]       = useState(minDate)
  const [checkOut,      setCheckOut]      = useState('')
  const [numGuests,     setNumGuests]     = useState(1)
  const [message,       setMessage]       = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading,       setLoading]       = useState(false)
  const [success,       setSuccess]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  const nights     = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const totalPrice = isFree ? 0 : (pricePerNight ?? 0) * nights

  const acceptedMethods = PAYMENT_METHODS.filter((m) =>
    paymentMethodsAccepted.includes(m.value)
  )

  const validate = (): string | null => {
    if (!checkIn)                              return 'Please select a check-in date.'
    if (!checkOut)                             return 'Please select a check-out date.'
    if (nights <= 0)                           return 'Check-out must be after check-in.'
    if (nights > maxStayDays)                  return `Maximum stay is ${maxStayDays} days.`
    if (numGuests < 1)                         return 'At least 1 guest required.'
    if (numGuests > maxGuests)                 return `Maximum ${maxGuests} guests allowed.`
    if (!isFree && acceptedMethods.length > 0 && !paymentMethod)
                                               return 'Please select a payment method.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: err } = await supabase.from('bookings').insert({
      listing_id:     listingId,
      guest_id:       user.id,
      host_id:        hostId,
      check_in:       checkIn,
      check_out:      checkOut,
      num_guests:     numGuests,
      message:        message.trim() || null,
      status:         'pending',
      total_price:    isFree ? 0 : totalPrice,
      payment_method: isFree ? null : (paymentMethod || null),
      payment_status: 'pending',
    })

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
  }

  if (!isLoggedIn) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h3 className="font-semibold">Sign in to book</h3>
          <p className="text-sm text-muted-foreground">
            Create a free account to send a booking request to this host.
          </p>
          <Button asChild className="w-full">
            <Link href="/signup">
              <LogIn className="h-4 w-4 mr-2" /> Get started free
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isBooked) {
    return (
      <Card className="shadow-md border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center space-y-3">
          <CalendarOff className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="font-semibold text-amber-900">Currently Booked</h3>
          <p className="text-sm text-amber-700">
            This host is currently hosting a guest. Check back soon — the listing will re-open after the current stay ends.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6 text-center space-y-4">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
          <h3 className="font-semibold text-lg">Request sent!</h3>
          <p className="text-sm text-muted-foreground">
            Your booking request has been sent. The host will respond within 24–48 hours.
          </p>
          {paymentMethod && (
            <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
              Payment method: <span className="font-medium">
                {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod}
              </span>
            </p>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/bookings">View my bookings</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {isFree ? (
            <span className="text-green-600 font-bold text-xl">Free stay</span>
          ) : (
            <span>
              <span className="text-xl font-bold">{formatCurrency(pricePerNight ?? 0)}</span>
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="checkIn" className="text-xs">Check-in</Label>
              <Input
                id="checkIn" type="date" value={checkIn}
                min={minDate} max={maxDate}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  if (checkOut && e.target.value >= checkOut) setCheckOut('')
                }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkOut" className="text-xs">Check-out</Label>
              <Input
                id="checkOut" type="date" value={checkOut}
                min={checkIn || minDate} max={maxDate}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guests" className="text-xs">Guests (max {maxGuests})</Label>
            <Input
              id="guests" type="number" min={1} max={maxGuests}
              value={numGuests}
              onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Payment method — only for paid stays with accepted methods */}
          {!isFree && acceptedMethods.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Payment method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="How will you pay?" />
                </SelectTrigger>
                <SelectContent>
                  {acceptedMethods.map(({ value, label, icon }) => (
                    <SelectItem key={value} value={value}>
                      {icon} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Payment is arranged directly with the host after acceptance.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs">Message to host</Label>
            <Textarea
              id="message" rows={3} value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself — where you're from, why you're moving, when you arrive…"
            />
          </div>

          {/* Price breakdown */}
          {nights > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5 text-sm">
                {!isFree && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{formatCurrency(pricePerNight ?? 0)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{isFree ? 'Free' : formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Sending request…' : 'Request to book'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {isFree
              ? 'Send a request — the host must accept first.'
              : "You won't be charged yet. Payment is arranged after the host accepts."}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
