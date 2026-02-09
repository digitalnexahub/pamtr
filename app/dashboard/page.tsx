'use client';

import { useState, useEffect, useRef } from 'react';
import { Project, User, ProofPack, SealLevel, AuditLog, Country, Policy, Announcement, Receipt, PaymentMethod, PaymentTransaction, PaymentStats, ApiConfig } from '@/lib/types';
import { usePAMTR } from '@/lib/context';
import { 
  LayoutDashboard, FileText, Globe, CheckSquare, BadgeCheck, Receipt as ReceiptIcon, 
  ShieldAlert, Users, History, FileWarning, Megaphone, Plus, Search, Filter, Download, X, Check, AlertTriangle, Info, LogOut,
  Lock, RefreshCw, Key, Edit, Trash2, Eye, Copy, Bot, Sparkles, FileCheck, BrainCircuit, ArrowRight, CreditCard, CheckCircle, Clock, Loader2, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={clsx(
      "fixed bottom-4 right-4 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-bottom-4 z-50",
      type === 'success' ? "bg-green-900/90 border-green-500/50 text-white" :
      type === 'error' ? "bg-red-900/90 border-red-500/50 text-white" :
      "bg-[var(--panel)] border-[var(--line)] text-white"
    )}>
      {type === 'success' && <Check className="w-5 h-5 text-green-400" />}
      {type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
      {type === 'info' && <Info className="w-5 h-5 text-[var(--gold)]" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/10 p-1 rounded"><X className="w-4 h-4" /></button>
    </div>
  );
};

export default function Dashboard() {
  const { 
    currentUser, setCurrentUser,
    projects: rawProjects, setProjects, addProject, updateProject,
    users, setUsers,
    auditLogs, setAuditLogs, addAuditLog,
    countries, setCountries, addCountry, updateCountry, deleteCountry,
    policies, setPolicies,
    announcements, setAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    logout,
    isInitialized
  } = usePAMTR();
  
  // Filter projects based on visibility rules (Audit requirement)
  // Projects pending review are hidden from everyone except the Auditor (audit@acrels.org) and the Submitter
  const projects = rawProjects.filter(p => {
    const isPendingReview = p.status === 'Submitted' || p.status === 'Under Verification';
    if (isPendingReview) {
      if (currentUser.email === 'audit@acrels.org') return true;
      if (currentUser.id === p.submitterId) return true;
      return false; 
    }
    return true;
  });
  
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (currentUser.role === 'public') {
        router.push('/login');
      } else if (!currentUser.isVerified && currentUser.role !== 'admin') { // Admin is always verified implicitly or explicitly
         // Optional: Redirect to a verification pending page or show a toast and redirect home
         showToast("Access denied. Verified account required.", "error");
         router.push('/'); 
      }
    }
  }, [currentUser, router, isInitialized]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [verifierFilterStatus, setVerifierFilterStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [isAddingReceipt, setIsAddingReceipt] = useState(false);
  const [isIssuingSeal, setIsIssuingSeal] = useState(false);
  const [newSealData, setNewSealData] = useState<{projectId: string, level: SealLevel}>({
    projectId: '', level: 'Verified Intake'
  });
  const [isRevoking, setIsRevoking] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [projectToRevoke, setProjectToRevoke] = useState<Project | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newProject, setNewProject] = useState<Partial<Project>>({
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
      completionPercentage: 0
    }
  });

  const [newReceipt, setNewReceipt] = useState<{projectId: string, amount: string, rail: 'USDC' | 'ACRELS Coin' | 'Card'}>({
    projectId: '', amount: '', rail: 'USDC'
  });
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt & { projectName?: string } | null>(null);
  
  // AI Compliance State
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Record<string, { 
    status: 'Compliant' | 'Non-Compliant' | 'Pending',
    score: number, 
    issues: string[],
    suggestions: string[],
    lastChecked: string 
  }>>({});
  const [pendingEURule, setPendingEURule] = useState(true);

  const [newCountry, setNewCountry] = useState<Partial<Country>>({
    code: '', name: '', status: 'Active', nodeOperator: '', projectCount: 0
  });
  const [editingCountryCode, setEditingCountryCode] = useState<string | null>(null);

  const [newPolicy, setNewPolicy] = useState<Partial<Policy>>({
    title: '', content: '', status: 'Draft'
  });
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '', message: '', type: 'Info', startDate: '', endDate: '', status: 'Active'
  });
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  const [complianceRules, setComplianceRules] = useState<string[]>([
    'Mining License Validation', 
    'Environmental Impact Assessment', 
    'Beneficial Ownership Disclosure', 
    'Local Content Regulations'
  ]);
  const [newComplianceRule, setNewComplianceRule] = useState('');
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);

  // Submission Review State
  const [isReviewingSubmission, setIsReviewingSubmission] = useState(false);
  const [submissionToReview, setSubmissionToReview] = useState<Project | null>(null);
  const [currentReviewFileIndex, setCurrentReviewFileIndex] = useState(0);
  const [reviewedFileKeys, setReviewedFileKeys] = useState<string[]>([]);
  const [rejectedFileKeys, setRejectedFileKeys] = useState<string[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Payment Gateway State
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    successfulTransactions: 0,
    successRate: 0,
    pendingSettlements: 0,
    pendingCount: 0
  });



  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'pm_card', name: 'Credit/Debit Card', type: 'Card', status: 'Active', fee: '2.5%' },
    { id: 'pm_usdc', name: 'USDC (Crypto)', type: 'Crypto', status: 'Active', fee: '1.0%' },
    { id: 'pm_acrels', name: 'ACRELS Coin', type: 'Crypto', status: 'Active', fee: '0.5%' },
    { id: 'pm_bank', name: 'Bank Transfer', type: 'Bank', status: 'Active', fee: '1.5%' },
  ]);

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    merchantId: 'PAMTR_MERC_882910',
    publicKey: 'pk_live_51J2xxxxxxxxxxxxxxxxxxxx',
    secretKey: 'sk_live_xxxxxxxxxxxxxxxxxxxx'
  });
  
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([
    { id: 'TXN-88293', customer: 'Global Mining Corp', method: 'USDC', amount: 25000.00, currency: 'USD', status: 'Completed', date: '2024-10-24' },
    { id: 'TXN-88294', customer: 'Nexus Minerals', method: 'Bank Transfer', amount: 120000.00, currency: 'USD', status: 'Pending', date: '2024-10-24' },
    { id: 'TXN-88295', customer: 'Sierra Gold Ltd', method: 'ACRELS Coin', amount: 5000.00, currency: 'USD', status: 'Completed', date: '2024-10-23' },
    { id: 'TXN-88296', customer: 'AfriResources', method: 'Card', amount: 1250.00, currency: 'USD', status: 'Failed', date: '2024-10-23' },
    { id: 'TXN-88297', customer: 'Global Mining Corp', method: 'USDC', amount: 75000.00, currency: 'USD', status: 'Completed', date: '2024-10-22' },
  ]);

  useEffect(() => {
    const completedTxns = paymentTransactions.filter(txn => txn.status === 'Completed');
    const pendingTxns = paymentTransactions.filter(txn => txn.status === 'Pending');
    
    const totalRevenue = completedTxns.reduce((acc, txn) => acc + txn.amount, 0);
    const pendingSettlements = pendingTxns.reduce((acc, txn) => acc + txn.amount, 0);
    
    const successfulTransactions = completedTxns.length;
    const totalTransactions = paymentTransactions.length;
    const successRate = totalTransactions > 0 ? parseFloat(((successfulTransactions / totalTransactions) * 100).toFixed(1)) : 0;

    setPaymentStats({
        totalRevenue,
        revenueGrowth: 12.5, // Placeholder as we don't have historical data
        successfulTransactions,
        successRate,
        pendingSettlements,
        pendingCount: pendingTxns.length
    });
  }, [paymentTransactions]);

  // Derived State for Review Modal (Shared)
  const reviewFiles = submissionToReview ? Object.entries(submissionToReview.proofPack).filter(([key, value]) => key !== 'completionPercentage' && value === true) : [];
  const currentFileEntry = reviewFiles[currentReviewFileIndex];

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(methods => methods.map(m => 
      m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
    ));
    showToast("Payment method status updated.", 'info');
    addAuditLog('Update Payment Method', `Toggled payment method ${id}`);
  };

  const handleToggleAnnouncementStatus = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      const updatedAnn: Announcement = { ...ann, status: ann.status === 'Active' ? 'Inactive' : 'Active' };
      updateAnnouncement(updatedAnn);
      showToast(`Announcement "${ann.title}" is now ${updatedAnn.status}`, 'info');
      addAuditLog('Update Announcement', `Toggled announcement status: ${ann.title} to ${updatedAnn.status}`);
    }
  };

  const handleRegenerateKeys = () => {
    if (confirm("Are you sure? This will invalidate existing keys immediately.")) {
      setApiConfig({
        ...apiConfig,
        publicKey: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
        secretKey: `sk_live_${Math.random().toString(36).substring(2, 15)}`
      });
      showToast("API Keys regenerated successfully.", 'success');
      addAuditLog('Regenerate API Keys', 'Regenerated merchant API keys');
    }
  };

  const handleSyncTransactions = () => {
    showToast("Syncing transactions with blockchain...", 'info');
    setTimeout(() => {
        // Simulate new transaction
        const newTxn: PaymentTransaction = {
            id: `TXN-${Math.floor(Math.random() * 100000)}`,
            customer: 'New Customer Ltd',
            method: 'USDC',
            amount: Math.floor(Math.random() * 50000),
            currency: 'USD',
            status: 'Completed',
            date: new Date().toISOString().split('T')[0]
        };
        setPaymentTransactions(prev => [newTxn, ...prev]);
        showToast("Transactions synced successfully.", 'success');
    }, 2000);
  };
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Copied to clipboard", 'info');
  };

  const calculateCompletion = (pack: ProofPack) => {
    const required = [
      pack.miningLicense,
      pack.govAuthorization,
      pack.envApprovals,
      pack.operatingEntityDoc,
      pack.complianceAttestations,
      pack.partnerMOUs,
      pack.optionalAudits
    ];
    const filled = required.filter(Boolean).length;
    return Math.round((filled / required.length) * 100);
  };

  const handleSaveProject = () => {
    const uploadCompletion = calculateCompletion(newProject.proofPack as ProofPack);
    
    if (selectedProject) {
      // Determine new status
      let newStatus = selectedProject.status;
      if (selectedProject.status === 'Draft' && uploadCompletion === 100) {
        newStatus = 'Submitted';
      }

      // Determine stored completion percentage (Verification Score vs Upload Score)
      let storedCompletion = uploadCompletion;
      if (newStatus === 'Submitted' || newStatus === 'Under Verification' || newStatus === 'Verified' || newStatus === 'Live') {
        // If just submitting now (Draft -> Submitted), set to 0 (Verification Score).
        // If already submitted, keep existing Verification Score.
        if (selectedProject.status === 'Draft' && newStatus === 'Submitted') {
          storedCompletion = 0;
        } else {
          storedCompletion = selectedProject.proofPack.completionPercentage;
        }
      }

      const updated: Project = {
        ...selectedProject,
        name: newProject.name!,
        country: newProject.country!,
        mineralType: newProject.mineralType!,
        email: newProject.email,
        phone: newProject.phone,
        status: newStatus,
        proofPack: { ...(newProject.proofPack as ProofPack), completionPercentage: storedCompletion },
        updatedAt: new Date().toISOString(),
      };
      updateProject(updated);
      showToast(`Project "${updated.name}" updated!`, 'success');
      addAuditLog('Update Project', `Updated project ${updated.name}`);
    } else {
      const status = uploadCompletion === 100 ? 'Submitted' : 'Draft';
      const storedCompletion = status === 'Submitted' ? 0 : uploadCompletion;

      const project: Project = {
        id: `PAM-${Date.now()}`,
        name: newProject.name!,
        country: newProject.country!,
        mineralType: newProject.mineralType!,
        email: newProject.email,
        phone: newProject.phone,
        status: status,
        submitterId: currentUser.id,
        proofPack: { ...(newProject.proofPack as ProofPack), completionPercentage: storedCompletion },
        receipts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProject(project);
      
      if (status === 'Submitted') {
        showToast(`Project submitted! Confirmation sent to ${newProject.email}`, 'success');
      } else {
        showToast(`Project "${project.name}" saved as Draft!`, 'success');
      }
      
      addAuditLog('Create Project', `Created project ${project.name} with status ${project.status}`);
    }
    
    setIsCreating(false);
    setSelectedProject(null);
    setNewProject({
      name: '', country: '', mineralType: '', email: '', phone: '',
      proofPack: { miningLicense: false, govAuthorization: false, envApprovals: false, operatingEntityDoc: false, complianceAttestations: false, partnerMOUs: false, optionalAudits: false, completionPercentage: 0 }
    });
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setNewProject({
      name: project.name,
      country: project.country,
      mineralType: project.mineralType,
      proofPack: project.proofPack
    });
    setIsCreating(true);
  };

  const handleRevokeSeal = (project: Project) => {
    setProjectToRevoke(project);
    setIsRevoking(true);
    setRevocationReason('');
  };

  const confirmRevokeSeal = () => {
    if (!revocationReason) {
      showToast("Please provide a reason for revocation.", 'error');
      return;
    }
    if (!projectToRevoke || !projectToRevoke.seal) return;

    const updatedProject: Project = {
      ...projectToRevoke,
      status: 'Revoked',
      seal: {
        ...projectToRevoke.seal,
        revocationHistory: [
          ...projectToRevoke.seal.revocationHistory,
          `Revoked on ${new Date().toISOString()} by ${currentUser.name}. Reason: ${revocationReason}`
        ]
      },
      updatedAt: new Date().toISOString()
    };

    updateProject(updatedProject);
    showToast(`Seal revoked for "${projectToRevoke.name}"`, 'error');
    addAuditLog('Revoke Seal', `Revoked seal for ${projectToRevoke.name}. Reason: ${revocationReason}`);
    
    setIsRevoking(false);
    setProjectToRevoke(null);
    setRevocationReason('');
  };

  const handlePickup = (project: Project) => {
    setSubmissionToReview(project);
    setIsReviewingSubmission(true);
    setCurrentReviewFileIndex(0);
    setReviewedFileKeys([]);
    setRejectedFileKeys([]);
  };

  const handleAcceptFile = (key: string) => {
    if (!reviewedFileKeys.includes(key)) {
      setReviewedFileKeys([...reviewedFileKeys, key]);
      if (rejectedFileKeys.includes(key)) {
        setRejectedFileKeys(rejectedFileKeys.filter(k => k !== key));
      }
      showToast("File accepted", 'success');
      
      // Auto-advance to next file
      if (currentReviewFileIndex < reviewFiles.length - 1) {
        setCurrentReviewFileIndex(currentReviewFileIndex + 1);
      }
    }
  };

  const handleRejectFile = (key: string) => {
    if (!rejectedFileKeys.includes(key)) {
      setRejectedFileKeys([...rejectedFileKeys, key]);
      if (reviewedFileKeys.includes(key)) {
        setReviewedFileKeys(reviewedFileKeys.filter(k => k !== key));
      }
      showToast(`File rejected. Submitter notified to re-upload.`, 'error');
      
      // Auto-advance to next file
      if (currentReviewFileIndex < reviewFiles.length - 1) {
        setCurrentReviewFileIndex(currentReviewFileIndex + 1);
      }
    }
  };

  const handleCompleteReview = () => {
    if (!submissionToReview) return;
    
    // Calculate completion based on accepted files (reviewedFileKeys)
    // Using 7 required documents
    const updatedCompletion = Math.round((reviewedFileKeys.length / 7) * 100);

    const updatedProject: Project = {
      ...submissionToReview,
      status: 'Under Verification',
      proofPack: {
        ...submissionToReview.proofPack,
        verifiedDocuments: reviewedFileKeys,
        completionPercentage: updatedCompletion
      },
      updatedAt: new Date().toISOString()
    };
    updateProject(updatedProject);
    showToast(`Review completed. Verification started for "${submissionToReview.name}"`, 'success');
    
    addAuditLog('Start Verification', `Completed file review and started verification for ${submissionToReview.name}`);
    setIsReviewingSubmission(false);
    setSubmissionToReview(null);
  };

  const handleDownloadFile = (fileName: string) => {
    const key = fileName;
    setDownloadingFile(key);
    
    const project = submissionToReview || selectedProject;
    const metadata = project?.proofPack?.fileMetadata?.[key];
    const realName = metadata?.name || `${key}.pdf`;
    const mimeType = metadata?.type || 'application/pdf';

    showToast(`Downloading ${realName}...`, 'info');
    
    // Create dummy content for the download
    const projectName = project?.name || "Project";
    const content = `This is a placeholder document for ${key}.\n\nProject: ${projectName}\nFile: ${realName}\nType: ${mimeType}\n\nVerified by PAMTR System.`;
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = realName; 
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download complete.", 'success');
    setDownloadingFile(null);
  };

  const handleIssueSeal = (project: Project, level: SealLevel) => {
    if (project.proofPack.completionPercentage < 100) {
      showToast("Cannot issue seal: Proof Pack incomplete.", 'error');
      return;
    }

    const updatedProject: Project = {
      ...project,
      status: 'Verified', // Seal issued -> Verified (Ready for Publish)
      seal: {
        level,
        issuer: currentUser.id,
        date: new Date().toISOString(),
        revocationHistory: []
      },
      updatedAt: new Date().toISOString()
    };

    updateProject(updatedProject);
    showToast(`Seal "${level}" issued to "${project.name}"`, 'success');

    addAuditLog('Issue Seal', `Issued ${level} to ${project.name}`);
  };

  const handlePublish = (project: Project) => {
    if (!project.seal) {
      showToast("Cannot publish: No seal issued.", 'error');
      return;
    }

    const updatedProject: Project = {
      ...project,
      status: 'Live',
      updatedAt: new Date().toISOString()
    };

    updateProject(updatedProject);
    showToast(`Project "${project.name}" is now LIVE!`, 'success');

    addAuditLog('Publish Project', `Published ${project.name} to public registry`);
  };

  const handleAddPolicy = () => {
    if (editingPolicyId) {
      // Update existing policy
      const updatedPolicy: Policy = {
        id: editingPolicyId,
        title: newPolicy.title!,
        content: newPolicy.content!,
        status: newPolicy.status as any || 'Draft',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPolicies(policies.map(p => p.id === editingPolicyId ? updatedPolicy : p));
      setEditingPolicyId(null);
      showToast("Policy updated.", 'success');
      addAuditLog('Update Policy', `Updated policy: ${updatedPolicy.title}`);
    } else {
      // Create new policy
      const policy: Policy = {
        id: `pol-${Date.now()}`,
        title: newPolicy.title!,
        content: newPolicy.content!,
        status: newPolicy.status as any || 'Draft',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPolicies([policy, ...policies]);
      showToast("Policy added.", 'success');
      addAuditLog('Create Policy', `Created policy: ${policy.title}`);
    }
    
    setIsAddingPolicy(false);
    setNewPolicy({ title: '', content: '', status: 'Draft' });
  };

  const handleEditPolicy = (policy: Policy) => {
    setNewPolicy({
      title: policy.title,
      content: policy.content,
      status: policy.status
    });
    setEditingPolicyId(policy.id);
    setIsAddingPolicy(true);
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== id));
      showToast("Policy deleted.", 'error');
      addAuditLog('Delete Policy', `Deleted policy ID: ${id}`);
    }
  };

  const handleAddAnnouncement = () => {
    if (editingAnnouncementId) {
        // Handle Update
        const updatedAnnouncement: Announcement = {
            id: editingAnnouncementId,
            title: newAnnouncement.title!,
            message: newAnnouncement.message!,
            type: newAnnouncement.type as any || 'Info',
            date: new Date().toISOString().split('T')[0],
            startDate: newAnnouncement.startDate,
            endDate: newAnnouncement.endDate,
            status: newAnnouncement.status as any || 'Active'
        };
        updateAnnouncement(updatedAnnouncement);
        setEditingAnnouncementId(null);
        showToast("Announcement updated.", 'success');
        addAuditLog('Update Announcement', `Updated announcement: ${updatedAnnouncement.title}`);
    } else {
        // Handle Create
        const announcement: Announcement = {
            id: `ann-${Date.now()}`,
            title: newAnnouncement.title!,
            message: newAnnouncement.message!,
            type: newAnnouncement.type as any || 'Info',
            date: new Date().toISOString().split('T')[0],
            startDate: newAnnouncement.startDate,
            endDate: newAnnouncement.endDate,
            status: newAnnouncement.status as any || 'Active'
        };
        setAnnouncements([announcement, ...announcements]);
        showToast("Announcement published.", 'success');
        addAuditLog('Publish Announcement', `Published announcement: ${announcement.title}`);
    }
    
    setIsAddingAnnouncement(false);
    setNewAnnouncement({ title: '', message: '', type: 'Info', startDate: '', endDate: '', status: 'Active' });
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setNewAnnouncement({
      title: ann.title,
      message: ann.message,
      type: ann.type,
      startDate: ann.startDate || '',
      endDate: ann.endDate || '',
      status: ann.status
    });
    setEditingAnnouncementId(ann.id);
    setIsAddingAnnouncement(true);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
      showToast("Announcement deleted.", 'error');
      addAuditLog('Delete Announcement', `Deleted announcement ID: ${id}`);
    }
  };

  const handleAddComplianceRule = () => {
    if (!newComplianceRule) return;
    
    if (editingRuleIndex !== null) {
      // Update existing
      const updatedRules = [...complianceRules];
      updatedRules[editingRuleIndex] = newComplianceRule;
      setComplianceRules(updatedRules);
      setEditingRuleIndex(null);
      showToast("Compliance rule updated.", 'success');
      addAuditLog('Update Compliance', `Updated rule to: ${newComplianceRule}`);
    } else {
      // Add new
      setComplianceRules([...complianceRules, newComplianceRule]);
      showToast("New compliance rule added.", 'success');
      addAuditLog('Update Compliance', `Added compliance rule: ${newComplianceRule}`);
    }
    setNewComplianceRule('');
    setIsAddingRule(false);
  };

  const handleEditComplianceRule = (index: number) => {
    setNewComplianceRule(complianceRules[index]);
    setEditingRuleIndex(index);
  };

  const handleDeleteComplianceRule = (index: number) => {
    if (confirm("Are you sure you want to remove this compliance rule?")) {
      const rule = complianceRules[index];
      const updatedRules = complianceRules.filter((_, i) => i !== index);
      setComplianceRules(updatedRules);
      showToast("Compliance rule removed.", 'error');
      addAuditLog('Update Compliance', `Removed compliance rule: ${rule}`);
      
      // If we were editing this rule, cancel edit
      if (editingRuleIndex === index) {
        setEditingRuleIndex(null);
        setNewComplianceRule('');
      }
    }
  };

  const handleAddCountry = () => {
    const country: Country = {
      code: newCountry.code!,
      name: newCountry.name!,
      status: newCountry.status as any || 'Active',
      nodeOperator: newCountry.nodeOperator!,
      projectCount: editingCountryCode ? newCountry.projectCount || 0 : 0
    };

    if (editingCountryCode) {
      updateCountry(country);
      showToast(`Country "${country.name}" updated.`, 'success');
      addAuditLog('Update Country', `Updated country: ${country.name} (${country.code})`);
      setEditingCountryCode(null);
    } else {
      addCountry(country);
      showToast(`Country "${country.name}" added.`, 'success');
      addAuditLog('Add Country', `Added country: ${country.name} (${country.code})`);
    }

    setIsAddingCountry(false);
    setNewCountry({ code: '', name: '', status: 'Active', nodeOperator: '', projectCount: 0 });
  };

  const handleEditCountry = (country: Country) => {
    setNewCountry(country);
    setEditingCountryCode(country.code);
    setIsAddingCountry(true);
  };

  const handleDeleteCountry = (code: string) => {
    if (confirm('Are you sure you want to delete this country?')) {
      deleteCountry(code);
      showToast(`Country deleted.`, 'success');
      addAuditLog('Delete Country', `Deleted country: ${code}`);
    }
  };

  const handleToggleCountryStatus = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (!country) return;
    
    const updatedCountry: Country = { 
      ...country, 
      status: country.status === 'Active' ? 'Inactive' : 'Active' 
    };
    
    updateCountry(updatedCountry);
    showToast(`Country "${updatedCountry.name}" is now ${updatedCountry.status}.`, 'info');
    addAuditLog('Update Country Status', `Updated country ${code} status to ${updatedCountry.status}`);
  };

  const handleExportAuditLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Timestamp,User,Action,Details"].join(",") + "\n"
      + auditLogs.map(log => `${log.timestamp},${log.userId},${log.action},${log.details}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddReceipt = () => {
    if (!newReceipt.projectId || !newReceipt.amount) {
      showToast("Please select project and enter amount.", 'error');
      return;
    }
    const project = projects.find(p => p.id === newReceipt.projectId);
    if (!project) return;

    if (editingReceipt) {
      // Update existing receipt
      const updatedReceipt: Receipt = {
        ...editingReceipt,
        projectId: newReceipt.projectId,
        amount: parseFloat(newReceipt.amount),
        rail: newReceipt.rail,
        // Keep original timestamp and id
      };

      // If project changed, we need to remove from old project and add to new (complex), 
      // but for simplicity assuming project change might need more logic or just restricted.
      // If user changes project, we need to find the OLD project and remove it.
      // Let's assume user CAN change project.
      
      // 1. Remove from original project (which might be different from current selected project)
      // We need to find the project that contains the editingReceipt.id
      const originalProject = projects.find(p => p.receipts.some(r => r.id === editingReceipt.id));
      
      if (originalProject) {
         if (originalProject.id === project.id) {
           // Same project update
           const updatedReceipts = project.receipts.map(r => r.id === editingReceipt.id ? updatedReceipt : r);
           updateProject({ ...project, receipts: updatedReceipts });
         } else {
           // Moved to different project
           // Remove from old
           const oldProjectReceipts = originalProject.receipts.filter(r => r.id !== editingReceipt.id);
           updateProject({ ...originalProject, receipts: oldProjectReceipts });
           
           // Add to new
           updateProject({ ...project, receipts: [updatedReceipt, ...project.receipts] });
         }
      }
      
      showToast(`Receipt updated.`, 'success');
      addAuditLog('Update Receipt', `Updated receipt ${editingReceipt.id}`);
      setEditingReceipt(null);
    } else {
      // Create new
      const receipt: Receipt = {
        id: `RCPT-${Date.now()}`,
        projectId: project.id,
        amount: parseFloat(newReceipt.amount),
        rail: newReceipt.rail,
        timestamp: new Date().toISOString(),
        hash: `0x${Math.random().toString(16).slice(2)}...`
      };

      const updatedProject = {
        ...project,
        receipts: [receipt, ...project.receipts]
      };

      updateProject(updatedProject);
      showToast(`Receipt generated for ${project.name}`, 'success');
      addAuditLog('Generate Receipt', `Generated receipt ${receipt.id} for ${project.name}`);
    }

    setIsAddingReceipt(false);
    setNewReceipt({ projectId: '', amount: '', rail: 'USDC' });
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setNewReceipt({
      projectId: receipt.projectId,
      amount: receipt.amount.toString(),
      rail: receipt.rail
    });
    setIsAddingReceipt(true);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;

    const project = projects.find(p => p.receipts.some(r => r.id === receiptId));
    if (!project) return;

    const updatedReceipts = project.receipts.filter(r => r.id !== receiptId);
    updateProject({ ...project, receipts: updatedReceipts });
    
    showToast("Receipt deleted.", 'error');
    addAuditLog('Delete Receipt', `Deleted receipt ${receiptId}`);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    showToast("Hash copied to clipboard!", 'success');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    showToast(`User ${editingUser.name} updated.`, 'success');
    
    addAuditLog('Update User', `Updated user details for ${editingUser.name}`);
  };

  const handleManualIssueSeal = () => {
    if (!newSealData.projectId) {
      showToast("Please select a project.", 'error');
      return;
    }
    const project = projects.find(p => p.id === newSealData.projectId);
    if (!project) return;

    handleIssueSeal(project, newSealData.level);
    setIsIssuingSeal(false);
    setNewSealData({ projectId: '', level: 'Verified Intake' });
  };

  const handleRunAIComplianceScan = () => {
    setIsRunningAI(true);
    showToast("Initiating AI Compliance Scan...", 'info');

    setTimeout(() => {
      const results: typeof aiAnalysisResults = {};
      let issuesFound = 0;

      projects.forEach(p => {
        const issues: string[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // 1. Mining License Validation
        if (!p.proofPack.miningLicense) {
          issues.push("Missing Mining License");
          suggestions.push("Upload valid Mining License document.");
          score -= 25;
        }

        // 2. Environmental Impact Assessment
        if (!p.proofPack.envApprovals) {
          issues.push("Incomplete Environmental Impact Assessment");
          suggestions.push("Submit full Environmental Impact Assessment report.");
          score -= 20;
        }

        // 3. Beneficial Ownership
        if (!p.proofPack.operatingEntityDoc) { // Using op entity doc as proxy for ownership for now
          issues.push("Beneficial Ownership Disclosure missing");
          suggestions.push("Complete Beneficial Ownership form.");
          score -= 15;
        }

        // 4. Local Content (Mock Logic based on country)
        if (p.country === 'GH' && !p.proofPack.complianceAttestations) {
           issues.push("Local Content Regulations check failed");
           suggestions.push("Submit Local Content Plan for Ghana region.");
           score -= 15;
        }

        // 5. New EU Directive (if active)
        if (!pendingEURule && !p.proofPack.optionalAudits) {
           issues.push("EU Supply Chain Due Diligence non-compliant");
           suggestions.push("Upload supply chain audit for EU directive.");
           score -= 10;
        }

        if (issues.length > 0) issuesFound++;

        results[p.id] = {
          status: score === 100 ? 'Compliant' : 'Non-Compliant',
          score,
          issues,
          suggestions,
          lastChecked: new Date().toISOString()
        };
      });

      setAiAnalysisResults(results);
      setIsRunningAI(false);
      
      if (issuesFound > 0) {
        showToast(`AI Scan Complete: ${issuesFound} projects flagged for review.`, 'error');
        addAuditLog('AI Compliance Scan', `Completed scan. ${issuesFound} projects flagged.`);
      } else {
        showToast("AI Scan Complete: All projects compliant.", 'success');
        addAuditLog('AI Compliance Scan', `Completed scan. All projects passed.`);
      }
    }, 2000); // Simulate processing time
  };

  const handleIntegrateEURule = () => {
    setPendingEURule(false);
    setComplianceRules([...complianceRules, "EU Supply Chain Due Diligence Directive"]);
    showToast("EU Directive integrated into active compliance rules.", 'success');
    addAuditLog('Update Compliance', 'Integrated EU Supply Chain Due Diligence Directive');
    
    // Trigger auto-scan
    handleRunAIComplianceScan();
  };

  // Render Helpers
  const renderAdminSidebar = () => (
    <div className={clsx(
      "w-64 bg-[var(--panel)] border-r border-[var(--line)] p-4 flex-col h-[calc(100vh-80px)] overflow-y-auto",
      "md:sticky md:top-20 md:flex",
      isMobileSidebarOpen ? "fixed left-0 top-20 z-40 flex animate-in slide-in-from-left shadow-2xl" : "hidden"
    )}>
      <div className="text-xs font-bold text-[var(--muted2)] uppercase tracking-wider mb-4 px-2">Core Registry</div>
      <nav className="space-y-1 mb-8">
        <NavButton icon={LayoutDashboard} label="Dashboard" id="dashboard" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={FileText} label="Mineral Projects" id="projects" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={Globe} label="Countries" id="countries" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={CheckSquare} label="Submissions" id="submissions" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={BadgeCheck} label="Verification Seals" id="seals" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={ReceiptIcon} label="Receipts" id="receipts" active={activeTab} onClick={setActiveTab} />
      </nav>
      
      <div className="text-xs font-bold text-[var(--muted2)] uppercase tracking-wider mb-4 px-2">Governance</div>
      <nav className="space-y-1 mb-8">
        <NavButton icon={ShieldAlert} label="Compliance" id="compliance" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={Users} label="Users & Roles" id="users" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={History} label="Audit Logs" id="audit" active={activeTab} onClick={setActiveTab} />
      </nav>

      <div className="text-xs font-bold text-[var(--muted2)] uppercase tracking-wider mb-4 px-2">System</div>
      <nav className="space-y-1">
        <NavButton icon={CreditCard} label="Payment Gateway" id="payment-gateway" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={FileWarning} label="Policies" id="policies" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={Megaphone} label="Announcements" id="announcements" active={activeTab} onClick={setActiveTab} />
      </nav>
    </div>
  );

  const renderVerifierSidebar = () => (
    <div className={clsx(
      "w-64 bg-[var(--panel)] border-r border-[var(--line)] p-4 flex-col h-[calc(100vh-80px)] overflow-y-auto",
      "md:sticky md:top-20 md:flex",
      isMobileSidebarOpen ? "fixed left-0 top-20 z-40 flex animate-in slide-in-from-left shadow-2xl" : "hidden"
    )}>
      <div className="text-xs font-bold text-[var(--muted2)] uppercase tracking-wider mb-4 px-2">Verification Portal</div>
      <nav className="space-y-1 mb-8">
        <NavButton icon={LayoutDashboard} label="Dashboard" id="dashboard" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={CheckSquare} label="Submissions" id="submissions" active={activeTab} onClick={(id: any) => { setActiveTab(id); setVerifierFilterStatus(null); }} />
      </nav>
    </div>
  );

  const renderContent = () => {
    switch (currentUser.role) {
      case 'admin':
        return renderAdminContent();
      case 'submitter':
        return renderSubmitterContent();
      case 'verifier':
        return renderVerifierContent();
      default:
        if (!currentUser.isVerified) {
            return (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                    <p className="text-[var(--muted)] max-w-md">
                        Your account is not verified. Dashboard access is restricted to verified users only. 
                        Please contact support or complete your profile verification.
                    </p>
                </div>
            );
        }
        return <div className="p-8 text-center text-[var(--muted)]">Please log in to access the portal.</div>;
    }
  };

  const renderAdminContent = () => {
    // Shared Filter/Search Logic
    const filteredProjects = projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Projects" value={projects.length} onClick={() => setActiveTab('projects')} />
              <StatCard label="Live Projects" value={projects.filter(p => p.status === 'Live').length} onClick={() => { setActiveTab('projects'); setFilterStatus('Live'); }} />
              <StatCard label="Verified Seals" value={projects.filter(p => p.seal).length} onClick={() => setActiveTab('seals')} />
              <StatCard label="Total Receipts" value={projects.reduce((acc, p) => acc + p.receipts.length, 0)} onClick={() => setActiveTab('receipts')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Audit Activity</h3>
                <AuditLogTable logs={auditLogs.slice(0, 5)} />
              </div>
              <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">System Announcements</h3>
                <div className="space-y-3">
                  {announcements.slice(0,3).map(ann => (
                    <div key={ann.id} className={clsx("p-3 rounded border text-sm", 
                      ann.type === 'Alert' ? "bg-red-900/20 border-red-900/50 text-red-400" :
                      ann.type === 'Success' ? "bg-green-900/20 border-green-900/50 text-green-400" :
                      "bg-[var(--panel2)] border-[var(--line)] text-[var(--muted2)]"
                    )}>
                      <div className="font-bold">{ann.title}</div>
                      <div>{ann.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Submissions Section */}
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-white">Pending Project Submissions</h3>
                 <button onClick={() => setActiveTab('submissions')} className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
              
              {projects.filter(p => p.status === 'Submitted').length === 0 ? (
                <div className="text-[var(--muted)] italic text-sm">No pending submissions.</div>
              ) : (
                <div className="space-y-3">
                  {projects.filter(p => p.status === 'Submitted').slice(0, 3).map(project => (
                    <div key={project.id} className="flex justify-between items-center p-3 rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--gold)]/30 transition-colors cursor-pointer" onClick={() => router.push(`/project/${project.id}`)}>
                      <div>
                        <div className="font-bold text-white text-sm">{project.name}</div>
                        <div className="text-xs text-[var(--muted)]">{project.country} • {project.mineralType}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[var(--gold)]">{project.proofPack.completionPercentage}%</div>
                        <div className="text-[10px] text-[var(--muted2)] uppercase">Proof Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--muted)]">
                 <span>Showing {Math.min(3, projects.filter(p => p.status === 'Submitted').length)} of {projects.filter(p => p.status === 'Submitted').length} pending</span>
                 <button onClick={() => setActiveTab('submissions')} className="hover:text-white flex items-center gap-1">
                    Go to Submissions Module <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-white">Mineral Projects</h2>
               <div className="flex gap-2">
                 <div className="relative">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                   <input 
                     type="text" 
                     placeholder="Search projects..." 
                     className="pl-9 pr-4 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-sm text-white w-64 focus:border-[var(--gold)] outline-none"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <select 
                   className="bg-[var(--panel)] border border-[var(--line)] rounded-lg text-sm text-[var(--muted)] px-3 outline-none focus:border-[var(--gold)]"
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                 >
                   <option value="All">All Statuses</option>
                   <option value="Draft">Draft</option>
                   <option value="Submitted">Submitted</option>
                   <option value="Under Verification">Under Verification</option>
                   <option value="Verified">Verified</option>
                   <option value="Live">Live</option>
                 </select>
                 <button className="btn secondary text-sm">Export CSV</button>
               </div>
            </div>
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
               <ProjectTable projects={filteredProjects} />
            </div>
          </div>
        );
      case 'countries':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Participating Countries</h2>
              <button 
                onClick={() => {
                  if (isAddingCountry) {
                    setIsAddingCountry(false);
                    setEditingCountryCode(null);
                    setNewCountry({ code: '', name: '', status: 'Active', nodeOperator: '', projectCount: 0 });
                  } else {
                    setIsAddingCountry(true);
                  }
                }}
                className="btn goldGlass text-sm flex items-center gap-2"
              >
                {isAddingCountry ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isAddingCountry ? 'Cancel' : 'Add Country'}
              </button>
            </div>

            {isAddingCountry && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Add Participating Country</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Country Code (ISO 2)</label>
                    <input 
                        type="text" placeholder="e.g. GH"
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white uppercase font-mono"
                        maxLength={2}
                        value={newCountry.code}
                        onChange={e => setNewCountry({...newCountry, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Country Name</label>
                    <input 
                        type="text" placeholder="e.g. Ghana"
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                        value={newCountry.name}
                        onChange={e => setNewCountry({...newCountry, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Node Operator</label>
                    <input 
                        type="text" placeholder="Agency Name (Optional)"
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                        value={newCountry.nodeOperator}
                        onChange={e => setNewCountry({...newCountry, nodeOperator: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Status</label>
                    <select 
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                        value={newCountry.status}
                        onChange={e => setNewCountry({...newCountry, status: e.target.value as any})}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAddCountry} className="btn primary">Add Country</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {countries.map(country => (
                <div key={country.code} className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl relative group hover:border-[var(--gold)]/50 transition-colors">
                  <div className="absolute top-4 right-4">
                    <span className={clsx("px-2 py-1 rounded text-xs uppercase", country.status === 'Active' ? "bg-green-500/10 text-green-400" : "bg-[var(--bg)] text-[var(--muted)]")}>
                      {country.status}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[var(--muted2)] mb-2">{country.code}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{country.name}</h3>
                  <div className="text-sm text-[var(--muted)] mb-4">{country.nodeOperator}</div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--gold)] font-bold">
                        <FileText className="w-4 h-4" /> {projects.filter(p => p.country === country.name && p.status === 'Live').length} Active Projects
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleEditCountry(country)}
                            className="text-xs text-[var(--gold)] hover:text-white underline"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteCountry(country.code)}
                            className="text-xs text-[var(--bad)] hover:text-white underline"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={() => handleToggleCountryStatus(country.code)}
                            className="text-xs text-[var(--muted)] hover:text-white underline"
                        >
                            {country.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'compliance':
        const projectsUnderCompliance = projects.filter(p => p.status === 'Under Verification' || p.status === 'Submitted');
        
        const handleViewFile = (projectName: string, docName: string) => {
          showToast(`Opening ${docName} for ${projectName}...`, 'info');
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-white">Compliance & Rules</h2>
               <button 
                 onClick={handleRunAIComplianceScan}
                 disabled={isRunningAI}
                 className="btn goldGlass text-sm flex items-center gap-2 disabled:opacity-50"
               >
                 {isRunningAI ? <RefreshCw className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
                 {isRunningAI ? 'Running AI Scan...' : 'Run AI Compliance Audit'}
               </button>
            </div>
            
            {/* Active Reviews Section */}
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden mb-6">
              <div className="p-4 border-b border-[var(--line)] bg-[var(--bg)]/50 flex justify-between items-center">
                 <h3 className="font-bold text-white">Active Compliance Reviews</h3>
                 <span className="text-xs text-[var(--muted)]">{projectsUnderCompliance.length} Projects Pending</span>
              </div>
              
              {projectsUnderCompliance.length === 0 ? (
                <div className="p-8 text-center text-[var(--muted)]">No projects currently under compliance review.</div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {projectsUnderCompliance.map(project => {
                    const aiResult = aiAnalysisResults[project.id];
                    return (
                      <div key={project.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-lg">{project.name}</h4>
                              {aiResult && (
                                <span className={clsx("px-2 py-0.5 rounded text-xs border flex items-center gap-1", 
                                  aiResult.status === 'Compliant' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                  {aiResult.status === 'Compliant' ? <Bot className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                  AI Score: {aiResult.score}/100
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[var(--muted)]">
                              Submitter: {project.submitterId} • Country: {project.country}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx("px-2 py-1 rounded text-xs border uppercase", 
                              project.status === 'Submitted' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]"
                            )}>
                              {project.status}
                            </span>
                          </div>
                        </div>

                        {aiResult && aiResult.issues.length > 0 && (
                          <div className="mb-4 bg-red-900/10 border border-red-900/20 p-3 rounded-lg animate-in fade-in">
                            <div className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                              <Bot className="w-3 h-3" /> AI Detected Issues & Suggestions:
                            </div>
                            <ul className="space-y-1">
                              {aiResult.issues.map((issue, idx) => (
                                <li key={idx} className="text-xs text-red-300 flex items-start gap-2">
                                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span>
                                    <span className="font-semibold">{issue}:</span> {aiResult.suggestions[idx]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(project.proofPack).map(([key, value]) => {
                             if (key === 'completionPercentage') return null;
                             return (
                               <div key={key} className="bg-[var(--bg)] border border-[var(--line)] p-3 rounded flex items-center justify-between">
                                 <div className="flex items-center gap-2 overflow-hidden">
                                   {value ? <FileCheck className="w-4 h-4 text-green-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                                   <span className="text-xs text-[var(--muted)] truncate" title={key.replace(/([A-Z])/g, ' $1')}>{key.replace(/([A-Z])/g, ' $1')}</span>
                                 </div>
                                 {value && (
                                   <button 
                                     onClick={() => handleViewFile(project.name, `doc_${key}.pdf`)}
                                     className="text-[var(--gold)] hover:text-[var(--gold2)] text-xs font-bold hover:underline ml-2 whitespace-nowrap"
                                   >
                                     View File
                                   </button>
                                 )}
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-4">Active Requirements</h3>
                 <ul className="space-y-3">
                   {complianceRules.map((item, i) => (
                     <li key={i} className={clsx("flex items-center justify-between group p-2 rounded", editingRuleIndex === i ? "bg-[var(--gold)]/10 border border-[var(--gold)]/30" : "")}>
                       <div className="flex items-center gap-3 text-[var(--muted)]">
                         <CheckSquare className="w-4 h-4 text-green-500" /> {item}
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditComplianceRule(i)} className="text-[var(--gold)] hover:text-white" title="Edit">
                             <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteComplianceRule(i)} className="text-red-400 hover:text-red-300" title="Delete">
                             <Trash2 className="w-3 h-3" />
                          </button>
                       </div>
                     </li>
                   ))}
                 </ul>
                 <div className="mt-4 pt-4 border-t border-[var(--line)]">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="New Rule..." 
                        className="bg-[var(--bg)] border border-[var(--line)] rounded px-2 py-1 text-sm text-white flex-1"
                        value={newComplianceRule}
                        onChange={(e) => setNewComplianceRule(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComplianceRule(); }}
                      />
                      <button onClick={handleAddComplianceRule} className="btn secondary text-xs">
                        {editingRuleIndex !== null ? 'Update' : 'Add'}
                      </button>
                      {editingRuleIndex !== null && (
                         <button onClick={() => { setEditingRuleIndex(null); setNewComplianceRule(''); }} className="btn ghost text-xs px-2 text-[var(--muted)] hover:text-white"><X className="w-3 h-3"/></button>
                      )}
                    </div>
                 </div>
               </div>
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-4">Pending Review</h3>
                 {pendingEURule ? (
                    <div className="p-4 border border-[var(--gold)]/20 bg-[var(--gold)]/5 rounded text-[var(--gold2)] text-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-bold mb-1 flex items-center gap-2"><Sparkles className="w-3 h-3"/> New Regulation Detected</div>
                          New EU Supply Chain Due Diligence directive integration pending approval.
                        </div>
                        <button 
                          onClick={handleIntegrateEURule}
                          className="btn primary text-xs shrink-0"
                        >
                          Approve & Integrate
                        </button>
                      </div>
                    </div>
                 ) : (
                    <div className="p-8 text-center text-[var(--muted)] italic">
                      No pending regulations. System is up to date.
                    </div>
                 )}
               </div>
            </div>
          </div>
        );
      case 'users':
        return (
           <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Users & Roles</h2>
            
            {editingUser && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Edit User: {editingUser.name}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                      value={editingUser.name}
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Email</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                      value={editingUser.email}
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Role</label>
                    <select 
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                    >
                      <option value="admin">Admin</option>
                      <option value="verifier">Verifier</option>
                      <option value="submitter">Submitter</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Password</label>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                            <input 
                              type="text" 
                              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 pl-9 text-white font-mono"
                              value={editingUser.password || ''}
                              onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                              placeholder="Set password..."
                            />
                        </div>
                        <button 
                            onClick={() => {
                                const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                                const pass = Array(12).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                                setEditingUser({...editingUser, password: pass});
                                showToast("Password generated", "info");
                            }}
                            className="btn secondary p-2 flex items-center justify-center"
                            title="Generate Password"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdateUser} className="btn primary">Save Changes</button>
                  <button onClick={() => setEditingUser(null)} className="btn secondary">Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden p-6">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-[var(--line)] text-[var(--muted)] text-sm">
                     <th className="pb-3 pl-4">User</th>
                     <th className="pb-3">Role</th>
                     <th className="pb-3">Email</th>
                     <th className="pb-3">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {users.map(user => (
                     <tr 
                       key={user.id} 
                       onClick={() => setEditingUser(user)}
                       className="border-b border-[var(--line)] text-[var(--muted2)] cursor-pointer hover:bg-[var(--gold)]/5 transition-colors"
                     >
                       <td className="py-3 font-medium text-white pl-4">{user.name}</td>
                       <td className="py-3"><span className="px-2 py-1 bg-[var(--bg)] border border-[var(--line)] rounded text-xs uppercase">{user.role}</span></td>
                       <td className="py-3 text-sm text-[var(--muted)]">{user.email}</td>
                       <td className="py-3">
                         <button 
                           onClick={() => setEditingUser(user)}
                           className="text-[var(--gold)] text-sm hover:underline"
                         >
                           Edit
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        );
      case 'submissions':
        const filteredSubmissions = projects.filter(p => p.status === 'Submitted');
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Project Submissions</h2>
            
            <div className="grid gap-4">
              {filteredSubmissions.length === 0 ? (
                <div className="text-[var(--muted)] italic">No pending submissions.</div>
              ) : (
                filteredSubmissions.map(project => (
                  <div key={project.id} className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-white">{project.name}</h3>
                      <div className="text-sm text-[var(--muted)]">{project.country} • {project.mineralType}</div>
                      <div className="mt-2 text-[var(--gold)] text-sm font-bold">Verification Score: {project.proofPack.completionPercentage}%</div>
                      <div className="mt-1">
                        <span className={clsx("px-2 py-0.5 rounded text-xs border uppercase",  
                          project.status === 'Submitted' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]"
                        )}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/project/${project.id}`)} className="btn secondary text-sm">View Details</button>
                      <button onClick={() => handlePickup(project)} className="btn primary text-sm">Review Submission</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'seals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Verification Seals Registry</h2>
              <button 
                onClick={() => setIsIssuingSeal(!isIssuingSeal)}
                className="btn goldGlass text-sm flex items-center gap-2"
              >
                {isIssuingSeal ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isIssuingSeal ? 'Cancel' : 'Issue Seal'}
              </button>
            </div>

            {isIssuingSeal && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Issue Verification Seal</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Select Project</label>
                    <select 
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                      value={newSealData.projectId}
                      onChange={e => setNewSealData({...newSealData, projectId: e.target.value})}
                    >
                      <option value="">-- Choose Project --</option>
                      {projects
                        .filter(p => !p.seal && (p.status === 'Submitted' || p.status === 'Under Verification' || p.status === 'Verified'))
                        .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.proofPack.completionPercentage}%)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-1 block">Seal Level</label>
                    <select 
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                      value={newSealData.level}
                      onChange={e => setNewSealData({...newSealData, level: e.target.value as SealLevel})}
                    >
                      <option value="Verified Intake">Verified Intake</option>
                      <option value="Implementation-Ready">Implementation-Ready</option>
                      <option value="Audit-Complete">Audit-Complete</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleManualIssueSeal} className="btn primary w-full">Issue Seal</button>
              </div>
            )}



            <div className="grid gap-4">
              {projects.filter(p => p.seal).map(project => (
                <div key={project.id} className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{project.name}</h3>
                        <span className="px-2 py-0.5 rounded text-xs border bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)] uppercase">{project.seal?.level}</span>
                      </div>
                      <div className="text-sm text-[var(--muted)]">Issued: {project.seal?.date} • By: {project.seal?.issuer}</div>
                    </div>
                    <button onClick={() => handleRevokeSeal(project)} className="text-red-400 text-sm hover:underline">Revoke Seal</button>
                  </div>
                  {project.seal?.revocationHistory.length! > 0 && (
                    <div className="mt-4 p-3 bg-red-900/10 border border-red-900/30 rounded text-xs text-red-300">
                      <div className="font-bold mb-1">Revocation History:</div>
                      {project.seal?.revocationHistory.map((h, i) => <div key={i}>{h}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'receipts':
        const totalReceiptValue = projects.reduce((acc, p) => acc + p.receipts.reduce((sum, r) => sum + r.amount, 0), 0);
        const totalReceiptCount = projects.reduce((acc, p) => acc + p.receipts.length, 0);

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Receipt Ledger</h2>
              <button onClick={() => setIsAddingReceipt(!isAddingReceipt)} className="btn goldGlass text-sm flex items-center gap-2">
                {isAddingReceipt ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isAddingReceipt ? 'Cancel' : 'Mint Receipt'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Total Value Minted</h3>
                 <div className="text-3xl font-bold text-[var(--gold)] font-mono">${totalReceiptValue.toLocaleString()}</div>
               </div>
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Total Receipts</h3>
                 <div className="text-3xl font-bold text-white font-mono">{totalReceiptCount}</div>
               </div>
            </div>

            {isAddingReceipt && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl mb-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-white mb-4">{editingReceipt ? 'Edit Receipt' : 'Mint New Receipt'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select 
                    className="bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newReceipt.projectId}
                    onChange={e => setNewReceipt({...newReceipt, projectId: e.target.value})}
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input 
                    type="number" placeholder="Amount"
                    className="bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newReceipt.amount}
                    onChange={e => setNewReceipt({...newReceipt, amount: e.target.value})}
                  />
                  <select 
                    className="bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newReceipt.rail}
                    onChange={e => setNewReceipt({...newReceipt, rail: e.target.value as any})}
                  >
                    <option value="USDC">USDC</option>
                    <option value="ACRELS Coin">ACRELS Coin</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <button onClick={handleAddReceipt} className="btn primary w-full">{editingReceipt ? 'Update Receipt' : 'Generate Receipt'}</button>
              </div>
            )}

            {viewingReceipt && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-[var(--panel)] border border-[var(--gold)]/50 p-6 rounded-xl w-full max-w-2xl shadow-2xl scale-100 animate-in zoom-in-95 relative">
                  <button 
                    onClick={() => setViewingReceipt(null)}
                    className="absolute top-4 right-4 text-[var(--muted)] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <ReceiptIcon className="w-5 h-5 text-[var(--gold)]" />
                    Receipt Details
                  </h3>
                  <div className="text-sm text-[var(--muted)] mb-6 font-mono">{viewingReceipt.id}</div>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--line)]">
                        <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Project</div>
                        <div className="font-bold text-white text-lg">{viewingReceipt.projectName}</div>
                      </div>
                      <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--line)]">
                        <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Amount / Rail</div>
                        <div className="font-bold text-white text-lg flex items-center gap-2">
                          <span className="text-amber-500">{viewingReceipt.amount.toLocaleString()}</span>
                          <span className="text-xs bg-[var(--line)] px-2 py-0.5 rounded text-[var(--muted2)]">{viewingReceipt.rail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--line)]">
                       <div className="flex justify-between items-center mb-2">
                         <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Transaction Hash</div>
                         <button 
                           onClick={() => handleCopyHash(viewingReceipt.hash)}
                           className="flex items-center gap-1 text-xs text-[var(--gold)] hover:underline"
                         >
                           <Copy className="w-3 h-3" /> Copy
                         </button>
                       </div>
                       <div className="font-mono text-xs text-white break-all bg-black/20 p-3 rounded border border-[var(--line)]">
                         {viewingReceipt.hash}
                       </div>
                    </div>

                    <div className="flex justify-between text-xs text-[var(--muted)]">
                      <div>Timestamp: {new Date(viewingReceipt.timestamp).toLocaleString()}</div>
                      <div className="text-green-400 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified on Blockchain</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
                  <tr>
                    <th className="p-4">Receipt ID</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Rail</th>
                    <th className="p-4">Hash</th>
                    <th className="p-4">Time</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[var(--muted2)]">
                  {projects.flatMap(p => p.receipts.map(r => ({...r, projectName: p.name}))).map(receipt => (
                    <tr key={receipt.id} className="border-t border-[var(--line)] hover:bg-[var(--gold)]/5">
                      <td className="p-4 font-mono text-xs">{receipt.id}</td>
                      <td className="p-4 font-bold text-white">{receipt.projectName}</td>
                      <td className="p-4 text-amber-500">{receipt.amount.toLocaleString()}</td>
                      <td className="p-4">{receipt.rail}</td>
                      <td className="p-4 font-mono text-xs text-[var(--muted)]">{receipt.hash.substring(0, 10)}...</td>
                      <td className="p-4 text-xs text-[var(--muted)]">{new Date(receipt.timestamp).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setViewingReceipt(receipt)}
                            className="p-1 hover:bg-[var(--bg)] rounded text-[var(--muted)] hover:text-[var(--gold)]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditReceipt(receipt)}
                            className="p-1 hover:bg-[var(--bg)] rounded text-[var(--muted)] hover:text-white"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-1 hover:bg-red-900/20 rounded text-[var(--muted)] hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );


      case 'audit':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">System Audit Logs</h2>
              <button onClick={handleExportAuditLogs} className="btn secondary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
              <AuditLogTable logs={auditLogs} />
            </div>
          </div>
        );
      case 'payment-gateway':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Payment Gateway Configuration</h2>
              <button 
                onClick={handleSyncTransactions}
                className="btn goldGlass text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4"/> Sync Transactions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <CreditCard className="w-24 h-24 text-[var(--gold)]" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Total Revenue</h3>
                 <div className="text-3xl font-bold text-[var(--gold)] font-mono">${paymentStats.totalRevenue.toLocaleString()}</div>
                 <div className="text-xs text-[var(--muted)] mt-1">+{paymentStats.revenueGrowth}% from last month</div>
               </div>
               
               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <CheckCircle className="w-24 h-24 text-green-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Successful Transactions</h3>
                 <div className="text-3xl font-bold text-green-400 font-mono">{paymentStats.successfulTransactions.toLocaleString()}</div>
                 <div className="text-xs text-[var(--muted)] mt-1">{paymentStats.successRate}% Success Rate</div>
               </div>

               <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Clock className="w-24 h-24 text-blue-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Pending Settlements</h3>
                 <div className="text-3xl font-bold text-blue-400 font-mono">${paymentStats.pendingSettlements.toLocaleString()}</div>
                 <div className="text-xs text-[var(--muted)] mt-1">{paymentStats.pendingCount} transactions processing</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
                 <div className="space-y-4">
                   {paymentMethods.map((method, i) => (
                     <div key={method.id} className="flex items-center justify-between p-4 bg-[var(--bg)] border border-[var(--line)] rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[var(--panel2)] flex items-center justify-center text-[var(--gold)]">
                           {method.type === 'Card' ? <CreditCard className="w-5 h-5"/> : 
                            method.type === 'Crypto' ? <ReceiptIcon className="w-5 h-5"/> : <Globe className="w-5 h-5"/>}
                         </div>
                         <div>
                           <div className="font-bold text-white">{method.name}</div>
                           <div className="text-xs text-[var(--muted)]">{method.status} • {method.fee} Fee</div>
                         </div>
                       </div>
                       <div 
                         onClick={() => handleTogglePaymentMethod(method.id)}
                         className={clsx("relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border cursor-pointer",
                            method.status === 'Active' ? "bg-green-900/50 border-green-500/50" : "bg-[var(--line)] border-[var(--line)]"
                         )}
                       >
                          <span className={clsx("absolute top-0.5 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out",
                             method.status === 'Active' ? "left-6 bg-green-400" : "left-1 bg-[var(--muted)]"
                          )}></span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-white mb-4">API Configuration</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs text-[var(--muted)] mb-1 block">Merchant ID</label>
                     <div className="flex gap-2">
                       <input type="text" value={apiConfig.merchantId} readOnly className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white font-mono text-sm opacity-70" />
                       <button onClick={() => handleCopy(apiConfig.merchantId)} className="btn secondary p-2"><Copy className="w-4 h-4"/></button>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs text-[var(--muted)] mb-1 block">Public Key</label>
                     <div className="flex gap-2">
                       <input type="text" value={apiConfig.publicKey} readOnly className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white font-mono text-sm opacity-70" />
                       <button onClick={() => handleCopy(apiConfig.publicKey)} className="btn secondary p-2"><Copy className="w-4 h-4"/></button>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs text-[var(--muted)] mb-1 block">Secret Key</label>
                     <div className="flex gap-2">
                       <input 
                         type={showSecretKey ? "text" : "password"} 
                         value={apiConfig.secretKey} 
                         readOnly 
                         className="flex-1 bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white font-mono text-sm opacity-70" 
                       />
                       <button onClick={() => setShowSecretKey(!showSecretKey)} className="btn secondary p-2">
                         {showSecretKey ? <Eye className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
                       </button>
                       <button onClick={() => handleCopy(apiConfig.secretKey)} className="btn secondary p-2"><Copy className="w-4 h-4"/></button>
                     </div>
                   </div>
                   <div className="pt-4 border-t border-[var(--line)]">
                     <button onClick={handleRegenerateKeys} className="btn primary w-full">Regenerate Keys</button>
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                 <button onClick={() => showToast("Displaying all available transactions.", 'info')} className="text-[var(--gold)] text-sm hover:underline">View All</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="text-xs text-[var(--muted)] uppercase border-b border-[var(--line)]">
                     <tr>
                       <th className="pb-3 pl-2">ID</th>
                       <th className="pb-3">Customer</th>
                       <th className="pb-3">Method</th>
                       <th className="pb-3">Amount</th>
                       <th className="pb-3">Status</th>
                       <th className="pb-3">Date</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {paymentTransactions.map((txn, i) => (
                       <tr key={txn.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                         <td className="py-3 pl-2 font-mono text-[var(--muted)]">{txn.id}</td>
                         <td className="py-3 font-medium text-white">{txn.customer}</td>
                         <td className="py-3">{txn.method}</td>
                         <td className="py-3 font-mono text-white">${txn.amount.toLocaleString()}</td>
                         <td className="py-3">
                           <span className={clsx("px-2 py-1 rounded text-xs border", 
                             txn.status === 'Completed' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                             txn.status === 'Pending' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                             "bg-red-500/10 text-red-400 border-red-500/20"
                           )}>
                             {txn.status}
                           </span>
                         </td>
                         <td className="py-3 text-[var(--muted)]">{txn.date}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        );
      case 'policies':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">System Policies</h2>
              <button 
                onClick={() => {
                  setIsAddingPolicy(!isAddingPolicy);
                  setEditingPolicyId(null);
                  setNewPolicy({ title: '', content: '', status: 'Draft' });
                }}
                className="btn goldGlass text-sm flex items-center gap-2"
              >
                {isAddingPolicy ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isAddingPolicy ? 'Cancel' : 'Add Policy'}
              </button>
            </div>

            {isAddingPolicy && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">{editingPolicyId ? 'Edit Policy' : 'Create New Policy'}</h3>
                <div className="space-y-4 mb-4">
                  <input 
                    type="text" placeholder="Policy Title (e.g., Water Usage Standard)"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newPolicy.title}
                    onChange={e => setNewPolicy({...newPolicy, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Policy Content / Description..."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white h-24"
                    value={newPolicy.content}
                    onChange={e => setNewPolicy({...newPolicy, content: e.target.value})}
                  />
                  <select 
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newPolicy.status}
                    onChange={e => setNewPolicy({...newPolicy, status: e.target.value as any})}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <button onClick={handleAddPolicy} className="btn primary w-full">
                  {editingPolicyId ? 'Update Policy' : 'Save Policy'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {policies.map(policy => (
                <div key={policy.id} className={clsx(
                  "bg-[var(--panel)] border p-6 rounded-xl relative group transition-colors",
                  editingPolicyId === policy.id ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-[var(--line)]"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{policy.title}</h3>
                    <span className={clsx("px-2 py-1 rounded text-xs uppercase", policy.status === 'Active' ? "bg-green-500/10 text-green-400" : "bg-[var(--bg)] text-[var(--muted)]")}>
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-sm mb-4">{policy.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-[var(--muted)]">Last Updated: {policy.lastUpdated}</div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditPolicy(policy)}
                        className="p-2 hover:bg-[var(--bg)] rounded text-[var(--muted)] hover:text-white"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="p-2 hover:bg-red-900/20 rounded text-[var(--muted)] hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'announcements':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Announcements</h2>
              <button 
                onClick={() => {
                   setIsAddingAnnouncement(!isAddingAnnouncement);
                   setEditingAnnouncementId(null);
                   setNewAnnouncement({ title: '', message: '', type: 'Info', startDate: '', endDate: '' });
                }}
                className="btn goldGlass text-sm flex items-center gap-2"
              >
                {isAddingAnnouncement ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isAddingAnnouncement ? 'Cancel' : 'Post Announcement'}
              </button>
            </div>

            {isAddingAnnouncement && (
              <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">{editingAnnouncementId ? 'Edit Announcement' : 'Post New Announcement'}</h3>
                <div className="space-y-4 mb-4">
                  <input 
                    type="text" placeholder="Title"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newAnnouncement.title}
                    onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Message..."
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white h-24"
                    value={newAnnouncement.message}
                    onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs text-[var(--muted)] mb-1 block">Start Date</label>
                       <input 
                         type="date"
                         className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                         value={newAnnouncement.startDate}
                         onChange={e => setNewAnnouncement({...newAnnouncement, startDate: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="text-xs text-[var(--muted)] mb-1 block">End Date</label>
                       <input 
                         type="date"
                         className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                         value={newAnnouncement.endDate}
                         onChange={e => setNewAnnouncement({...newAnnouncement, endDate: e.target.value})}
                       />
                     </div>
                  </div>
                  <select 
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                    value={newAnnouncement.type}
                    onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})}
                  >
                    <option value="Info">Info</option>
                    <option value="Alert">Alert</option>
                    <option value="Success">Success</option>
                  </select>
                </div>
                <button onClick={handleAddAnnouncement} className="btn primary w-full">
                  {editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className={clsx("bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl flex gap-4 items-start relative group transition-all",
                   ann.status === 'Inactive' && "opacity-75 grayscale-[0.5]"
                )}>
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", 
                    ann.type === 'Alert' ? "bg-red-900/20 text-red-500" : 
                    ann.type === 'Success' ? "bg-green-900/20 text-green-500" : "bg-[var(--gold)]/20 text-[var(--gold)]"
                  )}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-white">{ann.title}</h3>
                        <span className={clsx("text-[10px] uppercase px-2 py-0.5 rounded border",
                            ann.status === 'Active' ? "border-green-500/20 text-green-400 bg-green-500/10" : "border-[var(--line)] text-[var(--muted)] bg-[var(--bg)]"
                        )}>{ann.status}</span>
                    </div>
                    <p className="text-[var(--muted)] text-sm mb-2">{ann.message}</p>
                    <div className="flex gap-4 text-xs text-[var(--muted2)]">
                      <span>Posted: {ann.date}</span>
                      {ann.startDate && <span>Start: {ann.startDate}</span>}
                      {ann.endDate && <span>End: {ann.endDate}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                     {/* Toggle Switch */}
                     <div 
                       onClick={(e) => { e.stopPropagation(); handleToggleAnnouncementStatus(ann.id); }}
                       className={clsx("relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full border cursor-pointer",
                          ann.status === 'Active' ? "bg-green-900/50 border-green-500/50" : "bg-[var(--line)] border-[var(--line)]"
                       )}
                       title={ann.status === 'Active' ? "Deactivate" : "Activate"}
                     >
                        <span className={clsx("absolute top-0.5 w-3.5 h-3.5 rounded-full shadow transform transition-transform duration-200 ease-in-out",
                           ann.status === 'Active' ? "left-5 bg-green-400" : "left-1 bg-[var(--muted)]"
                        )}></span>
                     </div>

                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditAnnouncement(ann)}
                          className="p-2 hover:bg-[var(--bg)] rounded text-[var(--muted)] hover:text-white"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 hover:bg-red-900/20 rounded text-[var(--muted)] hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-12 text-center border-2 border-dashed border-[var(--line)] rounded-2xl">
            <div className="text-[var(--muted)] mb-2">Module Under Construction</div>
            <h3 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h3>
            <p className="text-[var(--muted)] mt-2">This section is part of the PAMTR admin suite specification.</p>
          </div>
        );
    }
  };

  const renderSubmitterContent = () => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uploadingKey) return;
  
      // Strict file type validation
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
         showToast("Only PDF and Image files are allowed.", "error");
         setUploadingKey(null);
         return;
      }

      // File size validation (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
         showToast("File size exceeds 5MB limit.", "error");
         setUploadingKey(null);
         return;
      }
      
      // Read file as Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setNewProject({
          ...newProject,
          proofPack: { 
            ...(newProject.proofPack as any), 
            [uploadingKey]: true,
            fileMetadata: {
              ...((newProject.proofPack as any).fileMetadata || {}),
              [uploadingKey]: { name: file.name, type: file.type }
            },
            fileData: {
              ...((newProject.proofPack as any).fileData || {}),
              [uploadingKey]: result
            }
          }
        });
        showToast(`Uploaded ${file.name}`, 'success');
        setUploadingKey(null);
      };
      reader.readAsDataURL(file);
    };

    const handleFileUpload = (key: string) => {
      setUploadingKey(key);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    };

    return (
      <div className="space-y-8">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Projects</h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="btn goldGlass flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {isCreating && (
          <div className="bg-[var(--panel)] border border-[var(--gold)]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold text-white mb-4">Register New Mineral Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-sm text-[var(--muted)] mb-1">Contact Email</label>
                 <input 
                   type="email" 
                   className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                   value={newProject.email || ''}
                   onChange={e => setNewProject({...newProject, email: e.target.value})}
                   placeholder="For submission updates..."
                 />
              </div>
              <div>
                 <label className="block text-sm text-[var(--muted)] mb-1">Phone Number</label>
                 <input 
                   type="tel" 
                   className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                   value={newProject.phone || ''}
                   onChange={e => setNewProject({...newProject, phone: e.target.value})}
                   placeholder="+1 234 567 8900"
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
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Mineral Type</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-white"
                  value={newProject.mineralType}
                  onChange={e => setNewProject({...newProject, mineralType: e.target.value})}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-[var(--muted2)] uppercase tracking-wider">Proof Pack Checklist</h4>
                <div className="text-xs text-[var(--gold)] font-bold">
                  {Object.values(newProject.proofPack || {}).filter(v => v === true).length - (typeof newProject.proofPack?.completionPercentage === 'number' ? 0 : 0)} / 7 Uploaded
                </div>
              </div>
              
              <div className="grid gap-3">
                {Object.keys(newProject.proofPack || {}).filter(k => k !== 'completionPercentage').map(key => {
                  const isUploaded = (newProject.proofPack as any)[key];
                  return (
                    <div key={key} className={clsx(
                      "flex items-center justify-between p-4 rounded border transition-colors",
                      isUploaded ? "bg-green-900/10 border-green-500/30" : "bg-[var(--bg)] border-[var(--line)]"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded flex items-center justify-center", isUploaded ? "bg-green-500/20 text-green-400" : "bg-[var(--line)] text-[var(--muted)]")}>
                          {isUploaded ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-xs text-[var(--muted)]">
                            {isUploaded ? `File uploaded: doc_${key}.pdf` : "Required document"}
                          </div>
                        </div>
                      </div>
                      
                      {isUploaded ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownloadFile(key)}
                            className="text-xs text-[var(--gold)] hover:text-white hover:underline"
                          >
                            Download
                          </button>
                          <button 
                            onClick={() => setNewProject({
                              ...newProject,
                              proofPack: { ...(newProject.proofPack as any), [key]: false }
                            })}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleFileUpload(key)}
                          className="btn secondary text-xs py-1.5 px-3"
                        >
                          Upload
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSaveProject} 
                className="btn goldGlass"
                disabled={Object.values(newProject.proofPack || {}).filter(v => v === true).length < 7} // Require full pack for submission
              >
                Submit Project
              </button>
              <button onClick={() => setIsCreating(false)} className="btn secondary">Cancel</button>
            </div>
            {Object.values(newProject.proofPack || {}).filter(v => v === true).length < 7 && (
               <div className="mt-2 text-xs text-[var(--gold)]/70 text-center">
                 * All 7 Proof Pack items must be uploaded to submit.
               </div>
            )}
          </div>
        )}

        <div className="grid gap-4">
          {projects.filter(p => p.submitterId === currentUser.id).map(project => (
            <div key={project.id} className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{project.name}</h3>
                  <span className={clsx("px-2 py-0.5 rounded text-xs border uppercase", 
                    project.status === 'Live' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]"
                  )}>{project.status}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">{project.country} • {project.mineralType}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted2)] uppercase">Verification Status</div>
                <div className="text-xl font-bold text-[var(--gold)]">{project.proofPack.completionPercentage}%</div>
                {project.status === 'Draft' && (
                  <button onClick={() => handleEditProject(project)} className="text-xs text-[var(--gold)] hover:underline mt-1">
                    Continue Submission
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVerifierContent = () => {
    // Shared Filter/Search Logic for Verifier
    const verifierProjects = projects.filter(p => p.status === 'Submitted' || p.status === 'Verified' || p.status === 'Live' || p.status === 'Under Verification');
    
    // Search only (for Dashboard view)
    const searchedVerifierProjects = verifierProjects.filter(p => {
        const submitter = users.find(u => u.id === p.submitterId);
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.mineralType.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
               (p.phone && p.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
               (submitter && submitter.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    // Search + Status Filter (for Submissions view)
    const filteredVerifierProjects = searchedVerifierProjects.filter(p => {
        const matchesStatus = !verifierFilterStatus || 
                              (verifierFilterStatus === 'Verified' ? (p.status === 'Verified' || p.status === 'Live') : p.status === verifierFilterStatus);
        return matchesStatus;
    });

    switch (activeTab) {
        case 'dashboard':
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Verifier Dashboard</h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                            <input 
                                type="text" 
                                placeholder="Search projects, submitters..." 
                                className="pl-9 pr-4 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-sm text-white w-64 focus:border-[var(--gold)] outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            label="Pending Review" 
                            value={verifierProjects.filter(p => p.status === 'Submitted').length} 
                            onClick={() => { setActiveTab('submissions'); setVerifierFilterStatus('Submitted'); }} 
                        />
                        <StatCard 
                            label="Under Verification" 
                            value={verifierProjects.filter(p => p.status === 'Under Verification').length} 
                            onClick={() => { setActiveTab('submissions'); setVerifierFilterStatus('Under Verification'); }} 
                        />
                        <StatCard 
                            label="Verified" 
                            value={verifierProjects.filter(p => p.status === 'Verified' || p.status === 'Live').length} 
                            onClick={() => { setActiveTab('submissions'); setVerifierFilterStatus('Verified'); }} 
                        />
                    </div>

                    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
                            <button onClick={() => { setActiveTab('submissions'); setVerifierFilterStatus(null); }} className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {searchedVerifierProjects.filter(p => p.status === 'Submitted').slice(0, 5).map(project => (
                                <div key={project.id} className="flex justify-between items-center p-3 rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--gold)]/30 transition-colors cursor-pointer" onClick={() => handlePickup(project)}>
                                    <div>
                                        <div className="font-bold text-white text-sm">{project.name}</div>
                                        <div className="text-xs text-[var(--muted)]">{project.country} • {project.mineralType}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-[var(--gold)]">{project.proofPack.completionPercentage}%</div>
                                        <div className="text-xs text-[var(--muted2)] uppercase">Proof Score</div>
                                    </div>
                                </div>
                            ))}
                            {searchedVerifierProjects.filter(p => p.status === 'Submitted').length === 0 && (
                                <div className="text-[var(--muted)] italic text-sm">No pending submissions found.</div>
                            )}
                        </div>
                    </div>
                </div>
            );
        case 'submissions':
        default:
             return (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white">All Submissions</h2>
                        {verifierFilterStatus && (
                            <div className="flex items-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-3 py-1 rounded-full">
                                <span className="text-xs text-[var(--gold)] font-medium">Filter: {verifierFilterStatus}</span>
                                <button onClick={() => setVerifierFilterStatus(null)} className="hover:bg-[var(--gold)]/20 rounded-full p-0.5">
                                    <X className="w-3 h-3 text-[var(--gold)]" />
                                </button>
                            </div>
                        )}
                    </div>
                     <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                        <input 
                            type="text" 
                            placeholder="Search projects, submitters..." 
                            className="pl-9 pr-4 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-sm text-white w-64 focus:border-[var(--gold)] outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                  </div>
                  <div className="grid gap-6">
                    {filteredVerifierProjects.map(project => (
                      <div key={project.id} className="bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                              <div className="text-sm text-[var(--muted)]">
                                Submitted by {project.submitterId} • {project.country}
                                {project.email && <span> • {project.email}</span>}
                                {project.phone && <span> • {project.phone}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[var(--gold)]">{project.proofPack.completionPercentage}%</div>
                              <div className="text-xs text-[var(--muted2)] uppercase">Proof Score</div>
                            </div>
                         </div>

                         <div className="bg-[var(--bg)] p-4 rounded-lg mb-6 border border-[var(--line)]">
                           <h4 className="text-sm font-bold text-[var(--muted)] mb-2">Proof Pack Status</h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                             {Object.entries(project.proofPack).map(([k, v]) => {
                               if (k === 'completionPercentage' || k === 'fileMetadata' || k === 'fileData' || k === 'verifiedDocuments') return null;
                               return (
                                 <div key={k} className={clsx("flex items-center gap-2", v ? "text-green-400" : "text-red-400")}>
                                    {v ? <CheckSquare className="w-3 h-3" /> : <FileWarning className="w-3 h-3" />}
                                    <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>

                         <div className="flex gap-4 border-t border-[var(--line)] pt-4">
                           {project.status === 'Submitted' && (
                             <button onClick={() => handlePickup(project)} className="btn secondary text-sm">Start Verification Review</button>
                           )}
                           
                           {project.status === 'Under Verification' && !project.seal && (
                             <>
                               <button onClick={() => handleIssueSeal(project, 'Verified Intake')} className="btn secondary text-sm">Issue Seal I (Intake)</button>
                               <button onClick={() => handleIssueSeal(project, 'Implementation-Ready')} className="btn secondary text-sm">Issue Seal II (Ready)</button>
                               <button onClick={() => handleIssueSeal(project, 'Audit-Complete')} className="btn goldGlass text-sm">Issue Seal III (Audit)</button>
                             </>
                           )}

                           {project.status === 'Verified' && project.seal && (
                             <button 
                               onClick={() => handlePublish(project)} 
                               disabled={project.proofPack.completionPercentage < 100}
                               className="btn goldGlass text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                               title={project.proofPack.completionPercentage < 100 ? "All proofs must be verified to publish" : "Publish to Live Registry"}
                             >
                               Publish to Live Registry
                             </button>
                           )}

                           {project.status === 'Live' && (
                             <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded border border-green-500/20">
                               <Globe className="w-5 h-5" />
                               Live on Registry
                             </div>
                           )}

                           {project.seal && (
                             <div className="flex items-center gap-3 ml-auto">
                               <div className="flex items-center gap-2 text-[var(--gold)] font-bold bg-[var(--gold)]/10 px-4 py-2 rounded">
                                 <BadgeCheck className="w-5 h-5" />
                                 {project.seal.level}
                               </div>
                               <button 
                                 onClick={() => handleRevokeSeal(project)}
                                 className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs uppercase font-bold tracking-wider transition-colors"
                                 title="Revoke Seal"
                               >
                                 Revoke
                               </button>
                             </div>
                           )}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
             );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--gold)]/30">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Topbar */}
      <header className="h-16 border-b border-[var(--line)] bg-[var(--panel)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
             className="md:hidden p-1 -ml-2 text-[var(--muted)] hover:text-white"
             onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
             <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="font-bold text-xl text-white tracking-tight">PAMTR™ <span className="text-[var(--gold)] text-sm font-normal">Portal</span></Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg)] border border-[var(--line)] rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--good)] animate-pulse"></span>
            <span className="text-xs font-mono text-[var(--muted2)]">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-[var(--muted2)] uppercase">{currentUser.role}</div>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg bg-[var(--panel2)] text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        {currentUser.role === 'admin' && renderAdminSidebar()}
        {currentUser.role === 'verifier' && renderVerifierSidebar()}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Revoke Seal Modal */}
      {isRevoking && projectToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--panel)] border border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Revoke Seal
            </h3>
            <p className="text-[var(--muted)] mb-4">
              Are you sure you want to revoke the seal for <span className="text-white font-bold">{projectToRevoke.name}</span>?
              This action cannot be undone and will be recorded in the public audit log.
            </p>
            <div className="mb-6">
              <label className="block text-xs uppercase text-[var(--muted)] mb-2">Reason for Revocation</label>
              <textarea
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3 text-white focus:border-red-500 focus:outline-none h-24 resize-none"
                placeholder="Enter detailed reason..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsRevoking(false); setProjectToRevoke(null); }}
                className="px-4 py-2 rounded-lg text-[var(--muted)] hover:text-white hover:bg-[var(--line)]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRevokeSeal}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/20"
              >
                Revoke Seal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal - Audit/Verification Interface */}
      {isReviewingSubmission && submissionToReview && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-[var(--panel)] border border-[var(--line)] w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="h-16 border-b border-[var(--line)] bg-[var(--panel2)] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                   <h3 className="font-bold text-white text-lg">{submissionToReview.name}</h3>
                   <span className="px-2 py-0.5 rounded text-xs border border-[var(--line)] text-[var(--muted)] uppercase">
                      {submissionToReview.country} • {submissionToReview.mineralType}
                   </span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Review Progress</div>
                      <div className="text-sm font-bold text-white">
                        {currentReviewFileIndex + 1} / {reviewFiles.length} Files
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsReviewingSubmission(false)}
                     className="p-2 hover:bg-white/10 rounded-full transition-colors"
                   >
                     <X className="w-6 h-6 text-[var(--muted)] hover:text-white" />
                   </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 flex overflow-hidden">
                 
                 {/* Sidebar - Checklist */}
                 <div className="w-80 border-r border-[var(--line)] bg-[var(--bg)] flex flex-col">
                    <div className="p-4 border-b border-[var(--line)]">
                       <h4 className="text-sm font-bold text-[var(--muted2)] uppercase tracking-wider">Submission Files</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                       {reviewFiles.map(([key, value], idx) => {
                          const isReviewed = reviewedFileKeys.includes(key);
                          const isRejected = rejectedFileKeys.includes(key);
                          const isCurrent = idx === currentReviewFileIndex;
                          
                          return (
                             <button
                               key={key}
                               onClick={() => setCurrentReviewFileIndex(idx)}
                               className={clsx(
                                 "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all",
                                 isCurrent ? "bg-[var(--gold)]/10 border border-[var(--gold)]/30" : "hover:bg-[var(--panel)] border border-transparent",
                                 (isReviewed || isRejected) && !isCurrent ? "opacity-60" : ""
                               )}
                             >
                                <div className={clsx(
                                  "w-6 h-6 rounded flex items-center justify-center shrink-0",
                                  isReviewed ? "bg-green-500/20 text-green-400" :
                                  isRejected ? "bg-red-500/20 text-red-400" :
                                  "bg-[var(--line)] text-[var(--muted)]"
                                )}>
                                   {isReviewed ? <Check className="w-3 h-3"/> : isRejected ? <X className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className={clsx("text-sm font-medium truncate", isCurrent ? "text-white" : "text-[var(--muted)]")}>
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                   </div>
                                </div>
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* Document Viewer Area */}
                 <div className="flex-1 bg-[var(--panel2)] relative flex flex-col">
                    {currentFileEntry ? (
                       <>
                         {/* Toolbar */}
                         <div className="h-12 border-b border-[var(--line)] bg-[var(--panel)] flex items-center justify-between px-4">
                            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                               <FileText className="w-4 h-4" />
                               {currentFileEntry[0].replace(/([A-Z])/g, ' $1').trim()}.pdf
                            </div>
                            <button 
                              onClick={() => handleDownloadFile(currentFileEntry[0])}
                              className="btn secondary text-xs flex items-center gap-2 py-1.5"
                            >
                               {downloadingFile === currentFileEntry[0] ? <Loader2 className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3"/>}
                               Download
                            </button>
                         </div>
                         
                         {/* Document Preview Area */}
                         <div className="flex-1 flex flex-col items-center justify-center p-4 text-[var(--muted)] overflow-hidden bg-[var(--bg)]/50">
                            {(() => {
                               const key = currentFileEntry[0];
                               const fileData = submissionToReview.proofPack.fileData?.[key];
                               const metadata = submissionToReview.proofPack.fileMetadata?.[key];
                               const mimeType = metadata?.type || 'application/pdf';
                               
                               if (!fileData) {
                                  return (
                                     <div className="flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-[var(--line)] rounded-full flex items-center justify-center mb-4">
                                           <FileText className="w-10 h-10 opacity-50" />
                                        </div>
                                        <p className="mb-2">Document Preview Unavailable</p>
                                        <p className="text-xs max-w-md text-center opacity-70">
                                           Please download the file to review its contents.
                                        </p>
                                     </div>
                                  );
                               }

                               if (mimeType.startsWith('image/')) {
                                  return (
                                     <img 
                                        src={fileData} 
                                        alt="Document Preview" 
                                        className="max-w-full max-h-full object-contain rounded shadow-lg border border-[var(--line)]" 
                                     />
                                  );
                               } else {
                                  return (
                                     <iframe 
                                        src={fileData} 
                                        className="w-full h-full rounded shadow-lg border border-[var(--line)] bg-white"
                                        title="Document Preview"
                                     />
                                  );
                               }
                            })()}
                         </div>

                         {/* Action Bar */}
                         <div className="h-20 border-t border-[var(--line)] bg-[var(--panel)] flex items-center justify-between px-8">
                            <div className="flex gap-4">
                               <button 
                                 onClick={() => handleRejectFile(currentFileEntry[0])}
                                 className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all",
                                    rejectedFileKeys.includes(currentFileEntry[0]) 
                                      ? "bg-red-500 text-white shadow-[0_0_15px_-5px_red]" 
                                      : "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                 )}
                               >
                                  <X className="w-4 h-4" /> Reject
                               </button>
                               <button 
                                 onClick={() => handleAcceptFile(currentFileEntry[0])}
                                 className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all",
                                    reviewedFileKeys.includes(currentFileEntry[0]) 
                                      ? "bg-green-500 text-white shadow-[0_0_15px_-5px_green]" 
                                      : "bg-green-900/20 text-green-400 hover:bg-green-900/40"
                                 )}
                               >
                                  <Check className="w-4 h-4" /> Accept
                               </button>
                            </div>

                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => setCurrentReviewFileIndex(Math.max(0, currentReviewFileIndex - 1))}
                                 disabled={currentReviewFileIndex === 0}
                                 className="btn secondary p-2 disabled:opacity-50"
                               >
                                  <ChevronLeft className="w-5 h-5" />
                               </button>
                               <span className="text-sm text-[var(--muted)]">
                                  {currentReviewFileIndex + 1} of {reviewFiles.length}
                               </span>
                               <button 
                                 onClick={() => setCurrentReviewFileIndex(Math.min(reviewFiles.length - 1, currentReviewFileIndex + 1))}
                                 disabled={currentReviewFileIndex === reviewFiles.length - 1}
                                 className="btn secondary p-2 disabled:opacity-50"
                               >
                                  <ChevronRight className="w-5 h-5" />
                               </button>
                            </div>
                         </div>
                       </>
                    ) : (
                       <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
                          Select a file to review
                       </div>
                    )}
                 </div>
              </div>

              {/* Footer */}
              <div className="h-16 border-t border-[var(--line)] bg-[var(--panel)] flex items-center justify-between px-6 shrink-0">
                 <div className="text-sm text-[var(--muted)]">
                    <span className="text-white font-bold">{reviewedFileKeys.length}</span> accepted, <span className="text-white font-bold">{rejectedFileKeys.length}</span> rejected
                 </div>
                 <button 
                   onClick={handleCompleteReview}
                   disabled={reviewedFileKeys.length + rejectedFileKeys.length < reviewFiles.length}
                   className="btn goldGlass px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Complete Review & Verify
                 </button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents
const NavButton = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={clsx(
      "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out",
      active === id 
        ? "bg-gradient-to-r from-[var(--gold)]/20 to-transparent text-[var(--gold)] border border-[var(--gold)]/30 translate-x-2 shadow-[0_0_20px_-5px_var(--gold)] font-bold" 
        : "text-[var(--muted)] hover:text-white hover:bg-[var(--panel2)] hover:translate-x-1"
    )}
  >
    <Icon className={clsx("w-4 h-4 transition-transform duration-300", active === id && "scale-110")} />
    {label}
  </button>
);

const StatCard = ({ label, value, onClick }: { label: string, value: number, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={clsx(
      "bg-[var(--panel)] border border-[var(--line)] p-6 rounded-xl transition-all duration-200",
      onClick ? "cursor-pointer hover:border-[var(--gold)] hover:bg-[var(--panel2)] hover:scale-[1.02] hover:shadow-lg" : "hover:border-[var(--muted2)]"
    )}
  >
    <div className="text-[var(--muted)] text-sm uppercase tracking-wider mb-2">{label}</div>
    <div className="text-3xl font-bold text-white font-mono">{value}</div>
  </div>
);

const ProjectTable = ({ projects }: { projects: Project[] }) => {
  const router = useRouter();
  
  return (
  <div className="overflow-x-auto">
  <table className="w-full text-left min-w-[800px]">
    <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
      <tr>
        <th className="p-4">Project Name</th>
        <th className="p-4">Country</th>
        <th className="p-4">Status</th>
        <th className="p-4">Proof Score</th>
        <th className="p-4">Last Updated</th>
        <th className="p-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="text-sm text-[var(--muted2)]">
      {projects.map(project => (
        <tr 
          key={project.id} 
          className="border-t border-[var(--line)] hover:bg-[var(--panel2)] cursor-pointer transition-colors"
          onClick={() => router.push(`/project/${project.id}`)}
        >
          <td className="p-4 font-bold text-white">{project.name}</td>
          <td className="p-4">{project.country}</td>
          <td className="p-4">
            <span className={clsx("px-2 py-1 rounded text-xs border uppercase", 
               project.status === 'Live' ? "bg-green-500/10 border-green-500/20 text-green-400" : 
               project.status === 'Verified' ? "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]" :
               "bg-[var(--panel2)] border-[var(--line)] text-[var(--muted)]"
            )}>{project.status}</span>
          </td>
          <td className="p-4">
            <div className="w-full bg-[var(--panel2)] rounded-full h-1.5 w-24">
              <div className="bg-[var(--gold)] h-1.5 rounded-full" style={{ width: `${project.proofPack.completionPercentage}%` }}></div>
            </div>
          </td>
          <td className="p-4 text-[var(--muted)]">{new Date(project.updatedAt).toLocaleDateString()}</td>
          <td className="p-4 text-right">
            <button 
              className="p-2 hover:bg-[var(--bg)] rounded-full text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
              title="View Project Details"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/project/${project.id}`);
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
      {projects.length === 0 && (
        <tr><td colSpan={6} className="p-8 text-center text-[var(--muted)]">No projects found.</td></tr>
      )}
    </tbody>
  </table>
  </div>
  );
};

const AuditLogTable = ({ logs }: { logs: AuditLog[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm min-w-[600px]">
      <thead className="text-[var(--muted)] border-b border-[var(--line)]">
        <tr>
          <th className="pb-2 pl-4">Time</th>
          <th className="pb-2">User</th>
          <th className="pb-2">Action</th>
          <th className="pb-2">Details</th>
        </tr>
      </thead>
      <tbody className="text-[var(--muted2)]">
        {logs.map(log => (
          <tr key={log.id} className="border-b border-[var(--line)]">
            <td className="py-3 pl-4 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
            <td className="py-3">{log.userId}</td>
            <td className="py-3 text-white">{log.action}</td>
            <td className="py-3 text-[var(--muted)] truncate max-w-xs">{log.details}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);