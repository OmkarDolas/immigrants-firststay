'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { type Profile } from '@/types'
import {
  Home, Search, Menu, X, LayoutDashboard, ListPlus,
  CalendarCheck, User, LogOut, Shield, Briefcase, Clock, Upload,
} from 'lucide-react'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    getProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => getProfile())
    return () => subscription.unsubscribe()
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const isApproved = profile?.role === 'admin' || profile?.verification_status === 'approved'
  const isPending  = !!profile && !isApproved

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Home className="h-5 w-5" />
          <span className="text-lg">ImmigrantsFirstStay</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/search" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-4 w-4" /> Find a Host
          </Link>

          {isApproved && (
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/bookings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <CalendarCheck className="h-4 w-4" /> Bookings
              </Link>
              <Link href="/services" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Briefcase className="h-4 w-4" /> Services
              </Link>
              {(profile?.role === 'host' || profile?.role === 'both') && (
                <Link href="/listings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ListPlus className="h-4 w-4" /> My Listings
                </Link>
              )}
            </>
          )}

          {isPending && (
            <Link href="/pending-approval" className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors">
              <Clock className="h-4 w-4" /> Pending Approval
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-secondary transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                    {profile.full_name || profile.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="h-4 w-4 mr-2" />Profile</Link>
                </DropdownMenuItem>

                {isApproved && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings"><CalendarCheck className="h-4 w-4 mr-2" />Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/services"><Briefcase className="h-4 w-4 mr-2" />Services</Link>
                    </DropdownMenuItem>
                    {(profile.role === 'host' || profile.role === 'both') && (
                      <DropdownMenuItem asChild>
                        <Link href="/listings"><ListPlus className="h-4 w-4 mr-2" />My Listings</Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {isPending && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/pending-approval"><Clock className="h-4 w-4 mr-2" />Pending Approval</Link>
                    </DropdownMenuItem>
                    {!profile.gov_id_path && (
                      <DropdownMenuItem asChild>
                        <Link href="/upload-id"><Upload className="h-4 w-4 mr-2" />Upload ID</Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {profile.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><Shield className="h-4 w-4 mr-2" />Admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/services"><Briefcase className="h-4 w-4 mr-2" />Service Requests</Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          <Link href="/search" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
            <Search className="h-4 w-4" /> Find a Host
          </Link>

          {profile ? (
            <>
              {isApproved && (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    <CalendarCheck className="h-4 w-4" /> Bookings
                  </Link>
                  <Link href="/services" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                    <Briefcase className="h-4 w-4" /> Services
                  </Link>
                  {(profile.role === 'host' || profile.role === 'both') && (
                    <Link href="/listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                      <ListPlus className="h-4 w-4" /> My Listings
                    </Link>
                  )}
                </>
              )}

              {isPending && (
                <>
                  <Link href="/pending-approval" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-600 hover:bg-secondary">
                    <Clock className="h-4 w-4" /> Pending Approval
                  </Link>
                  {!profile.gov_id_path && (
                    <Link href="/upload-id" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                      <Upload className="h-4 w-4" /> Upload ID
                    </Link>
                  )}
                </>
              )}

              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                <User className="h-4 w-4" /> Profile
              </Link>

              {profile.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}

              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-secondary">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
