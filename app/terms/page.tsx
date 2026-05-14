import Link from 'next/link'

export const metadata = { title: 'Terms of Service — ImmigrantsFirstStay' }

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using ImmigrantsFirstStay, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            You must be at least 18 years old to use our services. By signing up, you confirm that you meet this requirement and that the information you provide is accurate and truthful.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Identity Verification</h2>
          <p className="text-muted-foreground leading-relaxed">
            All users are required to submit a government-issued ID for identity verification before accessing platform features. Your documents are reviewed only by our admin team and are stored securely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for all activity on your account. You agree not to misuse the platform, post false information, or engage in any activity that violates applicable law or harms other users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Bookings and Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Bookings are arrangements between guests and hosts. ImmigrantsFirstStay facilitates but does not guarantee the outcome of any booking. Payment methods are agreed upon directly between guests and hosts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms, submit fraudulent documents, or engage in harmful behavior.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms, please contact us through the platform.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t text-sm text-muted-foreground">
        See also: <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
      </div>
    </div>
  )
}
