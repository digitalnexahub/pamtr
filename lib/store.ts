import { Project, User, AuditLog, Country, Policy, Announcement } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Public User', role: 'public', email: 'public@pamtr.org', password: 'password', isVerified: false },
  { id: 'u2', name: 'Ghana Gov Submit', role: 'submitter', email: 'mines@ghana.gov.gh', password: 'password', isVerified: true },
  { id: 'u3', name: 'ACRELS Auditor', role: 'verifier', email: 'audit@acrels.org', password: 'password', isVerified: true },
  { id: 'u4', name: 'System Admin', role: 'admin', email: 'admin@pamtr.org', password: 'password', isVerified: true },
];

export const PROJECTS: Project[] = [
  {
    id: 'PAM-GH-001',
    name: 'Breman Asikuma Project A',
    country: 'Ghana',
    mineralType: 'Gold',
    status: 'Live',
    submitterId: 'u2',
    proofPack: {
      miningLicense: true,
      govAuthorization: true,
      envApprovals: true,
      operatingEntityDoc: true,
      complianceAttestations: true,
      partnerMOUs: true,
      optionalAudits: true,
      completionPercentage: 100,
    },
    seal: {
      level: 'Audit-Complete', // Seal III
      issuer: 'u3',
      date: '2025-01-02',
      revocationHistory: [],
    },
    receipts: [
      {
        id: 'RCPT-GH-001-123456',
        projectId: 'PAM-GH-001',
        amount: 500,
        rail: 'USDC',
        timestamp: '2025-01-20T10:30:00Z',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        id: 'RCPT-GH-001-789012',
        projectId: 'PAM-GH-001',
        amount: 100,
        rail: 'ACRELS Coin',
        timestamp: '2025-01-21T15:45:00Z',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      }
    ],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-02T14:00:00Z',
  },
  {
    id: 'PAM-GH-042',
    name: 'Obuasi South Ext.',
    country: 'Ghana',
    mineralType: 'Gold',
    status: 'Verified', // Displayed as "Verifying" in mockup maybe? Or "Verified" but only Seal I
    submitterId: 'u2',
    proofPack: {
      miningLicense: true,
      govAuthorization: true,
      envApprovals: true,
      operatingEntityDoc: true,
      complianceAttestations: true,
      partnerMOUs: true,
      optionalAudits: false,
      completionPercentage: 85,
    },
    seal: {
      level: 'Verified Intake', // Seal I
      issuer: 'u3',
      date: '2025-01-10',
      revocationHistory: [],
    },
    receipts: [],
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-10T11:00:00Z',
  },
  {
    id: 'PAM-NG-118',
    name: 'Kaduna Lithium Block 4',
    country: 'Nigeria',
    mineralType: 'Lithium',
    status: 'Live',
    submitterId: 'u2', // Assuming same submitter for demo
    proofPack: {
      miningLicense: true,
      govAuthorization: true,
      envApprovals: true,
      operatingEntityDoc: true,
      complianceAttestations: true,
      partnerMOUs: true,
      optionalAudits: true,
      completionPercentage: 100,
    },
    seal: {
      level: 'Implementation-Ready', // Seal II
      issuer: 'u3',
      date: '2024-12-15',
      revocationHistory: [],
    },
    receipts: [],
    createdAt: '2024-11-20T08:00:00Z',
    updatedAt: '2024-12-15T16:00:00Z',
  },
  {
    id: 'PAM-SL-005',
    name: 'Kono Diamond Wash Plant',
    country: 'Sierra Leone',
    mineralType: 'Diamond',
    status: 'Draft',
    submitterId: 'u2',
    proofPack: {
      miningLicense: true,
      govAuthorization: false,
      envApprovals: false,
      operatingEntityDoc: true,
      complianceAttestations: false,
      partnerMOUs: false,
      optionalAudits: false,
      completionPercentage: 25,
    },
    seal: undefined,
    receipts: [],
    createdAt: '2025-01-22T08:00:00Z',
    updatedAt: '2025-01-22T08:00:00Z',
  },
  {
    id: 'PAM-TZ-089',
    name: 'Geita Small-Scale Gold',
    country: 'Tanzania',
    mineralType: 'Gold',
    status: 'In-Review',
    submitterId: 'u2',
    proofPack: {
      miningLicense: true,
      govAuthorization: true,
      envApprovals: true,
      operatingEntityDoc: true,
      complianceAttestations: true,
      partnerMOUs: false,
      optionalAudits: false,
      completionPercentage: 70,
    },
    seal: undefined,
    receipts: [],
    createdAt: '2025-01-21T10:00:00Z',
    updatedAt: '2025-01-22T09:00:00Z',
  },
];

export const AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    userId: 'u3',
    action: 'Issue Seal',
    timestamp: '2025-01-02T14:00:00Z',
    details: 'Issued Seal III to PAM-GH-001',
  },
  {
    id: 'log2',
    userId: 'u2',
    action: 'Create Project',
    timestamp: '2024-12-01T10:00:00Z',
    details: 'Created project Breman Asikuma Project A',
  }
];

export const COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', status: 'Active', nodeOperator: 'Minerals Commission', projectCount: 2 },
  { code: 'NG', name: 'Nigeria', status: 'Active', nodeOperator: 'Ministry of Mines', projectCount: 1 },
  { code: 'SL', name: 'Sierra Leone', status: 'Inactive', nodeOperator: 'Pending', projectCount: 0 },
  { code: 'TZ', name: 'Tanzania', status: 'Inactive', nodeOperator: 'Pending', projectCount: 0 },
];

export const POLICIES: Policy[] = [
  { id: 'POL-001', title: 'AML/KYC Requirements v2.0', content: 'Updated requirements for beneficial ownership disclosure.', lastUpdated: '2024-12-01', status: 'Active' },
  { id: 'POL-002', title: 'Environmental Impact Standard', content: 'Baseline environmental assessment criteria for small-scale operations.', lastUpdated: '2024-11-15', status: 'Active' },
  { id: 'POL-003', title: 'Proof Stack Verification Guidelines', content: 'Draft guidelines for auditors verifying proof packs.', lastUpdated: '2025-01-10', status: 'Draft' },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'ANN-001', title: 'System Maintenance', message: 'Portal will be down for maintenance on Sunday 2 AM UTC.', date: '2025-01-20', type: 'Alert', status: 'Active' },
  { id: 'ANN-002', title: 'New Country Node: Nigeria', message: 'Nigeria has officially joined the PAMTR network.', date: '2025-01-15', type: 'Success', status: 'Active' },
  { id: 'ANN-003', title: 'Updated Compliance Rules', message: 'Please review the new AML/KYC policy document.', date: '2025-01-10', type: 'Info', status: 'Active' },
];
