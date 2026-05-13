import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home, Plane, Search, Globe,
  Heart, Shield, CheckCircle, ArrowRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-blue-50 to-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Your First Home{' '}
              <span className="text-primary">in a New Country</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
              Connect with welcoming hosts who understand the immigrant journey.
              Find a safe, supportive place to stay while you get settled —
              with people who&apos;ve been there too.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/search">
                  <Search className="h-5 w-5 mr-2" />
                  Find a Host
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/signup">
                  Become a Host <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Get settled in three simple steps — no complicated processes, just genuine hospitality.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Search for a Host',
                desc: 'Browse verified hosts in your destination city. Filter by language, support type, and dates.',
              },
              {
                icon: Home,
                step: '02',
                title: 'Send a Booking Request',
                desc: 'Select your dates, introduce yourself, and send a request. Hosts typically respond within 24 hours.',
              },
              {
                icon: CheckCircle,
                step: '03',
                title: 'Get Settled',
                desc: 'Once accepted, connect with your host and arrive with confidence. Your new chapter begins!',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute top-0 right-0 text-5xl font-black text-primary/5">{step}</span>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support types ── */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">More Than Just a Place to Stay</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our hosts offer a range of support to help you feel at home from day one.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Home,   title: 'Temporary Stay',        desc: 'A safe, welcoming roof over your head while you find permanent housing.' },
              { icon: Plane,  title: 'Airport Pickup',        desc: 'Get picked up on arrival — no scrambling for transport in an unfamiliar city.' },
              { icon: Search, title: 'Apartment Search Help', desc: 'Navigate the local rental market with insider knowledge and referrals.' },
              { icon: Globe,  title: 'Local Guidance',        desc: 'Tips on transport, food, culture, and everything in between.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Built on Trust &amp; Safety</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            We know trust is everything when you&apos;re new to a country. Every listing
            goes through our review process, and our community is built on shared
            experiences and genuine care.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { icon: Shield,      text: 'Host verification badges for added confidence' },
              { icon: CheckCircle, text: 'Honest reviews from real guests' },
              { icon: CheckCircle, text: 'Clear booking process with status updates' },
              { icon: Heart,       text: 'Community of immigrants helping immigrants' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 shrink-0">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Open Your Home?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Create a listing and start welcoming immigrants to your city.
            It takes less than 10 minutes to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90 border-0 text-base px-8" asChild>
              <Link href="/signup">Create your host profile</Link>
            </Button>
            <Button size="lg" className="bg-white/20 hover:bg-white/30 border border-white/30 text-base px-8" asChild>
              <Link href="/search">Browse hosts first</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
