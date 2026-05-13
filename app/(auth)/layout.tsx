import { Home, Heart, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Home className="h-6 w-6" />
          ImmigrantsFirstStay
        </Link>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-snug">
            A home for your<br />first days in a new country.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Connect with welcoming hosts who have been through the immigrant journey themselves
            and want to make yours easier.
          </p>
          <div className="pt-4 space-y-3">
            {[
              { icon: Heart,   text: 'Hosts who genuinely care' },
              { icon: Shield,  text: 'Verified listings' },
              { icon: Globe,   text: 'Multilingual community' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">ImmigrantsFirstStay © {new Date().getFullYear()}</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
