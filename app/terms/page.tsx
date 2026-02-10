'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <nav className="border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)]"></div>
             <span className="font-bold text-lg text-white">PAMTR™</span>
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--gold)]">Back to Home</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-gold max-w-none text-[var(--muted)] space-y-6">
          <p>These Terms of Service ("Terms") govern your access to and use of the PAMTR™ website and services. By accessing or using the Service, you agree to be bound by these Terms.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using our Service, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Use of Service</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You are prohibited from using the Service in any way that violates any applicable federal, state, local, or international law or regulation.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of PAMTR™ and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Termination</h2>
          <p>We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </main>

      <footer className="foot">
        <div className="wrap">
          <span>© 2025 PAMTR™ / ACRELS. All rights reserved.</span>
          <div className="links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
