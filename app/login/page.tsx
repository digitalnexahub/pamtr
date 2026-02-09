'use client';

import { useState } from 'react';
import { usePAMTR } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = usePAMTR();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[var(--muted)]">Sign in to access the PAMTR Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--bad)]/10 border border-[var(--bad)]/20 rounded-xl text-[var(--bad)] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--muted2)]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] z-10 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '4rem' }}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl py-3 pr-4 text-white placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--muted2)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] z-10 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '4rem' }}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl py-3 pr-4 text-white placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--gold)] hover:bg-[var(--gold2)] text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--muted2)]">
          <p>Demo Accounts:</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between px-8">
              <span>Admin:</span>
              <span className="font-mono text-[var(--muted)]">admin@pamtr.org</span>
            </div>
            <div className="flex justify-between px-8">
              <span>Submitter:</span>
              <span className="font-mono text-[var(--muted)]">mines@ghana.gov.gh</span>
            </div>
             <div className="flex justify-between px-8">
              <span>Verifier:</span>
              <span className="font-mono text-[var(--muted)]">audit@acrels.org</span>
            </div>
          </div>
          <p className="mt-4 text-xs">Password for all: <span className="font-mono text-[var(--muted)]">password</span></p>
        </div>
        
        <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[var(--gold)] hover:text-[var(--gold2)] transition-colors">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}
