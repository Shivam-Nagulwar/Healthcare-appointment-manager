// ========================================
// Mock Data for Frontend Development
// ========================================

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AppointmentStatus = 'HELD' | 'BOOKED' | 'CANCELLED' | 'COMPLETED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  avatar?: string;
  workingHours: Record<string, [string, string]>;
  slotDurationMin: number;
  rating: number;
  totalReviews: number;
  experience: number;
  bio: string;
  education: string;
  location: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar?: string;
  patientName: string;
  patientAvatar?: string;
  slotStart: string;
  slotEnd: string;
  createdAt: string; // added to fix TS error
  status: AppointmentStatus;
  preVisitSummary?: PreVisitSummary;
  postVisitNote?: PostVisitNote;
}

export interface PreVisitSummary {
  id: string;
  rawSymptoms: string;
  rawInput?: string; // alias for rawSymptoms used in detail page
  urgencyLevel: UrgencyLevel | null;
  chiefComplaint: string | null;
  suggestedQuestions: string[] | null;
  differentialDiagnosis?: string[];
  redFlags?: string[];
  patientFriendlySummary?: string;
  llmStatus: 'OK' | 'FAILED';
}

export interface PostVisitNote {
  id: string;
  clinicalNotes: string;
  doctorNotesRaw?: string; // alias used in detail page
  prescription: PrescriptionItem[];
  prescriptions?: PrescriptionItem[]; // alias used in detail page
  patientSummary: string | null;
  patientFriendlySummary?: string | null; // alias used in detail page
  followUpRecommended?: boolean;
  followUpDays?: number;
  llmStatus: 'OK' | 'FAILED';
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  duration?: string; // alias used in detail page
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  doctorName: string;
  leaveDate: string;
  reason: string | null;
}

// ========================================
// Mock Users
// ========================================

export const mockCurrentUser: User = {
  id: 'usr-patient-1',
  email: 'sarah.johnson@email.com',
  name: 'Sarah Johnson',
  role: 'PATIENT',
};

export const mockDoctorUser: User = {
  id: 'usr-doctor-1',
  email: 'dr.patel@medcare.com',
  name: 'Dr. Arun Patel',
  role: 'DOCTOR',
};

export const mockAdminUser: User = {
  id: 'usr-admin-1',
  email: 'admin@medcare.com',
  name: 'Admin User',
  role: 'ADMIN',
};

// ========================================
// Mock Doctors
// ========================================

