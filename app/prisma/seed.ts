import { PrismaClient, Role, AppointmentStatus, UrgencyLevel, LLMStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Initialize adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean up existing data (in reverse dependency order)
  await prisma.prescriptionItem.deleteMany();
  await prisma.preVisitSummary.deleteMany();
  await prisma.postVisitNote.deleteMany();
  await prisma.doctorReview.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorLeave.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.specialization.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data.\n');

  // ========================================
  // 1. Specializations
  // ========================================
  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist',
    'Orthopedic Surgeon', 'Pediatrician', 'Neurologist',
    'Gynecologist', 'ENT Specialist', 'Ophthalmologist', 'Psychiatrist',
  ];

  for (const name of specializations) {
    await prisma.specialization.create({ data: { name } });
  }
  console.log(`✅ Created ${specializations.length} specializations.`);

  // ========================================
  // 2. Users
  // ========================================
  const defaultPassword = await hashPassword('Password123!');

  // --- Patient Users ---
  const patientUser1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@email.com',
      passwordHash: defaultPassword,
      name: 'Sarah Johnson',
      role: Role.PATIENT,
    },
  });

  const patientUser2 = await prisma.user.create({
    data: {
      email: 'amit.kumar@email.com',
      passwordHash: defaultPassword,
      name: 'Amit Kumar',
      role: Role.PATIENT,
    },
  });

  const patientUser3 = await prisma.user.create({
    data: {
      email: 'riya.verma@email.com',
      passwordHash: defaultPassword,
      name: 'Riya Verma',
      role: Role.PATIENT,
    },
  });

  const patientUser4 = await prisma.user.create({
    data: {
      email: 'sunita.rao@email.com',
      passwordHash: defaultPassword,
      name: 'Sunita Rao',
      role: Role.PATIENT,
    },
  });

  // --- Doctor Users ---
  const doctorUser1 = await prisma.user.create({
    data: {
      email: 'dr.patel@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Arun Patel',
      role: Role.DOCTOR,
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      email: 'dr.sharma@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Priya Sharma',
      role: Role.DOCTOR,
    },
  });

  const doctorUser3 = await prisma.user.create({
    data: {
      email: 'dr.mehta@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Rahul Mehta',
      role: Role.DOCTOR,
    },
  });

  const doctorUser4 = await prisma.user.create({
    data: {
      email: 'dr.desai@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Anjali Desai',
      role: Role.DOCTOR,
    },
  });

  const doctorUser5 = await prisma.user.create({
    data: {
      email: 'dr.singh@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Vikram Singh',
      role: Role.DOCTOR,
    },
  });

  const doctorUser6 = await prisma.user.create({
    data: {
      email: 'dr.krishnan@medcare.com',
      passwordHash: defaultPassword,
      name: 'Dr. Meera Krishnan',
      role: Role.DOCTOR,
    },
  });

  // --- Admin User ---
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@medcare.com',
      passwordHash: defaultPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Created ${11} users (4 patients, 6 doctors, 1 admin).`);

  // ========================================
  // 3. Patient Profiles
  // ========================================
  const patientProfile1 = await prisma.patientProfile.create({
    data: {
      userId: patientUser1.id,
      phone: '+91 98765 43210',
      gender: 'Female',
      bloodGroup: 'O+',
    },
  });

  const patientProfile2 = await prisma.patientProfile.create({
    data: {
      userId: patientUser2.id,
      phone: '+91 87654 32109',
      gender: 'Male',
      bloodGroup: 'B+',
    },
  });

  const patientProfile3 = await prisma.patientProfile.create({
    data: {
      userId: patientUser3.id,
      phone: '+91 76543 21098',
      gender: 'Female',
      bloodGroup: 'A+',
    },
  });

  const patientProfile4 = await prisma.patientProfile.create({
    data: {
      userId: patientUser4.id,
      phone: '+91 65432 10987',
      gender: 'Female',
      bloodGroup: 'AB+',
    },
  });

  console.log(`✅ Created 4 patient profiles.`);

  // ========================================
  // 4. Doctor Profiles
  // ========================================
  const docProfile1 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser1.id,
      specialization: 'Cardiologist',
      experience: 15,
      bio: 'Board-certified cardiologist with 15 years of experience in interventional cardiology and preventive heart care.',
      education: 'MD - Cardiology, AIIMS Delhi',
      location: 'MedCare Hospital, Sector 12',
      slotDurationMin: 30,
      rating: 4.8,
      totalReviews: 127,
      workingHours: {
        mon: ['09:00', '17:00'],
        tue: ['09:00', '17:00'],
        wed: ['09:00', '13:00'],
        thu: ['09:00', '17:00'],
        fri: ['09:00', '17:00'],
      },
    },
  });

  const docProfile2 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser2.id,
      specialization: 'Dermatologist',
      experience: 12,
      bio: 'Specialist in clinical dermatology, cosmetic procedures, and skin cancer treatment with expertise in advanced laser therapies.',
      education: 'MD - Dermatology, KEM Hospital Mumbai',
      location: 'SkinCare Clinic, MG Road',
      slotDurationMin: 20,
      rating: 4.9,
      totalReviews: 203,
      workingHours: {
        mon: ['10:00', '18:00'],
        tue: ['10:00', '18:00'],
        wed: ['10:00', '18:00'],
        thu: ['10:00', '18:00'],
        fri: ['10:00', '14:00'],
      },
    },
  });

  const docProfile3 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser3.id,
      specialization: 'Orthopedic Surgeon',
      experience: 20,
      bio: 'Senior orthopedic surgeon specializing in joint replacements, sports injuries, and minimally invasive surgical techniques.',
      education: 'MS - Orthopedics, CMC Vellore',
      location: 'MedCare Hospital, Sector 12',
      slotDurationMin: 30,
      rating: 4.7,
      totalReviews: 89,
      workingHours: {
        mon: ['08:00', '16:00'],
        tue: ['08:00', '16:00'],
        wed: ['08:00', '16:00'],
        thu: ['08:00', '16:00'],
        fri: ['08:00', '12:00'],
      },
    },
  });

  const docProfile4 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser4.id,
      specialization: 'Pediatrician',
      experience: 10,
      bio: 'Compassionate pediatrician with expertise in child development, immunology, and adolescent medicine.',
      education: 'MD - Pediatrics, JIPMER Pondicherry',
      location: 'KidsCare Clinic, Civil Lines',
      slotDurationMin: 20,
      rating: 4.9,
      totalReviews: 312,
      workingHours: {
        mon: ['09:00', '17:00'],
        tue: ['09:00', '17:00'],
        wed: ['09:00', '17:00'],
        thu: ['09:00', '17:00'],
        fri: ['09:00', '17:00'],
      },
    },
  });

  const docProfile5 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser5.id,
      specialization: 'Neurologist',
      experience: 18,
      bio: 'Experienced neurologist specializing in epilepsy, stroke management, and neurodegenerative disorders.',
      education: 'DM - Neurology, NIMHANS Bangalore',
      location: 'MedCare Hospital, Sector 12',
      slotDurationMin: 45,
      rating: 4.6,
      totalReviews: 67,
      workingHours: {
        mon: ['10:00', '18:00'],
        tue: ['10:00', '18:00'],
        thu: ['10:00', '18:00'],
        fri: ['10:00', '18:00'],
      },
    },
  });

  const docProfile6 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser6.id,
      specialization: 'General Physician',
      experience: 8,
      bio: 'General physician focused on preventive healthcare, chronic disease management, and holistic wellness.',
      education: 'MBBS, MD - Internal Medicine, Grant Medical College',
      location: 'HealthFirst Clinic, Station Road',
      slotDurationMin: 15,
      rating: 4.8,
      totalReviews: 456,
      workingHours: {
        mon: ['08:00', '20:00'],
        tue: ['08:00', '20:00'],
        wed: ['08:00', '20:00'],
        thu: ['08:00', '20:00'],
        fri: ['08:00', '20:00'],
        sat: ['09:00', '14:00'],
      },
    },
  });

  console.log(`✅ Created 6 doctor profiles.`);

  // ========================================
  // 5. Appointments with Clinical Records
  // ========================================
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 5);

  function makeDate(base: Date, hours: number, minutes: number): Date {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  // --- Appointment 1: Sarah → Dr. Patel (BOOKED, with pre-visit AI) ---
  const apt1 = await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile1.id,
      status: AppointmentStatus.BOOKED,
      slotStart: makeDate(tomorrow, 10, 0),
      slotEnd: makeDate(tomorrow, 10, 30),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Experiencing chest pain during exercise, shortness of breath, and occasional dizziness for the past 2 weeks.',
          urgencyLevel: UrgencyLevel.MEDIUM,
          chiefComplaint: 'Exercise-induced chest pain with associated dyspnea',
          differentialDiagnosis: ['Stable angina', 'Exercise-induced asthma', 'Musculoskeletal chest pain', 'GERD-related chest discomfort'],
          redFlags: ['Chest pain during exertion', 'Associated shortness of breath'],
          suggestedQuestions: [
            'When did you first notice the chest pain during exercise?',
            'Do you have a family history of heart disease?',
            'Are you currently taking any medications or supplements?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
    },
  });

  // --- Appointment 2: Sarah → Dr. Sharma (BOOKED, with pre-visit AI) ---
  const apt2 = await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile2.id,
      status: AppointmentStatus.BOOKED,
      slotStart: makeDate(dayAfter, 14, 0),
      slotEnd: makeDate(dayAfter, 14, 20),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Persistent rash on forearms for 3 weeks, itchy and red. Over-the-counter creams have not helped.',
          urgencyLevel: UrgencyLevel.LOW,
          chiefComplaint: 'Persistent pruritic rash on bilateral forearms',
          suggestedQuestions: [
            'Have you changed any soaps, detergents, or skincare products recently?',
            'Do you have any known allergies?',
            'Has anyone else in your household developed a similar rash?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
    },
  });

  // --- Appointment 3: Sarah → Dr. Krishnan (COMPLETED, with both pre & post visit) ---
  const apt3 = await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile6.id,
      status: AppointmentStatus.COMPLETED,
      slotStart: makeDate(lastWeek, 11, 0),
      slotEnd: makeDate(lastWeek, 11, 15),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Recurring headaches, fatigue, and mild fever for the past week. Difficulty sleeping.',
          urgencyLevel: UrgencyLevel.LOW,
          chiefComplaint: 'Recurrent tension headaches with fatigue',
          differentialDiagnosis: ['Tension-type headache', 'Sleep deprivation syndrome', 'Viral upper respiratory infection', 'Stress-related fatigue'],
          suggestedQuestions: [
            'How would you rate the intensity of your headaches on a scale of 1-10?',
            'Have you been under more stress than usual?',
            'How many hours of sleep are you getting per night?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
      postVisitNote: {
        create: {
          clinicalNotes: 'Patient presents with tension-type headaches likely related to work stress and poor sleep hygiene. Vitals normal. No neurological deficits observed.',
          patientSummary: "Your headaches appear to be related to stress and sleep difficulties. I've prescribed a mild pain reliever and a sleep aid. Try to maintain a regular sleep schedule, limit screen time before bed, and consider stress-reduction techniques like meditation. Follow up in 2 weeks if symptoms persist.",
          followUpRecommended: true,
          followUpDays: 14,
          llmStatus: LLMStatus.OK,
          prescriptions: {
            create: [
              { medication: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', durationDays: 5 },
              { medication: 'Melatonin', dosage: '3mg', frequency: 'Once at bedtime', durationDays: 14 },
            ],
          },
        },
      },
    },
  });

  // --- Appointment 4: Amit → Dr. Mehta (BOOKED, with pre-visit AI) ---
  const apt4 = await prisma.appointment.create({
    data: {
      patientId: patientProfile2.id,
      doctorId: docProfile3.id,
      status: AppointmentStatus.BOOKED,
      slotStart: makeDate(tomorrow, 11, 0),
      slotEnd: makeDate(tomorrow, 11, 30),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Severe knee pain after a fall during sports. Swelling and difficulty walking. Pain intensifies when climbing stairs.',
          urgencyLevel: UrgencyLevel.HIGH,
          chiefComplaint: 'Acute knee injury with swelling post-trauma',
          differentialDiagnosis: ['ACL tear', 'Meniscus tear', 'Patellar fracture', 'Ligament sprain'],
          redFlags: ['Acute trauma with significant swelling', 'Inability to bear weight', 'Possible ligament rupture'],
          suggestedQuestions: [
            'Can you describe exactly how the injury occurred?',
            'Have you had any previous knee injuries?',
            'Did you hear a popping sound when the injury occurred?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
    },
  });

  // --- Appointment 5: Riya → Dr. Desai (BOOKED, no pre-visit) ---
  await prisma.appointment.create({
    data: {
      patientId: patientProfile3.id,
      doctorId: docProfile4.id,
      status: AppointmentStatus.BOOKED,
      slotStart: makeDate(tomorrow, 15, 0),
      slotEnd: makeDate(tomorrow, 15, 20),
    },
  });

  // --- Appointment 6: Sunita → Dr. Patel (COMPLETED, with post-visit only) ---
  await prisma.appointment.create({
    data: {
      patientId: patientProfile4.id,
      doctorId: docProfile1.id,
      status: AppointmentStatus.COMPLETED,
      slotStart: makeDate(today, 9, 0),
      slotEnd: makeDate(today, 9, 30),
      postVisitNote: {
        create: {
          clinicalNotes: 'Follow-up for hypertension management. BP well-controlled at 128/82. ECG normal. Continue current medications.',
          patientSummary: 'Great news — your blood pressure is well-controlled with current medications. Continue taking your medicines as prescribed and maintain a low-sodium diet. Your next check-up is in 1 month.',
          followUpRecommended: true,
          followUpDays: 30,
          llmStatus: LLMStatus.OK,
          prescriptions: {
            create: [
              { medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', durationDays: 30 },
              { medication: 'Aspirin', dosage: '75mg', frequency: 'Once daily', durationDays: 30 },
            ],
          },
        },
      },
    },
  });

  // --- Appointment 7: Sarah → Dr. Singh (CANCELLED) ---
  await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile5.id,
      status: AppointmentStatus.CANCELLED,
      slotStart: makeDate(lastWeek, 14, 0),
      slotEnd: makeDate(lastWeek, 14, 45),
      cancelReason: 'Schedule conflict',
    },
  });

  // --- Appointment 8: Sarah → Dr. Sharma (COMPLETED, older) ---
  const olderDate1 = new Date(today.getTime() - 45 * 86400000);
  await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile2.id,
      status: AppointmentStatus.COMPLETED,
      slotStart: makeDate(olderDate1, 10, 0),
      slotEnd: makeDate(olderDate1, 10, 20),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Severe acne breakout on face and back for the last 2 months.',
          urgencyLevel: UrgencyLevel.LOW,
          chiefComplaint: 'Severe acne breakout',
          differentialDiagnosis: ['Acne vulgaris', 'Hormonal acne', 'Rosacea'],
          suggestedQuestions: [
            'Have you started any new medications or supplements?',
            'Are you using any new skincare products?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
      postVisitNote: {
        create: {
          clinicalNotes: 'Patient presents with moderate to severe acne vulgaris. Prescribed topical and oral antibiotics.',
          patientSummary: 'We discussed your acne breakout and I have prescribed an oral antibiotic along with a topical cream. Please use sunscreen daily as the cream makes your skin sensitive to the sun.',
          llmStatus: LLMStatus.OK,
          prescriptions: {
            create: [
              { medication: 'Doxycycline', dosage: '100mg', frequency: 'Once daily', durationDays: 30 },
              { medication: 'Tretinoin Cream', dosage: '0.025%', frequency: 'Apply nightly', durationDays: 60 },
            ],
          },
        },
      },
    },
  });

  // --- Appointment 9: Sarah → Dr. Patel (COMPLETED, much older) ---
  const olderDate2 = new Date(today.getTime() - 120 * 86400000);
  await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: docProfile1.id,
      status: AppointmentStatus.COMPLETED,
      slotStart: makeDate(olderDate2, 11, 0),
      slotEnd: makeDate(olderDate2, 11, 30),
      preVisitSummary: {
        create: {
          rawSymptoms: 'Routine heart checkup and occasional palpitations.',
          urgencyLevel: UrgencyLevel.LOW,
          chiefComplaint: 'Routine cardiac evaluation with mild palpitations',
          differentialDiagnosis: ['Benign premature ventricular contractions', 'Anxiety', 'Caffeine-induced palpitations'],
          suggestedQuestions: [
            'How much caffeine do you consume daily?',
            'Do the palpitations happen at rest or during exercise?',
          ],
          llmStatus: LLMStatus.OK,
        },
      },
      postVisitNote: {
        create: {
          clinicalNotes: 'Routine evaluation. ECG is normal. Palpitations are likely benign PVCs related to caffeine intake.',
          patientSummary: 'Your heart looks healthy. The occasional flutters you feel are harmless and likely due to stress or caffeine. Cut back on coffee and take the prescribed medication only if the palpitations become bothersome.',
          llmStatus: LLMStatus.OK,
          prescriptions: {
            create: [
              { medication: 'Propranolol', dosage: '10mg', frequency: 'As needed for palpitations', durationDays: 90 },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Created 9 appointments with clinical records and prescriptions.`);

  // ========================================
  // 6. Doctor Leaves
  // ========================================
  await prisma.doctorLeave.create({
    data: {
      doctorId: docProfile1.id,
      startDate: dayAfter,
      endDate: dayAfter,
      reason: 'Medical conference',
    },
  });

  const weekFromNow = new Date(today.getTime() + 7 * 86400000);
  const nineFromNow = new Date(today.getTime() + 9 * 86400000);
  await prisma.doctorLeave.create({
    data: {
      doctorId: docProfile3.id,
      startDate: weekFromNow,
      endDate: nineFromNow,
      reason: 'Personal leave',
    },
  });

  console.log(`✅ Created 2 doctor leaves.`);

  // ========================================
  // 7. Notifications
  // ========================================
  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser1.id,
        type: 'REMINDER',
        title: 'Upcoming Appointment',
        message: 'You have an appointment with Dr. Arun Patel tomorrow at 10:00 AM.',
        link: '/patient/appointments',
        read: false,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        userId: patientUser1.id,
        type: 'PRESCRIPTION',
        title: 'New Prescription Added',
        message: 'Dr. Priya Sharma has added a new prescription to your records.',
        link: '/patient/prescriptions',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: doctorUser1.id,
        type: 'NEW_APPOINTMENT',
        title: 'New Booking',
        message: 'Sarah Johnson has booked an appointment for tomorrow at 10:00 AM.',
        link: '/doctor/appointments',
        read: false,
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        userId: doctorUser1.id,
        type: 'SYSTEM',
        title: 'AI Summary Ready',
        message: 'An AI pre-visit summary is ready for your appointment with Sunita Rao.',
        link: '/doctor/appointments',
        read: true,
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });

  console.log(`✅ Created 4 notifications.`);

  // ========================================
  // 8. Doctor Reviews
  // ========================================
  await prisma.doctorReview.createMany({
    data: [
      {
        doctorId: docProfile1.id,
        authorId: patientUser1.id,
        rating: 5,
        comment: 'Dr. Patel is very thorough and patient. Highly recommended!',
      },
      {
        doctorId: docProfile6.id,
        authorId: patientUser1.id,
        rating: 4,
        comment: 'Dr. Krishnan explained everything clearly. Great experience overall.',
      },
      {
        doctorId: docProfile2.id,
        authorId: patientUser1.id,
        rating: 5,
        comment: 'Amazing dermatologist. My skin has improved significantly.',
      },
    ],
  });

  console.log(`✅ Created 3 doctor reviews.`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Default login credentials for all users: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
