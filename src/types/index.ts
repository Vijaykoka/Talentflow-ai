export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type DemandStatus = "OPEN" | "IN_PROGRESS" | "INTERVIEW" | "OFFER" | "FILLED";
export type CandidateStatus = "AVAILABLE" | "INTERVIEWING" | "OFFERED" | "HIRED" | "UNAVAILABLE";
export type MatchStatus = "PENDING" | "SHORTLISTED" | "REJECTED";
export type HireStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Demand {
  id: string;
  title: string;
  jdText: string | null;
  requiredSkills: string[];
  rateMin: number;
  rateMax: number;
  location: string | null;
  priority: Priority;
  status: DemandStatus;
  vendorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  extractedSkills: string[];
  experienceYears: number;
  currentCtc: number | null;
  expectedCtc: number | null;
  status: CandidateStatus;
  hotTalent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  candidateId: string;
  originalFile: string;
  parsedText: string | null;
  extractedSkills: string[];
  education: Education[] | null;
  experience: WorkExperience[] | null;
  createdAt: Date;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  description: string;
}

export interface JobCandidateMatch {
  id: string;
  demandId: string;
  candidateId: string;
  matchScore: number;
  matchReason: string | null;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  commissionRate: number;
  performanceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hire {
  id: string;
  demandId: string;
  candidateId: string;
  vendorId: string | null;
  hiredRate: number;
  hiringCost: number;
  startDate: Date;
  projectedMargin12m: number | null;
  status: HireStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalDemands: number;
  openDemands: number;
  totalCandidates: number;
  hotTalentCount: number;
  totalHires: number;
  projectedMargin: number;
  revenueAtRisk: number;
}

export interface MarginForecast {
  billRate: number;
  payRate: number;
  hiringCost: number;
  monthlyMargin: number;
  projectedMargin12m: number;
  breakEvenMonths: number;
}