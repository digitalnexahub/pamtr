"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Upload, CheckCircle, FileText, Menu, X } from "lucide-react";
import { usePAMTR } from "@/lib/context";
import { Project } from "@/lib/types";

export default function Home() {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { projects, currentUser, announcements, addProject, countries } = usePAMTR();
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  
  // Filter for active announcements only
  const activeAnnouncements = announcements.filter(a => a.status === 'Active');
  const activeAnnouncement = activeAnnouncements.find(a => a.type === 'Alert') || activeAnnouncements[0];

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [mineralFilter, setMineralFilter] = useState("All Minerals");

  const [newProject, setNewProject] = useState({
    name: '',
    country: '',
    mineralType: '',
    email: '',
    phone: '',
    proofPack: {
      miningLicense: false,
      govAuthorization: false,
      envApprovals: false,
      operatingEntityDoc: false,
      complianceAttestations: false,
      partnerMOUs: false,
      optionalAudits: false,
      completionPercentage: 0,
      fileData: {},
      fileMetadata: {}
    }
  });

  const handleSubmit = () => {
    if (!newProject.name || !newProject.country || !newProject.mineralType || !newProject.email || !newProject.phone) {
      alert("Please fill in all required fields (Name, Country, Mineral Type, Email, Phone).");
      return;
    }
    
    // Calculate completion percentage based on uploaded files
    const uploadedCount = Object.values(newProject.proofPack).filter(v => v === true).length;
    const completionPercentage = Math.round((uploadedCount / 7) * 100);

    // Create the project object (mock submission)
    const projectToSubmit: Project = {
      id: `PAMTR-${newProject.country.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProject.name,
      country: newProject.country,
      mineralType: newProject.mineralType,
      status: 'Submitted',
      submitterId: currentUser.id || 'u1', // Default to public user if not logged in
      email: newProject.email,
      phone: newProject.phone,
      proofPack: {
        ...newProject.proofPack,
        completionPercentage: 0 // Initialize to 0% for verification tracking (distinct from upload completion)
      },
      seal: undefined,
      receipts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("Submitting Project:", projectToSubmit);
    addProject(projectToSubmit);
    alert(`Project Application Submitted Successfully! \n\nA confirmation email has been sent to ${newProject.email}.\n\nOur team will review your documents.`);
    
    // Reset and close
    setNewProject({
      name: '',
      country: '',
      mineralType: '',
      email: '',
      phone: '',
      proofPack: {
        miningLicense: false,
        govAuthorization: false,
        envApprovals: false,
        operatingEntityDoc: false,
        complianceAttestations: false,
        partnerMOUs: false,
        optionalAudits: false,
        completionPercentage: 0,
        fileData: {},
        fileMetadata: {}
      }
    });
    setIsRegisterOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    // Public Registry Visibility Rule: Only show Live, Verified, or Revoked projects
    // Hidden: Submitted, Under Verification, Draft, Rejected
    const isPublic = p.status === 'Live' || p.status === 'Verified' || p.status === 'Revoked';
    if (!isPublic) return false;

    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "All Countries" || p.country === countryFilter;
    const matchesMineral = mineralFilter === "All Minerals" || p.mineralType === mineralFilter;
    return matchesSearch && matchesCountry && matchesMineral;
  });

  const verifiedCount = projects.filter(p => p.status === 'Verified' || p.status === 'Live').length;
  const totalVolume = projects.length * 25000; // Mock calculation: 25k oz per project avg

  return (
    <>
      {isBannerVisible && activeAnnouncement && (
        <div className="relative z-[60] bg-[var(--panel)] border-b border-[var(--line)]">
          <div className="wrap flex items-center justify-between py-2.5">
             <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  activeAnnouncement.type === 'Alert' 
                    ? 'bg-[var(--bad)]/20 text-[var(--bad)] border border-[var(--bad)]/30' 
                    : 'bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30'
                }`}>
                  {activeAnnouncement.type}
                </span>
                <span className="text-[var(--text)]">
                  {activeAnnouncement.message}
                </span>
             </div>
             <button 
               onClick={() => setIsBannerVisible(false)}
               className="text-[var(--muted)] hover:text-white transition-colors p-1"
               aria-label="Dismiss announcement"
             >
               ✕
             </button>
          </div>
        </div>
      )}
      <div className="topbar">
        <div className="wrap">
          <div className="nav">
            <div className="brand">
              <Link href="/">
                <Image 
                  src="/logo.jpeg" 
                  alt="PAMTR Logo" 
                  width={240} 
                  height={120} 
                  className="h-20 w-auto object-contain cursor-pointer"
                  priority
                />
              </Link>
            </div>
            
            {/* Desktop Links */}
            <div className="links !hidden md:!flex">
              <a href="#adoption">Adoption Kit</a>
              <a href="#nodes">Country Nodes</a>
              <a href="#charter">Charter</a>
              <a href="#proof">Proof Stack™</a>
              <a href="#seal">Trust Seal™</a>
              <a href="#standards">Standards</a>
              <a href="#governance">Governance</a>
              <Link href="/verify">Verify</Link>
              <a href="#partners">Partners</a>
              <Link href="/dashboard" className="ml-auto">{currentUser?.role !== 'public' ? 'Dashboard' : 'Sign In'}</Link>
              <button 
                className="btn secondary" 
                onClick={() => setIsLegalOpen(true)}
              >
                Legal
              </button>
              <button 
                className="btn goldGlass shimmer"
                onClick={() => setIsRegisterOpen(true)}
              >
                Request Access
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-[var(--muted)] hover:text-white p-2 ml-auto"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>


        </div>
      </div>

      {/* Mobile Menu Dropdown (Side Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          
          {/* Drawer */}
          <div className="relative w-[85%] max-w-xs bg-neutral-950 h-full border-r border-[var(--line)] shadow-2xl p-6 flex flex-col gap-6 animate-slide-in">
            
            {/* Header with Logo and Close */}
            <div className="flex items-center justify-between">
              <div className="brand" style={{minWidth: 'auto'}}>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image 
                    src="/logo.jpeg" 
                    alt="PAMTR Logo" 
                    width={180} 
                    height={80} 
                    className="h-14 w-auto object-contain cursor-pointer"
                  />
                </Link>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-[var(--muted)] hover:text-white"
                aria-label="Close Menu"
              >
                <X />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-5 overflow-y-auto flex-1 py-2">
               <a href="#adoption" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Adoption Kit</a>
               <a href="#nodes" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Country Nodes</a>
               <a href="#charter" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Charter</a>
               <a href="#proof" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Proof Stack™</a>
               <a href="#seal" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Trust Seal™</a>
               <a href="#standards" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Standards</a>
               <a href="#governance" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Governance</a>
               <Link href="/verify" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Verify</Link>
               <a href="#partners" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--muted)] hover:text-white font-medium transition-colors">Partners</a>
               <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-[var(--gold)] hover:text-white font-bold transition-colors">
                 {currentUser?.role !== 'public' ? 'Dashboard' : 'Sign In'}
               </Link>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--line)]">
               <button 
                  className="btn secondary w-full justify-center" 
                  onClick={() => { setIsLegalOpen(true); setIsMobileMenuOpen(false); }}
                >
                  Legal
                </button>
                <button 
                  className="btn goldGlass shimmer w-full justify-center"
                  onClick={() => { setIsRegisterOpen(true); setIsMobileMenuOpen(false); }}
                >
                  Request Access
                </button>
            </div>
          </div>
        </div>
      )}

      <header className="hero">
        <div className="wrap">
          <div className="heroGrid">
            <div className="card heroCard shimmer">
              <span className="kicker">No Proof • No Mint • No Exceptions</span>
              <h2>Africa’s minerals.<br/>Verified once.<br/>Trusted everywhere.</h2>
              <p>
                PAMTR™ is a sovereignty‑respecting trust layer that verifies, registers, and (where lawful) enables disciplined pooled representation of mineral projects—so the world can engage responsibly.
              </p>
              <div className="ctaRow">
                <a className="btn goldGlass" href="#registry">Enter the Registry</a>
                <button className="btn secondary" onClick={() => setIsRegisterOpen(true)}>Register New Project</button>
              </div>
              <div className="pillRow" aria-label="Trust pillars">
                <span className="pill">Verification</span>
                <span className="pill">Chain‑of‑Trust</span>
                <span className="pill">Independent Audit</span>
                <span className="pill">KYC/AML Gating</span>
                <span className="pill">Governance Discipline</span>
                <span className="pill">Seal Revocation</span>
              </div>
              <p className="micro">
                This site is informational only and does not constitute an offer or solicitation. Participation (if any) is subject to eligibility, jurisdictional restrictions, KYC/AML, and definitive documentation.
              </p>
            </div>

            <aside className="card sideCard">
              <div className="metric shimmer">
                <b>Program Scope</b>
                <span>Initial pipeline: <b className="text-[var(--gold)]">{totalVolume.toLocaleString()} oz</b> targeted.<br/>
                <span style={{fontSize:"11px", color:"var(--good)"}}>{verifiedCount} Projects Verified</span></span>
                <div className="spark" aria-hidden="true"><i></i></div>
              </div>
              <div className="metric">
                <b>Model</b>
                <span><b className="text-[var(--gold)]">Pooled representation</b> with disciplined mint/burn tied to verified milestones (where lawful).</span>
              </div>
              <div className="metric">
                <b>Steward / Operator</b>
                <span><b>ACRELS</b> (system architect) with implementation partners including <b>Highly Anointed Exploits Ltd.</b></span>
              </div>
              <div className="metric">
                <b>Trust Hook</b>
                <span>“We do not sell belief. We document reality.”</span>
              </div>
            </aside>
          </div>

          <blockquote className="quote shimmer">“Africa does not need louder marketing.<br/>It needs a single standard of truth.”</blockquote>
        </div>
      </header>

      {/* 1) SOVEREIGN ADOPTION KIT */}
      <section id="adoption" className="section">
        <div className="wrap">
          <h3>Sovereign Adoption Kit</h3>
          <div className="subgrid">
            <div className="panel">
              <h4>Government / Agency Toolkit (Concept)</h4>
              <p>
                Ready‑to‑sign templates and a 90‑day pilot playbook to adopt PAMTR™ without surrendering sovereignty.
              </p>
              <div className="pillRow">
                <span className="pill">MOU Templates</span>
                <span className="pill">Regulatory Boundary Memo</span>
                <span className="pill">Implementation Roadmap</span>
                <span className="pill">Transparency Report Template</span>
              </div>
              <div className="ctaRow mt-3">
                <button className="btn secondary">Preview Toolkit</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
            <div className="panel">
              <h4>Traditional Authority Toolkit (Concept)</h4>
              <p>
                Royal‑safe language, custodianship protections, and a Pilot Annex template (Breman State‑ready).
              </p>
              <div className="pillRow">
                <span className="pill">Royal Pilot Annex</span>
                <span className="pill">Custodianship Protections</span>
                <span className="pill">Community Benefit Tracking</span>
              </div>
              <div className="ctaRow mt-3">
                <button className="btn secondary">Preview Royal Kit</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
          </div>
          <div className="legalbox mt-3.5">
            <b>Adoption principle:</b> Each country keeps local rules and authority while sharing one continental proof standard.
          </div>
        </div>
      </section>

      {/* 2) COUNTRY NODES */}
      <section id="nodes" className="section">
        <div className="wrap">
          <h3>Country Nodes Architecture</h3>
          <div className="subgrid">
            <div className="panel">
              <h4>What is a “Node”?</h4>
              <p>
                A Node is a country‑specific implementation of PAMTR™ that respects local regulators and customary systems, while publishing the same Proof Stack™ and Seal logic.
              </p>
              <div className="pillRow">
                <span className="pill">Local Sovereignty</span>
                <span className="pill">Shared Standard</span>
                <span className="pill">Interoperable Registry</span>
              </div>
            </div>
            <div className="panel">
              <h4>Node Examples (Concept)</h4>
              <p>
                PAMTR‑Ghana • PAMTR‑Nigeria • PAMTR‑Kenya • PAMTR‑Ethiopia<br/>
                Each Node can host a local portal and publish read‑only status to the continental registry.
              </p>
              <div className="ctaRow mt-3">
                <button className="btn secondary">View Node Spec</button>
                <button className="btn goldGlass shimmer">Apply to Launch a Node</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARTER */}
      <section id="charter" className="section">
        <div className="wrap">
          <h3>Founding Charter</h3>
          <div className="subgrid">
            <div className="panel">
              <h4>PAMTR™ Founding Charter</h4>
              <p>
                A constitutional‑grade instrument establishing the trust infrastructure: sovereignty‑first verification, Proof Stack™, Mineral Trust Seal™, the public Registry, and disciplined representation principles.
              </p>
              <div className="ctaRow mt-3">
                <button className="btn secondary">Preview Charter</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
            <div className="panel">
              <h4>Core Non‑Negotiables</h4>
              <p>
                <b style={{color: "var(--gold2)"}}>Verification before representation.</b> Transparency as protection. Permanence over speed. Sovereignty remains with states, licensed operators, and recognized customary authorities.
              </p>
              <div className="pillRow">
                <span className="pill">Sovereignty First</span>
                <span className="pill">No Proof, No Mint</span>
                <span className="pill">Immutable Status History</span>
                <span className="pill">Seal Revocation Power</span>
                <span className="pill">Public Methodology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STACK */}
      <section id="proof" className="section">
        <div className="wrap">
          <h3>Proof Stack™</h3>
          <div className="subgrid">
            <div className="proof" role="group" aria-label="Proof Stack">
              <div className="proofRow"><b>1) Sovereign / Customary Proof</b><span className="status good">Verified</span></div>
              <div className="proofRow"><b>2) Scientific Proof</b><span className="status good">Verified</span></div>
              <div className="proofRow"><b>3) Custody Proof</b><span className="status warn">In Progress</span></div>
              <div className="proofRow"><b>4) Audit Proof</b><span className="status warn">Pending</span></div>
              <div className="proofRow"><b>5) On‑Chain Proof</b><span className="status">As Applicable</span></div>
              <div className="legalbox mt-1.5">
                <b>No Proof, No Mint.</b> Any representation/minting (if lawful) is gated by documented verification milestones, custody confirmation, and governance sign‑off.
              </div>
            </div>

            <div className="panel">
              <h4>Why it stops fraud</h4>
              <p>
                The Proof Stack™ is layered. Failure at any layer triggers rejection, suspension, or downgrade. The public sees the status—bad actors can’t hide behind marketing.
              </p>
              <div className="h-px bg-[var(--line2)] mt-2.5"></div>
              <h4 className="mt-3.5">Submission tracks</h4>
              <p>
                <b>Government / Ministry</b> • <b>Traditional Authority</b> • <b>Licensed Operator</b><br/>
                Each track respects authority structures while enforcing one standard of truth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SEAL */}
      <section id="seal" className="section">
        <div className="wrap">
          <h3>Mineral Trust Seal™</h3>
          <div className="sealGrid" aria-label="Seal levels">
            <div className="sealCard shimmer">
              <div className="sealTop">
                <span className="sealBadge"><span className="sealIcon" aria-hidden="true"></span> Seal I — Verified Origin</span>
                <span className="tag seal1"><i></i>Prestige</span>
              </div>
              <p>Granted when identity and authority recognition are confirmed.</p>
            </div>

            <div className="sealCard">
              <div className="sealTop">
                <span className="sealBadge"><span className="sealIcon" aria-hidden="true"></span> Seal II — Custody Ready</span>
                <span className="tag seal2"><i></i>Institutional</span>
              </div>
              <p>Granted when chain‑of‑trust readiness and storage governance are verified.</p>
            </div>

            <div className="sealCard shimmer">
              <div className="sealTop">
                <span className="sealBadge"><span className="sealIcon" aria-hidden="true"></span> Seal III — Representation Eligible</span>
                <span className="tag seal3"><i></i>Highest Standard</span>
              </div>
              <p>Granted only when audit discipline and governance controls are approved.</p>
            </div>
          </div>

          <div className="panel mt-4">
            <h4>Anti‑forgery by design</h4>
            <p>
              Each Seal is bound to a public Registry page and a time‑stamped Proof Stack™ status. A static badge without live validation is treated as misrepresentation.
            </p>
          </div>
        </div>
      </section>

      {/* STANDARDS LIBRARY */}
      <section id="standards" className="section">
        <div className="wrap">
          <h3>Standards Library</h3>
          <div className="featureGrid">
            <div className="feature shimmer">
              <b>Verification Standard (Public)</b>
              <span>Clear requirements per track: Government, Traditional Authority, Licensed Operator.</span>
              <div className="ctaRow mt-3">
                <button className="btn secondary">Preview</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
            <div className="feature">
              <b>Disclosure Standard (Public)</b>
              <span>What must be disclosed (and what can remain confidential) to preserve safety and sovereignty.</span>
              <div className="ctaRow mt-3">
                <button className="btn secondary">Preview</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
            <div className="feature shimmer">
              <b>Audit Cadence Standard (Public)</b>
              <span>Required audit frequency, renewal rules, and red‑flag triggers that result in suspension.</span>
              <div className="ctaRow" style={{marginTop: "12px"}}>
                <button className="btn secondary">Preview</button>
                <button className="btn goldGlass shimmer">Download (placeholder)</button>
              </div>
            </div>
          </div>

          <div className="panel" style={{marginTop: "16px"}}>
            <h4>Why this becomes “continental”</h4>
            <p>
              Countries accept standards they can read, audit, and adopt. Publishing methodology creates trust faster than advertising—and makes the platform hard to politicize.
            </p>
          </div>
        </div>
      </section>

      {/* REGISTRY */}
      <section id="registry" className="section">
        <div className="wrap">
          <h3>Public Registry</h3>
          <div className="registryWrap">
            <div className="registryTop">
              <h4>Verified Mineral Projects</h4>
              <div className="pillRow">
                <span className="pill">Live</span>
                <span className="pill">Audited</span>
                <span className="pill">Revoked</span>
              </div>
            </div>
            <div className="searchbar">
              <div className="field">
                <input 
                  type="text" 
                  placeholder="Search by Project Name, ID, or Hash..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="field">
                <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                  <option>All Countries</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <select value={mineralFilter} onChange={(e) => setMineralFilter(e.target.value)}>
                  <option>All Minerals</option>
                  <option>Gold</option>
                  <option>Lithium</option>
                  <option>Diamond</option>
                </select>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Country</th>
                  <th>Mineral</th>
                  <th>Status</th>
                  <th>Seal Level</th>
                  <th>Last Audit</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="rowlink">
                    <td>
                      <Link href={`/project/${project.id}`} className="hover:underline">
                        <b>{project.name}</b>
                      </Link>
                      <br/>
                      <span style={{fontSize: "11px", color: "var(--muted2)"}}>ID: {project.id}</span>
                    </td>
                    <td>{project.country}</td>
                    <td>{project.mineralType}</td>
                    <td>
                      <span className={`tag ${project.status === 'Live' ? 'v' : project.status === 'Verified' ? 'p' : ''}`}>
                        <i></i>{project.status}
                      </span>
                    </td>
                    <td>
                      {project.seal ? (
                        <span className={`tag ${project.seal.level === 'Audit-Complete' ? 'seal3' : project.seal.level === 'Implementation-Ready' ? 'seal2' : 'seal1'}`}>
                          <i></i>{project.seal.level === 'Audit-Complete' ? 'Seal III' : project.seal.level === 'Implementation-Ready' ? 'Seal II' : 'Seal I'}
                        </span>
                      ) : (
                        <span style={{color: "var(--muted2)", fontSize: "12px"}}>Pending</span>
                      )}
                    </td>
                    <td>{project.seal ? project.seal.date : 'Pending'}</td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-[var(--muted2)]">
                      No projects found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PROJECT SUBMISSION MODAL */}
      {isRegisterOpen && (
        <dialog open className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-[var(--panel)] border border-[var(--gold)]/30 rounded-xl shadow-2xl p-0 text-white backdrop:bg-black/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 sticky top-0 bg-[var(--panel)] border-b border-[var(--line)] flex justify-between items-center z-10">
             <h3>Register New Mineral Project</h3>
             <button className="text-[var(--muted)] hover:text-white" onClick={() => setIsRegisterOpen(false)}>✕</button>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g. Breman Asikuma Project A"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Country</label>
                <select 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                  value={newProject.country}
                  onChange={e => setNewProject({...newProject, country: e.target.value})}
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newProject.email}
                    onChange={e => setNewProject({...newProject, email: e.target.value})}
                    placeholder="e.g. contact@miningco.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newProject.phone}
                    onChange={e => setNewProject({...newProject, phone: e.target.value})}
                    placeholder="e.g. +233 20 123 4567"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--muted)] mb-1">Mineral Type</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                  value={newProject.mineralType}
                  onChange={e => setNewProject({...newProject, mineralType: e.target.value})}
                  placeholder="e.g. Gold, Lithium"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-[var(--muted2)] uppercase tracking-wider">Proof Pack Checklist</h4>
                <div className="text-xs text-[var(--gold)] font-bold">
                  {Object.values(newProject.proofPack).filter(v => v === true).length} / 7 Uploaded
                </div>
              </div>
              
              <div className="grid gap-3">
                {[
                  { key: 'miningLicense', label: 'Mining License' },
                  { key: 'govAuthorization', label: 'Gov Authorization' },
                  { key: 'envApprovals', label: 'Env Approvals' },
                  { key: 'operatingEntityDoc', label: 'Operating Entity Doc' },
                  { key: 'complianceAttestations', label: 'Compliance Attestations' },
                  { key: 'partnerMOUs', label: 'Partner MOUs' },
                  { key: 'optionalAudits', label: 'Optional Audits' }
                ].map(item => {
                  const isUploaded = (newProject.proofPack as any)[item.key];
                  return (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded border transition-colors ${
                      isUploaded ? "bg-green-900/10 border-green-500/30" : "bg-[var(--bg)] border-[var(--line)]"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isUploaded ? "bg-green-500/20 text-green-500" : "bg-[var(--panel)] text-[var(--muted)]"
                        }`}>
                          {isUploaded ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{item.label}</div>
                          <div className="text-xs text-[var(--muted)]">Required document</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <input 
                           type="file" 
                           id={`file-${item.key}`} 
                           className="hidden" 
                           accept="image/*,.pdf"
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if(!file) return;

                             // Strict file type validation
                             if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                                alert("Only PDF and Image files are allowed.");
                                e.target.value = ''; // Reset input
                                return;
                             }

                             // File size validation (5MB limit)
                             if (file.size > 5 * 1024 * 1024) {
                                alert("File size exceeds 5MB limit.");
                                e.target.value = ''; // Reset input
                                return;
                             }

                             // Read file as Data URL
                             const reader = new FileReader();
                             reader.onload = (event) => {
                               const result = event.target?.result as string;
                               setNewProject(prev => ({
                                 ...prev, 
                                 proofPack: { 
                                   ...prev.proofPack!, 
                                   [item.key]: true,
                                   fileData: {
                                      ...prev.proofPack?.fileData,
                                      [item.key]: result
                                   },
                                   fileMetadata: {
                                      ...prev.proofPack?.fileMetadata,
                                      [item.key]: { name: file.name, type: file.type }
                                   }
                                 }
                               }));
                             };
                             reader.readAsDataURL(file);
                           }}
                         />
                         <label 
                           htmlFor={`file-${item.key}`}
                           className={`btn text-xs px-3 py-1 cursor-pointer ${isUploaded ? "secondary" : "goldGlass"}`}
                         >
                           {isUploaded ? "Replace File" : "Upload File"}
                         </label>
                         {isUploaded && (
                           <button 
                             onClick={() => setNewProject({
                               ...newProject, 
                               proofPack: { ...newProject.proofPack, [item.key]: false }
                             })}
                             className="text-[var(--muted)] hover:text-white"
                             title="Remove"
                           >
                             ✕
                           </button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn primary px-8" onClick={handleSubmit}>Submit Project</button>
              <button className="btn secondary" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
            </div>
          </div>
        </dialog>
      )}
      {isRegisterOpen && <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 99}} onClick={() => setIsRegisterOpen(false)}></div>}

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

      {/* LEGAL MODAL */}
      {isLegalOpen && (
        <dialog open className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-2xl p-0 text-white backdrop:bg-black/50">
          <div className="modalHead">
            <h4>Legal Disclaimer</h4>
            <button className="close" onClick={() => setIsLegalOpen(false)}>✕</button>
          </div>
          <div className="modalBody">
            <p>
              <b>Not an Offer of Securities:</b> PAMTR™ is a verification and registry system. Nothing on this site constitutes an offer to sell or a solicitation of an offer to buy securities, commodities, or other financial instruments.
            </p>
            <p>
              <b>No Guarantee of Value:</b> Verification confirms origin, custody, and audit status. It does not guarantee future market value or investment performance.
            </p>
            <p>
              <b>Regulatory Compliance:</b> Users are responsible for ensuring their participation complies with local laws in their jurisdiction.
            </p>
          </div>
        </dialog>
      )}
      {isLegalOpen && <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 99}} onClick={() => setIsLegalOpen(false)}></div>}
    </>
  );
}
