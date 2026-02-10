'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Contact Us</h1>
        <div className="text-[var(--muted)] space-y-6 mb-12">
          <p>Have questions about PAMTR™ or need assistance? We're here to help. Reach out to us using the contact information below or fill out the form.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--panel2)] border border-[var(--line)] rounded-lg">
                <Mail className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Email</h3>
                <p className="text-[var(--muted)] text-sm">support@pamtr.org</p>
                <p className="text-[var(--muted)] text-sm">compliance@pamtr.org</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--panel2)] border border-[var(--line)] rounded-lg">
                <MapPin className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Office</h3>
                <p className="text-[var(--muted)] text-sm">
                  123 Blockchain Blvd, Suite 400<br />
                  Geneva, Switzerland 1204
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--panel2)] border border-[var(--line)] rounded-lg">
                <Phone className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Phone</h3>
                <p className="text-[var(--muted)] text-sm">+41 22 555 0123</p>
                <p className="text-[var(--muted2)] text-xs mt-1">Mon-Fri, 9am - 6pm CET</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Name</label>
                <input type="text" className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3 text-white focus:border-[var(--gold)] focus:outline-none transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Email</label>
                <input type="email" className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3 text-white focus:border-[var(--gold)] focus:outline-none transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Message</label>
                <textarea className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3 text-white focus:border-[var(--gold)] focus:outline-none transition-colors h-32 resize-none" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full btn bg-[var(--gold)] text-black font-bold py-3 rounded-lg hover:bg-[var(--gold2)] transition-colors">
                Send Message
              </button>
            </form>
          </div>
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
