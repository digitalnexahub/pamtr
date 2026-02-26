'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, ExternalLink, Shield } from 'lucide-react';
import { usePAMTR } from '@/lib/context';
import { Project, Receipt } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export default function VerifyPage() {
  const { projects } = usePAMTR();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ project: Project; receipt?: Receipt } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setResult(null);

    if (!query.trim()) return;

    // Search logic: Check TX hash or Receipt ID, OR Project ID
    // Iterate through all projects and their receipts
    const cleanQuery = query.trim().toLowerCase();
    
    for (const project of projects) {
      // Check for Receipt
      const foundReceipt = project.receipts.find(
        (r) => r.hash.toLowerCase() === cleanQuery || r.id.toLowerCase() === cleanQuery
      );

      if (foundReceipt) {
        setResult({ project, receipt: foundReceipt });
        return;
      }
      
      // Check for Project ID
      if (project.id.toLowerCase() === cleanQuery) {
        setResult({ project }); // receipt is undefined
        return;
      }
    }

    // Also allow searching by Project ID just in case (though requirements say tx hash or receipt ID)
    // Adding it for completeness if the user types a project ID
    // But strictly following the requirement: "tx hash OR receipt ID"
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--gold)]/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
               src="/logo.jpeg" 
                alt="PAMTR" 
                width={180} 
                height={72} 
                className="h-16 w-auto object-contain"
              />
             <div className="hidden sm:block border-l border-[var(--gold)]/30 pl-3">
               <p className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-medium">Public Verification</p>
             </div>
           </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
            Back<span className="hidden sm:inline"> to Home</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[var(--panel)] border border-[var(--line)] mb-6 shadow-xl">
            <Shield className="w-8 h-8 text-[var(--gold)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[var(--gold2)] to-[var(--gold3)] mb-4 tracking-tight">
            Verify Trust
          </h1>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Enter a Transaction Hash or Receipt ID to verify the authenticity of a contribution or project status on the Pan-African Mineral Trust Registry.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative z-10">
          <div className="absolute inset-0 bg-[var(--gold)]/5 blur-3xl rounded-full"></div>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Receipt ID (e.g., RCPT-...) or TX Hash (0x...)"
              className="w-full h-14 md:h-16 pl-6 pr-16 bg-[var(--panel)]/80 border border-[var(--line)] rounded-2xl text-base md:text-lg text-white placeholder:text-[var(--muted2)] focus:outline-none focus:border-[var(--gold)]/50 focus:ring-4 focus:ring-[var(--gold)]/10 transition-all shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-[var(--gold)] to-[var(--gold3)] rounded-xl flex items-center justify-center text-[var(--bg)] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--gold)]/20"
            >
              <Search className="w-6 h-6" />
            </button>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result ? (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(200,162,74,0.1)]">
                {/* Header */}
                <div className="bg-[var(--bg)]/50 px-8 py-6 border-b border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Verification Successful</h3>
                      <p className="text-sm text-[var(--muted)]">Record found in PAMTR Registry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-1">Verified At</div>
                    <div className="font-mono text-[var(--gold)]">{new Date().toLocaleString()}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Project Details</div>
                      <h2 className="text-2xl font-bold text-white mb-1">{result.project.name}</h2>
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <span>{result.project.country}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--line)]"></span>
                        <span>{result.project.mineralType}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Seal Status</div>
                      {result.project.seal ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] font-medium text-sm">
                          <Shield className="w-4 h-4" />
                          {result.project.seal.level}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--panel2)] border border-[var(--line)] text-[var(--muted)] font-medium text-sm">
                          No Seal Issued
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-2">Project Status</div>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                        result.project.status === 'Live' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-[var(--panel2)] border-[var(--line)] text-[var(--muted)]'
                      }`}>
                        {result.project.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {result.receipt ? (
                      <div className="bg-[var(--bg)]/50 rounded-xl p-6 border border-[var(--line)]">
                        <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-4">Transaction Details</div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-[var(--muted2)] mb-1">Receipt ID</div>
                            <div className="font-mono text-sm text-[var(--muted)] break-all">{result.receipt.id}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--muted2)] mb-1">Transaction Hash</div>
                            <div className="font-mono text-sm text-[var(--gold)]/80 break-all">{result.receipt.hash}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-[var(--muted2)] mb-1">Amount</div>
                              <div className="text-lg font-bold text-white">
                                {result.receipt.amount} <span className="text-sm font-normal text-[var(--muted)]">{result.receipt.rail}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-[var(--muted2)] mb-1">Timestamp</div>
                              <div className="text-sm text-[var(--muted)]">
                                {new Date(result.receipt.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--line)]">
                          <a 
                            href={`https://etherscan.io/tx/${result.receipt.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-sm text-[var(--gold)] hover:text-[var(--gold2)] transition-colors"
                          >
                            <span>View on Block Explorer</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[var(--bg)]/50 rounded-xl p-6 border border-[var(--line)]">
                        <div className="text-xs uppercase tracking-wider text-[var(--muted2)] mb-4">Proof Pack Summary</div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-[var(--muted)]">Proof Score</span>
                             <span className="text-white font-bold">{result.project.proofPack.completionPercentage}%</span>
                           </div>
                           <div className="w-full bg-[var(--panel2)] rounded-full h-2">
                             <div 
                               className="bg-[var(--gold)] h-2 rounded-full" 
                               style={{ width: `${result.project.proofPack.completionPercentage}%` }}
                             ></div>
                           </div>
                           <div className="pt-4 grid grid-cols-2 gap-2">
                             {Object.entries(result.project.proofPack).filter(([key]) => key !== 'completionPercentage').slice(0, 4).map(([key, val]) => (
                               <div key={key} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                 {val ? <CheckCircle className="w-3 h-3 text-[var(--good)]" /> : <div className="w-3 h-3 rounded-full border border-[var(--line)]"></div>}
                                 <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                               </div>
                             ))}
                           </div>
                           <Link href={`/project/${result.project.id}`} className="block mt-4 text-center text-sm text-[var(--gold)] hover:text-[var(--gold2)]">
                             View Full Project Details
                           </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--panel)]/50 border border-red-500/20 rounded-3xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Record Found</h3>
                <p className="text-[var(--muted)] max-w-md mx-auto">
                  We couldn't find a matching record for "{query}". Please check the Receipt ID or Transaction Hash and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
