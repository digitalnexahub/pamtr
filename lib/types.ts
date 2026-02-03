export type UserRole = 'public' | 'submitter' | 'verifier' | 'admin';

export type ProjectStatus = 'Draft' | 'Submitted' | 'Under Verification' | 'Verified' | 'Live' | 'Revoked' | 'Archived';

export type SealLevel = 'Verified Intake' | 'Implementation-Ready' | 'Audit-Complete';

export interface ProofPack {
  miningLicense: boolean;
  govAuthorization: boolean;
  envApprovals: boolean;
  operatingEntityDoc: boolean;
  complianceAttestations: boolean;
  partnerMOUs: boolean;
  optionalAudits: boolean;
  completionPercentage: number;
  verifiedDocuments?: string[];
  fileMetadata?: Record<string, { name: string, type: string }>;
  fileData?: Record<string, string>; // Stores base64 data url for preview/download
}

export interface Seal {
  level: SealLevel;
  issuer: string; // User ID
  date: string;
  revocationHistory: string[];
}

export interface Receipt {
  id: string;
  projectId: string;
  amount: number;
  rail: 'ACRELS Coin' | 'USDC' | 'Card';
  timestamp: string;
  hash: string;
}

export interface Project {
  id: string;
  name: string;
  country: string;
  mineralType: string;
  status: ProjectStatus;
  submitterId: string;
  proofPack: ProofPack;
  seal?: Seal;
  receipts: Receipt[];
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string; // Added phone number
  isVerified?: boolean; // Added verification status
  password?: string; // Added for simple auth
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

export interface Country {
  code: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  nodeOperator: string;
  projectCount: number;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  status: 'Active' | 'Draft';
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  startDate?: string;
  endDate?: string;
  type: 'Info' | 'Alert' | 'Success';
  status: 'Active' | 'Inactive';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Card' | 'Crypto' | 'Bank';
  status: 'Active' | 'Inactive';
  fee: string;
}

export interface PaymentTransaction {
  id: string;
  customer: string;
  method: string;
  amount: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export interface PaymentStats {
  totalRevenue: number;
  revenueGrowth: number;
  successfulTransactions: number;
  successRate: number;
  pendingSettlements: number;
  pendingCount: number;
}

export interface ApiConfig {
  merchantId: string;
  publicKey: string;
  secretKey: string;
}
