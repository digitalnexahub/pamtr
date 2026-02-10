'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-gold max-w-none text-[var(--muted)] space-y-6">
          <p>At PAMTR™, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website including any other media form, media channel, mobile website, or mobile application related or connected thereto.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Collection of Data</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage your account.</li>
            <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
            <li>Email you regarding your account or order.</li>
          </ul>
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
