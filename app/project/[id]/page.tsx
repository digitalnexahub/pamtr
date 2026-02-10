'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, CheckCircle, FileText, AlertTriangle, ExternalLink, CreditCard, Wallet, Copy, Share2, X, Download, Check, Clock } from 'lucide-react';
import { usePAMTR } from '@/lib/context';
import { Project, Receipt } from '@/lib/types';
import clsx from 'clsx';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, updateProject, addAuditLog, currentUser } = usePAMTR();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Support Flow State
  const [supportAmount, setSupportAmount] = useState(100);
  const [selectedRail, setSelectedRail] = useState<'ACRELS Coin' | 'USDC' | 'Card'>('ACRELS Coin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isHashCopied, setIsHashCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Simulate data fetch
    const id = params.id as string;
    const foundProject = projects.find(p => p.id === id);
    
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [params.id, projects]);

  const handleSupport = async () => {
    if (!project) return;
    setIsProcessing(true);

    // Simulate network delay for transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate Mock Receipt
    const newReceipt: Receipt = {
      id: `RCPT-${project.id.split('-')[1]}-${Date.now().toString().slice(-6)}`,
      projectId: project.id,
      amount: supportAmount,
      rail: selectedRail,
      timestamp: new Date().toISOString(),
      hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };

    setReceipt(newReceipt);
    setIsProcessing(false);
    
    // Update global store
    const updatedProject = {
      ...project,
      receipts: [newReceipt, ...project.receipts]
    };
    updateProject(updatedProject);
    addAuditLog('Support Project', `Received support of $${supportAmount} via ${selectedRail} for ${project.name}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyHash = () => {
    if (receipt) {
      navigator.clipboard.writeText(receipt.hash);
      setIsHashCopied(true);
      setTimeout(() => setIsHashCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#020617', // slate-950
      });
      
      const link = document.createElement('a');
      link.download = `PAMTR-Share-Card-${project?.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--gold)]">Loading...</div>;

  // Access Control:
  // - Public: Only Live, Verified, Revoked
  // - Admin/Verifier: All statuses (including Under Verification, Submitted, Draft)
  // - Submitter: Own projects (not implemented here fully, assuming admin/verifier context for now)
  const isPubliclyVisible = project?.status === 'Live' || project?.status === 'Verified' || project?.status === 'Revoked';
  
  // Refined Access Logic (Audit requirement):
  // Projects pending review should only be visible to the Auditor and the Submitter.
  const isPendingReview = project?.status === 'Submitted' || project?.status === 'Under Verification';
  
  let hasAccess = false;
  if (isPubliclyVisible) {
    hasAccess = true;
  } else if (currentUser.role !== 'public') {
    if (isPendingReview) {
      // Only audit@acrels.org or the owner can see pending reviews
      hasAccess = currentUser.email === 'audit@acrels.org' || currentUser.id === project?.submitterId;
    } else {
      // Default internal visibility for other states (e.g. Draft, Rejected)
      hasAccess = true;
    }
  }

  if (!project || !hasAccess) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-16 h-16 text-[var(--gold)] mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Project Not Available</h1>
        <p className="text-[var(--muted)] max-w-md">
          This project does not exist or has not yet met the strict verification requirements for public listing on PAMTR.
        </p>
        <Link href="/" className="mt-8 btn secondary">Return Home</Link>
      </div>
    );
  }

  // Interaction Logic:
  // Support and Share features are only available for Verified or Live projects.
  const isActionable = project.status === 'Live' || project.status === 'Verified';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--muted2)] font-sans selection:bg-[var(--gold)]/30 pb-20">
      {/* Nav */}
      <nav className="border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)]"></div>
             <span className="font-bold text-lg text-white">PAMTR™</span>
          </Link>
          <div className="flex gap-3 md:gap-4">
            <Link href="/verify" className="text-xs md:text-sm text-[var(--muted)] hover:text-[var(--gold)] flex items-center">Verify<span className="hidden sm:inline">&nbsp;Receipt</span></Link>
            <Link href="/dashboard" className="text-xs md:text-sm text-[var(--muted)] hover:text-[var(--gold)] flex items-center">Portal</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-[var(--panel2)] text-xs font-mono text-[var(--muted)] border border-[var(--line)]">
                {project.id}
              </span>
              <span className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                project.status === 'Live' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              )}>
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 break-words">{project.name}</h1>
            <div className="flex items-center gap-4 text-[var(--muted)] text-lg">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div> {project.country}</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--muted)]"></div> {project.mineralType}</span>
            </div>
          </div>

          {/* Trust Seal Badge */}
          {project.seal && (
            <div className="w-full md:w-auto md:max-w-xs bg-gradient-to-br from-[var(--panel)] to-[var(--panel2)] p-4 md:p-6 rounded-2xl border border-[var(--gold)]/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-[var(--gold)] mb-3" />
              <div className="text-[var(--gold)] font-bold text-lg leading-tight mb-1">{project.seal.level}</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-3">Trust Seal™ Issued</div>
              <div className="text-xs text-[var(--muted)] font-mono">
                {new Date(project.seal.date).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Left Column: Proof Summary */}
          <div className="md:col-span-2 space-y-8 md:space-y-12">
            
            {/* Proof Stack Summary */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="text-[var(--gold)]" />
                Proof Stack™ Summary
              </h2>
              <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden">
                <div className="p-4 md:p-6 grid gap-4">
                  <ProofItem label="Mining License / Concession" active={project.proofPack.miningLicense} verified={project.proofPack.verifiedDocuments?.includes('miningLicense')} />
                  <ProofItem label="Government Authorization" active={project.proofPack.govAuthorization} verified={project.proofPack.verifiedDocuments?.includes('govAuthorization')} />
                  <ProofItem label="Environmental Approvals" active={project.proofPack.envApprovals} verified={project.proofPack.verifiedDocuments?.includes('envApprovals')} />
                  <ProofItem label="Operating Entity Documentation" active={project.proofPack.operatingEntityDoc} verified={project.proofPack.verifiedDocuments?.includes('operatingEntityDoc')} />
                  <ProofItem label="Compliance Attestations" active={project.proofPack.complianceAttestations} verified={project.proofPack.verifiedDocuments?.includes('complianceAttestations')} />
                  <ProofItem label="Partner MOUs" active={project.proofPack.partnerMOUs} verified={project.proofPack.verifiedDocuments?.includes('partnerMOUs')} />
                  <ProofItem label="Optional Independent Audits" active={project.proofPack.optionalAudits} optional verified={project.proofPack.verifiedDocuments?.includes('optionalAudits')} />
                </div>
                <div className="bg-[var(--bg)]/50 p-4 border-t border-[var(--line)] text-center">
                  <p className="text-sm text-[var(--muted)]">
                    * Raw documents are held securely by ACRELS/PAMTR. Public visitors see this verified summary.
                  </p>
                </div>
              </div>
            </section>

            {/* Description / Story (Mock) */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Project Narrative</h2>
              <div className="prose prose-invert max-w-none text-[var(--muted2)]">
                <p>
                  This project represents a verified mineral extraction initiative in {project.country}. 
                  It has undergone rigorous due diligence to ensure compliance with local regulations, environmental standards, and community engagement protocols.
                </p>
                <p>
                  By securing the PAMTR Trust Seal™, the operators have demonstrated a commitment to transparency and operational excellence, distinct from unverified artisanal mining operations.
                </p>
              </div>
            </section>

          </div>

          {/* Right Column: Support Widget */}
          <div className={clsx(
            "space-y-8 md:sticky md:top-24 self-start transition-all duration-300",
            !isActionable && currentUser.role !== 'admin' && currentUser.role !== 'verifier' && "blur-sm opacity-50 pointer-events-none select-none grayscale"
          )}>
            
            {/* Admin/Verifier Contact View */}
            {(currentUser.role === 'admin' || currentUser.role === 'verifier') && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--gold)]" />
                  Submitter Contact
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Email Address</div>
                    <div className="text-white font-mono break-all">{project.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Phone Number</div>
                    <div className="text-white font-mono">{project.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-4 md:p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Support this Project</h3>
              
              {!receipt ? (
                <>
                  {/* Rails Tabs */}
                  <div className="flex p-1 bg-[var(--bg)] rounded-xl mb-6">
                    {(['ACRELS Coin', 'USDC', 'Card'] as const).map((rail) => (
                      <button
                        key={rail}
                        onClick={() => setSelectedRail(rail)}
                        className={clsx(
                          "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                          selectedRail === rail 
                            ? "bg-[var(--panel2)] text-white shadow-sm" 
                            : "text-[var(--muted)] hover:text-[var(--muted2)]"
                        )}
                      >
                        {rail === 'Card' ? 'Card' : rail.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-2">Contribution Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                      <input 
                        type="number" 
                        value={supportAmount}
                        onChange={(e) => setSupportAmount(Number(e.target.value))}
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl py-4 pl-8 pr-4 text-xl font-bold text-white focus:outline-none focus:border-[var(--gold)]"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-xs text-[var(--muted)] mb-6 space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Funds go directly to verified operator wallet
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Generates immutable on-chain receipt
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSupport}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-slate-950 font-bold text-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        {selectedRail === 'Card' ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                        Support Project
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="animate-in zoom-in duration-300">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Support Successful!</h3>
                    <p className="text-sm text-[var(--muted)]">Thank you for building trust.</p>
                  </div>

                  <div className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--line)] mb-6 text-left">
                    <div className="mb-3">
                      <div className="text-xs text-[var(--muted)] uppercase">Receipt ID</div>
                      <div className="font-mono text-sm text-white">{receipt.id}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-[var(--muted)] uppercase flex items-center justify-between">
                        Transaction Hash
                        {isHashCopied && <span className="text-green-500 font-bold animate-in fade-in flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>}
                      </div>
                      <div 
                        onClick={handleCopyHash}
                        className="font-mono text-xs text-[var(--gold)] break-all cursor-pointer hover:text-[var(--gold2)] hover:bg-[var(--gold)]/10 rounded p-1 -ml-1 transition-colors relative group"
                        title="Click to copy"
                      >
                        {receipt.hash}
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--panel)] text-[var(--muted)] text-[10px] px-2 py-1 rounded border border-[var(--line)] pointer-events-none">
                          Copy
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xs text-[var(--muted)] uppercase">Amount</div>
                        <div className="font-mono text-sm text-white">${receipt.amount}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-[var(--muted)] uppercase">Rail</div>
                         <div className="font-mono text-sm text-white">{receipt.rail}</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setReceipt(null); setSupportAmount(100); }}
                    className="w-full py-3 rounded-xl border border-[var(--line)] text-[var(--muted2)] hover:bg-[var(--panel)] transition-colors"
                  >
                    Make Another Contribution
                  </button>
                  
                  <div className="mt-4 text-center">
                     <Link href="/verify" className="text-xs text-[var(--gold)] hover:underline">Verify this receipt</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Share Card CTA */}
            <div className="bg-gradient-to-br from-[var(--panel2)] to-[var(--panel)] rounded-2xl p-4 md:p-6 border border-[var(--line)]">
               <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                 <Share2 className="w-5 h-5 text-[var(--gold)]" />
                 Share this Project
               </h4>
               <p className="text-sm text-[var(--muted)] mb-4">Generate a Proof Share Card to verify this project on social media.</p>
               <button 
                 onClick={() => setIsShareOpen(true)}
                 className="w-full py-2 bg-[var(--line)] hover:bg-[var(--line)]/80 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
               >
                 Generate Share Card
               </button>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {isShareOpen && project && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg)]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-3xl p-4 md:p-6 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsShareOpen(false)}
              className="absolute right-4 top-4 text-[var(--muted)] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 text-center">Proof Share Card</h3>
            
            {/* The Card */}
            <div ref={cardRef} className="bg-gradient-to-br from-[var(--bg)] to-[var(--panel)] border border-[var(--gold)]/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] aspect-[4/5] relative flex flex-col mb-6 group select-none">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--gold2)] to-[var(--gold3)]"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--gold)]/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-6 md:mb-8">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)]"></div>
                  <span className="font-bold text-white tracking-tight">PAMTR™</span>
                </div>
                
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--panel2)]/80 border border-[var(--line)] text-xs font-mono text-[var(--muted)] mb-4">
                    {project.id}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{project.name}</h2>
                  
                  <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
                    <span className="px-2 py-1 bg-[var(--panel2)] rounded text-xs text-[var(--muted)] border border-[var(--line)]">{project.country}</span>
                    <span className="px-2 py-1 bg-[var(--panel2)] rounded text-xs text-[var(--muted)] border border-[var(--line)]">{project.mineralType}</span>
                  </div>
                  
                  {project.seal && (
                    <div className="bg-gradient-to-r from-[var(--gold)]/10 to-transparent border-l-4 border-[var(--gold)] pl-4 py-2 mb-6">
                      <div className="text-[var(--gold)] text-xs font-bold uppercase tracking-wider mb-1">Trust Seal™ Verified</div>
                      <div className="text-white font-bold">{project.seal.level}</div>
                      <div className="text-[var(--muted)] text-xs">{new Date(project.seal.date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">Scan to Verify</div>
                    {/* Real QR Code */}
                    <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center">
                         <QRCode 
                           value={window.location.href} 
                           size={80}
                           style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                           viewBox={`0 0 256 256`}
                         />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[var(--gold)] font-bold mb-1">VERIFY ON</div>
                    <div className="text-2xl font-bold text-white tracking-tight">PAMTR.ORG</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--panel2)] hover:bg-[var(--line)] text-white font-medium transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold2)] text-slate-950 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProofItem({ label, active, optional, verified }: { label: string, active: boolean, optional?: boolean, verified?: boolean }) {
  return (
    <div className={clsx(
      "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-2 sm:gap-4",
      active ? "bg-[var(--panel)] border-[var(--gold)]/30" : "bg-[var(--bg)] border-[var(--line)] opacity-70"
    )}>
      <div className="flex items-center gap-3">
        {active ? (
          verified ? (
            <CheckCircle className="w-5 h-5 text-[var(--gold)] shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-[var(--gold)] shrink-0" />
          )
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-[var(--line)] shrink-0" />
        )}
        <span className={clsx(
          "text-sm sm:text-base",
          active ? "text-white" : "text-[var(--muted)]"
        )}>
          {label} {optional && <span className="text-xs text-[var(--muted2)]">(Optional)</span>}
        </span>
      </div>
      <div className="ml-8 sm:ml-0 self-start sm:self-auto">
        {active && verified && (
          <span className="text-[10px] sm:text-xs font-mono text-[var(--gold)] px-2 py-1 bg-[var(--gold)]/10 rounded">VERIFIED</span>
        )}
        {active && !verified && (
          <span className="text-[10px] sm:text-xs font-mono text-[var(--muted)] px-2 py-1 bg-[var(--muted)]/10 rounded border border-[var(--line)]">PENDING REVIEW</span>
        )}
      </div>
    </div>
  );
}