export const mockDoctors: DoctorProfile[] = [
  {
    id: 'doc-1',
    userId: 'usr-doctor-1',
    name: 'Dr. Arun Patel',
    email: 'dr.patel@medcare.com',
    specialization: 'Cardiologist',
    workingHours: {
      mon: ['09:00', '17:00'],
      tue: ['09:00', '17:00'],
      wed: ['09:00', '13:00'],
      thu: ['09:00', '17:00'],
      fri: ['09:00', '17:00'],
    },
    slotDurationMin: 30,
    rating: 4.8,
    totalReviews: 127,
    experience: 15,
    bio: 'Board-certified cardiologist with 15 years of experience in interventional cardiology and preventive heart care.',
    education: 'MD - Cardiology, AIIMS Delhi',
    location: 'MedCare Hospital, Sector 12',
  },
  {
    id: 'doc-2',
    userId: 'usr-doctor-2',
    name: 'Dr. Priya Sharma',
    email: 'dr.sharma@medcare.com',
    specialization: 'Dermatologist',
    workingHours: {
      mon: ['10:00', '18:00'],
      tue: ['10:00', '18:00'],
      wed: ['10:00', '18:00'],
      thu: ['10:00', '18:00'],
      fri: ['10:00', '14:00'],
    },
    slotDurationMin: 20,
    rating: 4.9,
    totalReviews: 203,
    experience: 12,
    bio: 'Specialist in clinical dermatology, cosmetic procedures, and skin cancer treatment with expertise in advanced laser therapies.',
    education: 'MD - Dermatology, KEM Hospital Mumbai',
    location: 'SkinCare Clinic, MG Road',
  },
  {
    id: 'doc-3',
    userId: 'usr-doctor-3',
    name: 'Dr. Rahul Mehta',
    email: 'dr.mehta@medcare.com',
    specialization: 'Orthopedic Surgeon',
    workingHours: {
      mon: ['08:00', '16:00'],
      tue: ['08:00', '16:00'],
      wed: ['08:00', '16:00'],
      thu: ['08:00', '16:00'],
      fri: ['08:00', '12:00'],
    },
    slotDurationMin: 30,
    rating: 4.7,
    totalReviews: 89,
    experience: 20,
    bio: 'Senior orthopedic surgeon specializing in joint replacements, sports injuries, and minimally invasive surgical techniques.',
    education: 'MS - Orthopedics, CMC Vellore',
    location: 'MedCare Hospital, Sector 12',
  },
  {
    id: 'doc-4',
    userId: 'usr-doctor-4',
    name: 'Dr. Anjali Desai',
    email: 'dr.desai@medcare.com',
    specialization: 'Pediatrician',
    workingHours: {
      mon: ['09:00', '17:00'],
      tue: ['09:00', '17:00'],
      wed: ['09:00', '17:00'],
      thu: ['09:00', '17:00'],
      fri: ['09:00', '17:00'],
    },
    slotDurationMin: 20,
    rating: 4.9,
    totalReviews: 312,
    experience: 10,
    bio: 'Compassionate pediatrician with expertise in child development, immunology, and adolescent medicine.',
    education: 'MD - Pediatrics, JIPMER Pondicherry',
    location: 'KidsCare Clinic, Civil Lines',
  },
  {
    id: 'doc-5',
    userId: 'usr-doctor-5',
    name: 'Dr. Vikram Singh',
    email: 'dr.singh@medcare.com',
    specialization: 'Neurologist',
    workingHours: {
      mon: ['10:00', '18:00'],
      tue: ['10:00', '18:00'],
      thu: ['10:00', '18:00'],
      fri: ['10:00', '18:00'],
    },
    slotDurationMin: 45,
    rating: 4.6,
    totalReviews: 67,
    experience: 18,
    bio: 'Experienced neurologist specializing in epilepsy, stroke management, and neurodegenerative disorders.',
    education: 'DM - Neurology, NIMHANS Bangalore',
    location: 'MedCare Hospital, Sector 12',
  },
  {
    id: 'doc-6',
    userId: 'usr-doctor-6',
    name: 'Dr. Meera Krishnan',
    email: 'dr.krishnan@medcare.com',
    specialization: 'General Physician',
    workingHours: {
      mon: ['08:00', '20:00'],
      tue: ['08:00', '20:00'],
      wed: ['08:00', '20:00'],
      thu: ['08:00', '20:00'],
      fri: ['08:00', '20:00'],
      sat: ['09:00', '14:00'],
    },
    slotDurationMin: 15,
    rating: 4.8,
    totalReviews: 456,
    experience: 8,
    bio: 'General physician focused on preventive healthcare, chronic disease management, and holistic wellness.',
    education: 'MBBS, MD - Internal Medicine, Grant Medical College',
    location: 'HealthFirst Clinic, Station Road',
  },
];

// ========================================
// Mock Appointments
// ========================================

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 5);

