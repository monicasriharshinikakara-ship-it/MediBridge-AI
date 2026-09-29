export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  medicalHistory: string[]; // Past Health Problems
  currentSymptoms: string[]; // What are you feeling?
  allergies: string[];
  currentMedicines?: string[];
  emergencyContact?: EmergencyContact;
  bloodGroup: string;
  insuranceProvider: string;
  insurancePolicyNo: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string; // Doctor's Department
  qualification: string;
  experienceYears: number;
  hospital: string;
  consultationFee: number;
  consultationFeeInr?: number;
  rating: number;
  reviewCount: number;
  availabilityDays: string[];
  timeSlots: string[];
  avatar: string;
  bio: string;
  languages: string[];
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface Appointment {
  id: string;
  caseId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  mode: 'In-Clinic' | 'Tele-Consultation';
  chiefComplaint: string;
  fee: number;
  feeInr?: number;
}

export type SimpleTimelineStatus =
  | 'Not Started'
  | 'Booked'
  | 'Waiting'
  | 'Completed'
  | 'Doctor Review'
  | 'Follow-up Needed';

export interface HealthTimelineStep {
  stepNumber: number;
  title: string;
  description: string;
  status: SimpleTimelineStatus;
  date?: string;
  details?: string;
}

export type CaseStatus =
  | 'Active Triage'
  | 'Appointment Scheduled'
  | 'Diagnostics In-Progress'
  | 'Awaiting Clinician Review'
  | 'Treatment Formulated'
  | 'Case Closed';

export type TreatmentStatus =
  | 'Pending Clinician Consultation'
  | 'Prescription Formulated - Clinician Sign-off Required'
  | 'Treatment Plan Active'
  | 'Clinician Approved & Finalized';

export interface CostBreakdown {
  consultation: number;
  laboratory: number;
  imaging: number;
  medicines: number;
  procedures: number;
  packages: number;
  roomCharges: number;
  otherCharges: number;
  total: number;
  insuranceEstimatedCoverage: number;
  patientEstimatedResponsibility: number;
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'Draft / AI Suggested - Awaiting Clinician Approval' | 'Clinician Approved';
}

export interface HealthcareCase {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  updatedAt: string;
  symptoms: string[];
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentId?: string;
  appointmentDate?: string;
  testsRecommended: string[];
  testResults: Array<{
    id: string;
    testName: string;
    status: 'Pending' | 'Uploaded' | 'Analyzed' | 'Clinician Reviewed';
    date: string;
    summary?: string;
  }>;
  treatmentStatus: TreatmentStatus;
  prescriptions: PrescriptionItem[];
  estimatedCost: CostBreakdown;
  caseStatus: CaseStatus;
  aiTriageNotes: string;
}

export interface TestParameter {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical' | 'informational';
  simpleExplanation?: string;
}

export interface TestResultItem {
  id: string;
  caseId?: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: 'Blood Work' | 'Imaging' | 'Cardiology' | 'Metabolic' | 'Endocrine' | 'Pathology';
  uploadedAt: string;
  status: 'Processing' | 'Extracted' | 'AI Summarized' | 'Pending Clinician Verification' | 'Clinician Approved';
  parameters: TestParameter[];
  aiSummary: string;
  clinicalDisclaimer: string;
  questionsForDoctor: string[];
  documentUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text: string;
  isEmergencyAlert?: boolean;
  suggestedActions?: Array<{
    label: string;
    action:
      | 'book_doctor'
      | 'view_case'
      | 'view_cost'
      | 'view_test'
      | 'view_appointment'
      | 'view_medicines'
      | 'set_symptoms'
      | 'fill_prompt'
      | 'start_triage_step';
    payload?: any;
  }>;
  quickChoices?: string[];
  metadata?: {
    specialtyRecommendation?: string;
    suggestedDoctorId?: string;
    estimatedCostQuick?: number;
    caseIdRef?: string;
    n8nRouted?: boolean;
  };
}

export interface N8nConfig {
  webhookUrl: string;
  isEnabled: boolean;
  lastPingStatus: 'untested' | 'connected' | 'error';
  lastPingResponse?: string;
  lastPingTimestamp?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'assistant'
  | 'doctors'
  | 'appointments'
  | 'medical_tests'
  | 'medicines'
  | 'cases'
  | 'tests'
  | 'costs'
  | 'profile';
