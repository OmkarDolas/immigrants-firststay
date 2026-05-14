import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — ImmigrantsFirstStay' }

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide when you create an account (name, email, password), verify your identity (government ID documents), and use platform features (listings, bookings, service requests).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your information is used to verify your identity, facilitate bookings and services, and improve the platform. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Government ID Documents</h2>
          <p className="text-muted-foreground leading-relaxed">
            Government ID documents are stored securely in a private storage bucket and are only accessible to our admin team for identity verification purposes. They are never displayed publicly or shared with hosts or guests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Data Storage</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored using Supabase, a secure cloud database provider. We use row-level security policies to ensure users can only access their own data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use secure, HTTP-only cookies to manage authentication sessions. No tracking or advertising cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may request access to, correction of, or deletion of your personal data at any time by contacting us through the platform. Deleting your account removes your profile and data from our system.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy, please contact us through the platform.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t text-sm text-muted-foreground">
        See also: <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
      </div>
    </div>
  )
}