function formatDate(d: Date, hours: number, minutes: number): string {
  const date = new Date(d);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    doctorId: 'doc-1',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Arun Patel',
    doctorSpecialization: 'Cardiologist',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(tomorrow, 10, 0),
    slotEnd: formatDate(tomorrow, 10, 30),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
    preVisitSummary: {
      id: 'pvs-1',
      rawSymptoms: 'Experiencing chest pain during exercise, shortness of breath, and occasional dizziness for the past 2 weeks.',
      rawInput: 'Experiencing chest pain during exercise, shortness of breath, and occasional dizziness for the past 2 weeks.',
      urgencyLevel: 'MEDIUM',
      chiefComplaint: 'Exercise-induced chest pain with associated dyspnea',
      differentialDiagnosis: ['Stable angina', 'Exercise-induced asthma', 'Musculoskeletal chest pain', 'GERD-related chest discomfort'],
      redFlags: ['Chest pain during exertion', 'Associated shortness of breath'],
      suggestedQuestions: [
        'When did you first notice the chest pain during exercise?',
        'Do you have a family history of heart disease?',
        'Are you currently taking any medications or supplements?',
      ],
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-2',
    doctorId: 'doc-2',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'Dermatologist',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(dayAfter, 14, 0),
    slotEnd: formatDate(dayAfter, 14, 20),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
    preVisitSummary: {
      id: 'pvs-2',
      rawSymptoms: 'Persistent rash on forearms for 3 weeks, itchy and red. Over-the-counter creams have not helped.',
      urgencyLevel: 'LOW',
      chiefComplaint: 'Persistent pruritic rash on bilateral forearms',
      suggestedQuestions: [
        'Have you changed any soaps, detergents, or skincare products recently?',
        'Do you have any known allergies?',
        'Has anyone else in your household developed a similar rash?',
      ],
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-3',
    doctorId: 'doc-6',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Meera Krishnan',
    doctorSpecialization: 'General Physician',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(lastWeek, 11, 0),
    slotEnd: formatDate(lastWeek, 11, 15),
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    preVisitSummary: {
      id: 'pvs-3',
      rawSymptoms: 'Recurring headaches, fatigue, and mild fever for the past week. Difficulty sleeping.',
      rawInput: 'Recurring headaches, fatigue, and mild fever for the past week. Difficulty sleeping.',
      urgencyLevel: 'LOW',
      chiefComplaint: 'Recurrent tension headaches with fatigue',
      differentialDiagnosis: ['Tension-type headache', 'Sleep deprivation syndrome', 'Viral upper respiratory infection', 'Stress-related fatigue'],
      suggestedQuestions: [
        'How would you rate the intensity of your headaches on a scale of 1-10?',
        'Have you been under more stress than usual?',
        'How many hours of sleep are you getting per night?',
      ],
      llmStatus: 'OK',
    },
    postVisitNote: {
      id: 'pvn-1',
      clinicalNotes: 'Patient presents with tension-type headaches likely related to work stress and poor sleep hygiene. Vitals normal. No neurological deficits observed.',
      prescription: [
        { medication: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', durationDays: 5 },
        { medication: 'Melatonin', dosage: '3mg', frequency: 'Once at bedtime', durationDays: 14 },
      ],
      patientSummary: "Your headaches appear to be related to stress and sleep difficulties. I've prescribed a mild pain reliever and a sleep aid. Try to maintain a regular sleep schedule, limit screen time before bed, and consider stress-reduction techniques like meditation. Follow up in 2 weeks if symptoms persist.",
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-4',
    doctorId: 'doc-3',
    patientId: 'pat-2',
    doctorName: 'Dr. Rahul Mehta',
    doctorSpecialization: 'Orthopedic Surgeon',
    patientName: 'Amit Kumar',
    slotStart: formatDate(tomorrow, 11, 0),
    slotEnd: formatDate(tomorrow, 11, 30),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
    preVisitSummary: {
      id: 'pvs-4',
      rawSymptoms: 'Severe knee pain after a fall during sports. Swelling and difficulty walking. Pain intensifies when climbing stairs.',
      rawInput: 'Severe knee pain after a fall during sports. Swelling and difficulty walking. Pain intensifies when climbing stairs.',
      urgencyLevel: 'HIGH',
      chiefComplaint: 'Acute knee injury with swelling post-trauma',
      differentialDiagnosis: ['ACL tear', 'Meniscus tear', 'Patellar fracture', 'Ligament sprain'],
      redFlags: ['Acute trauma with significant swelling', 'Inability to bear weight', 'Possible ligament rupture'],
      suggestedQuestions: [
        'Can you describe exactly how the injury occurred?',
        'Have you had any previous knee injuries?',
        'Did you hear a popping sound when the injury occurred?',
      ],
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-5',
    doctorId: 'doc-4',
    patientId: 'pat-3',
    doctorName: 'Dr. Anjali Desai',
    doctorSpecialization: 'Pediatrician',
    patientName: 'Riya Verma',
    slotStart: formatDate(tomorrow, 15, 0),
    slotEnd: formatDate(tomorrow, 15, 20),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-6',
    doctorId: 'doc-1',
    patientId: 'pat-4',
    doctorName: 'Dr. Arun Patel',
    doctorSpecialization: 'Cardiologist',
    patientName: 'Sunita Rao',
    slotStart: formatDate(today, 9, 0),
    slotEnd: formatDate(today, 9, 30),
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    postVisitNote: {
      id: 'pvn-2',
      clinicalNotes: 'Follow-up for hypertension management. BP well-controlled at 128/82. ECG normal. Continue current medications.',
      prescription: [
        { medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', durationDays: 30 },
        { medication: 'Aspirin', dosage: '75mg', frequency: 'Once daily', durationDays: 30 },
      ],
      patientSummary: 'Great news — your blood pressure is well-controlled with current medications. Continue taking your medicines as prescribed and maintain a low-sodium diet. Your next check-up is in 1 month.',
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-7',
    doctorId: 'doc-5',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Vikram Singh',
    doctorSpecialization: 'Neurologist',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(lastWeek, 14, 0),
    slotEnd: formatDate(lastWeek, 14, 45),
    status: 'CANCELLED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-8',
    doctorId: 'doc-2',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'Dermatologist',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(new Date(today.getTime() - 45 * 86400000), 10, 0),
    slotEnd: formatDate(new Date(today.getTime() - 45 * 86400000), 10, 20),
    status: 'COMPLETED',
    createdAt: new Date(today.getTime() - 50 * 86400000).toISOString(),
    preVisitSummary: {
      id: 'pvs-8',
      rawSymptoms: 'Severe acne breakout on face and back for the last 2 months.',
      rawInput: 'Severe acne breakout on face and back for the last 2 months.',
      urgencyLevel: 'LOW',
      chiefComplaint: 'Severe acne breakout',
      differentialDiagnosis: ['Acne vulgaris', 'Hormonal acne', 'Rosacea'],
      suggestedQuestions: [
        'Have you started any new medications or supplements?',
        'Are you using any new skincare products?',
      ],
      llmStatus: 'OK',
    },
    postVisitNote: {
      id: 'pvn-8',
      clinicalNotes: 'Patient presents with moderate to severe acne vulgaris. Prescribed topical and oral antibiotics.',
      prescription: [
        { medication: 'Doxycycline', dosage: '100mg', frequency: 'Once daily', durationDays: 30 },
        { medication: 'Tretinoin Cream', dosage: '0.025%', frequency: 'Apply nightly', durationDays: 60 },
      ],
      patientSummary: 'We discussed your acne breakout and I have prescribed an oral antibiotic along with a topical cream. Please use sunscreen daily as the cream makes your skin sensitive to the sun.',
      llmStatus: 'OK',
    },
  },
  {
    id: 'apt-9',
    doctorId: 'doc-1',
    patientId: 'usr-patient-1',
    doctorName: 'Dr. Arun Patel',
    doctorSpecialization: 'Cardiologist',
    patientName: 'Sarah Johnson',
    slotStart: formatDate(new Date(today.getTime() - 120 * 86400000), 11, 0),
    slotEnd: formatDate(new Date(today.getTime() - 120 * 86400000), 11, 30),
    status: 'COMPLETED',
    createdAt: new Date(today.getTime() - 125 * 86400000).toISOString(),
    preVisitSummary: {
      id: 'pvs-9',
      rawSymptoms: 'Routine heart checkup and occasional palpitations.',
      rawInput: 'Routine heart checkup and occasional palpitations.',
      urgencyLevel: 'LOW',
      chiefComplaint: 'Routine cardiac evaluation with mild palpitations',
      differentialDiagnosis: ['Benign premature ventricular contractions', 'Anxiety', 'Caffeine-induced palpitations'],
      suggestedQuestions: [
        'How much caffeine do you consume daily?',
        'Do the palpitations happen at rest or during exercise?',
      ],
      llmStatus: 'OK',
    },
    postVisitNote: {
      id: 'pvn-9',
      clinicalNotes: 'Routine evaluation. ECG is normal. Palpitations are likely benign PVCs related to caffeine intake.',
      prescription: [
        { medication: 'Propranolol', dosage: '10mg', frequency: 'As needed for palpitations', durationDays: 90 },
      ],
      patientSummary: 'Your heart looks healthy. The occasional flutters you feel are harmless and likely due to stress or caffeine. Cut back on coffee and take the prescribed medication only if the palpitations become bothersome.',
      llmStatus: 'OK',
    },
  },
];

// ========================================
// Mock Time Slots
// ========================================

export const mockTimeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: false },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: false },
  { time: '12:00', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: false },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
];

// ========================================
// Mock Doctor Leaves
// ========================================

export const mockDoctorLeaves: DoctorLeave[] = [
  {
    id: 'leave-1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arun Patel',
    leaveDate: formatDate(dayAfter, 0, 0).split('T')[0],
    reason: 'Medical conference',
  },
  {
    id: 'leave-2',
    doctorId: 'doc-3',
    doctorName: 'Dr. Rahul Mehta',
    leaveDate: formatDate(new Date(today.getTime() + 7 * 86400000), 0, 0).split('T')[0],
    reason: 'Personal leave',
  },
];

// ========================================
// Specializations
// ========================================

export const specializations = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Neurologist',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist',
];

