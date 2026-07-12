'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckIcon, SparklesIcon, MapPinIcon, StarFilledIcon,
  BriefcaseIcon, AlertTriangleIcon,
} from '@/components/Icons';
import { mockCurrentUser, mockDoctors, mockTimeSlots } from '@/lib/mockData';
import styles from './page.module.css';

const STEPS = ['Select Date & Time', 'Describe Symptoms', 'Confirm Booking'];

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;
  const doctor = mockDoctors.find(d => d.id === doctorId);

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Generate next 14 days for date picker
  const dates = useMemo(() => {
    const d: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      d.push(date);
    }
    return d;
  }, []);

  // Filter dates to only working days
  const workingDates = useMemo(() => {
    if (!doctor) return [];
    const dayMap: Record<number, string> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
    };
    return dates.filter(d => doctor.workingHours[dayMap[d.getDay()]]);
  }, [dates, doctor]);

  const canProceed = () => {
    if (step === 0) return selectedDate && selectedSlot;
    if (step === 1) return symptoms.trim().length >= 10;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBooked(true);
    setIsSubmitting(false);
  };

  if (!doctor) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
        <div className="main-content">
          <Navbar title="Book Appointment" />
          <main className="page-content">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Doctor not found</h3>
              <p className="empty-state-text">The doctor you&apos;re looking for doesn&apos;t exist.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
        <div className="main-content">
          <Navbar title="Booking Confirmed" />
          <main className="page-content">
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <CheckIcon size={40} />
              </div>
              <h2>Appointment Booked! 🎉</h2>
              <p>Your appointment with <strong>{doctor.name}</strong> has been confirmed.</p>
              <div className={styles.successDetails}>
                <div className={styles.successDetailItem}>
                  <CalendarIcon size={16} />
                  <span>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className={styles.successDetailItem}>
                  <ClockIcon size={16} />
                  <span>{selectedSlot}</span>
                </div>
                <div className={styles.successDetailItem}>
                  <MapPinIcon size={16} />
                  <span>{doctor.location}</span>
                </div>
              </div>
              <div className={styles.aiProcessing}>
                <SparklesIcon size={16} style={{ color: 'var(--primary-500)' }} />
                <span>AI is generating your pre-visit summary based on your symptoms...</span>
              </div>
              <div className={styles.successActions}>
                <button className="btn btn-primary" onClick={() => router.push('/patient/appointments')}>
                  View My Appointments
                </button>
                <button className="btn btn-secondary" onClick={() => router.push('/patient')}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
      <div className="main-content">
        <Navbar title="Book Appointment" subtitle={`with ${doctor.name}`} />
        <main className="page-content">
          <div className={styles.bookingLayout}>
            {/* Left: Doctor Info Card */}
            <div className={styles.doctorSidebar}>
              <div className={`card ${styles.doctorInfoCard}`}>
                <div className="avatar avatar-xl avatar-primary" style={{ margin: '0 auto var(--space-4)' }}>
                  {getInitials(doctor.name)}
                </div>
                <h3 className={styles.doctorName}>{doctor.name}</h3>
                <p className={styles.doctorSpec}>{doctor.specialization}</p>
                <div className={styles.doctorRating}>
                  <StarFilledIcon size={14} style={{ color: 'var(--accent-500)' }} />
                  <span>{doctor.rating}</span>
                  <span className={styles.ratingCount}>({doctor.totalReviews} reviews)</span>
                </div>
                <div className={styles.doctorMetaList}>
                  <div className={styles.metaRow}>
                    <BriefcaseIcon size={14} />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className={styles.metaRow}>
                    <MapPinIcon size={14} />
                    <span>{doctor.location}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <ClockIcon size={14} />
                    <span>{doctor.slotDurationMin} min per slot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Booking Steps */}
            <div className={styles.bookingContent}>
              {/* Steps Progress */}
              <div className="steps">
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <div className={`step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                      <div className="step-number">
                        {i < step ? <CheckIcon size={14} /> : i + 1}
                      </div>
                      <span className="step-label">{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`step-connector ${i < step ? 'completed' : ''}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className={`card ${styles.stepCard} animate-fade-in`}>
                {step === 0 && (
                  <Step1DateSlot
                    workingDates={workingDates}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    slotDuration={doctor.slotDurationMin}
                  />
                )}
                {step === 1 && (
                  <Step2Symptoms
                    symptoms={symptoms}
                    setSymptoms={setSymptoms}
                  />
                )}
                {step === 2 && (
                  <Step3Confirm
                    doctor={doctor}
                    selectedDate={selectedDate!}
                    selectedSlot={selectedSlot!}
                    symptoms={symptoms}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className={styles.stepNav}>
                {step > 0 && (
                  <button className="btn btn-secondary" onClick={handleBack}>
                    <ChevronLeftIcon size={16} /> Back
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {step < STEPS.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Continue <ChevronRightIcon size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className={styles.spinner} /> Booking...
                      </>
                    ) : (
                      <>
                        <CheckIcon size={18} /> Confirm Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ========== Step 1: Date & Slot Selection ==========
function Step1DateSlot({
  workingDates, selectedDate, setSelectedDate,
  selectedSlot, setSelectedSlot, slotDuration,
}: {
  workingDates: Date[];
  selectedDate: Date | null;
  setSelectedDate: (d: Date) => void;
  selectedSlot: string | null;
  setSelectedSlot: (s: string) => void;
  slotDuration: number;
}) {
  return (
    <div>
      <h3 className={styles.stepTitle}>Select a Date</h3>
      <p className={styles.stepDesc}>Choose a preferred date for your appointment.</p>

      <div className={styles.dateGrid}>
        {workingDates.map((d) => {
          const isSelected = selectedDate?.toDateString() === d.toDateString();
          return (
            <button
              key={d.toISOString()}
              className={`${styles.dateCard} ${isSelected ? styles.dateSelected : ''}`}
              onClick={() => { setSelectedDate(d); setSelectedSlot(''); }}
            >
              <span className={styles.dateDay}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={styles.dateNum}>{d.getDate()}</span>
              <span className={styles.dateMonth}>
                {d.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <>
          <h3 className={styles.stepTitle} style={{ marginTop: 'var(--space-8)' }}>
            Available Slots — {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <p className={styles.stepDesc}>{slotDuration}-minute appointments. Green slots are available.</p>

          <div className={styles.slotGrid}>
            {mockTimeSlots.map((slot) => (
              <button
                key={slot.time}
                className={`${styles.slotChip} ${!slot.available ? styles.slotUnavailable : ''} ${selectedSlot === slot.time ? styles.slotSelected : ''}`}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.time)}
              >
                <ClockIcon size={14} />
                {slot.time}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ========== Step 2: Symptoms Form ==========
function Step2Symptoms({
  symptoms, setSymptoms,
}: {
  symptoms: string;
  setSymptoms: (s: string) => void;
}) {
  return (
    <div>
      <h3 className={styles.stepTitle}>Describe Your Symptoms</h3>
      <p className={styles.stepDesc}>
        Help your doctor prepare for your visit. Our AI will generate a pre-visit summary.
      </p>

      <div className={styles.aiNotice}>
        <SparklesIcon size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
        <div>
          <strong>AI-Powered Analysis</strong>
          <p>Your symptoms will be analyzed by Gemini AI to generate urgency level, chief complaint, and suggested questions for your doctor.</p>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
        <label className="form-label" htmlFor="symptoms">
          Symptoms & Concerns <span style={{ color: 'var(--danger-500)' }}>*</span>
        </label>
        <textarea
          id="symptoms"
          className="form-textarea"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail. For example: 'I have been experiencing headaches for the past 3 days, mostly in the morning. The pain is moderate and centered around my temples...'"
          style={{ minHeight: 180 }}
        />
        <div className={styles.charCount}>
          <span style={{ color: symptoms.length < 10 ? 'var(--danger-500)' : 'var(--success-500)' }}>
            {symptoms.length} characters
          </span>
          <span> · Minimum 10 characters required</span>
        </div>
      </div>

      <div className={styles.symptomHints}>
        <h4>Tips for a better summary:</h4>
        <ul>
          <li>Describe when the symptoms started</li>
          <li>Mention the severity (mild, moderate, severe)</li>
          <li>Include any medications you&apos;re currently taking</li>
          <li>Note if symptoms worsen at specific times</li>
        </ul>
      </div>
    </div>
  );
}

// ========== Step 3: Confirmation ==========
function Step3Confirm({
  doctor, selectedDate, selectedSlot, symptoms,
}: {
  doctor: (typeof mockDoctors)[0];
  selectedDate: Date;
  selectedSlot: string;
  symptoms: string;
}) {
  const endTime = (() => {
    const [h, m] = selectedSlot.split(':').map(Number);
    const totalMin = h * 60 + m + doctor.slotDurationMin;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  })();

  return (
    <div>
      <h3 className={styles.stepTitle}>Confirm Your Appointment</h3>
      <p className={styles.stepDesc}>Review the details below and confirm your booking.</p>

      <div className={styles.confirmGrid}>
        <div className={styles.confirmSection}>
          <h4>Doctor</h4>
          <div className={styles.confirmRow}>
            <div className="avatar avatar-primary">{getInitials(doctor.name)}</div>
            <div>
              <strong>{doctor.name}</strong>
              <p>{doctor.specialization}</p>
            </div>
          </div>
        </div>

        <div className={styles.confirmSection}>
          <h4>Schedule</h4>
          <div className={styles.confirmDetail}>
            <CalendarIcon size={16} />
            <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className={styles.confirmDetail}>
            <ClockIcon size={16} />
            <span>{selectedSlot} — {endTime} ({doctor.slotDurationMin} minutes)</span>
          </div>
          <div className={styles.confirmDetail}>
            <MapPinIcon size={16} />
            <span>{doctor.location}</span>
          </div>
        </div>

        <div className={styles.confirmSection}>
          <h4>Your Symptoms</h4>
          <p className={styles.symptomPreview}>{symptoms}</p>
        </div>
      </div>

      <div className={styles.holdNotice}>
        <AlertTriangleIcon size={16} style={{ color: 'var(--warning-500)', flexShrink: 0 }} />
        <span>This slot will be held for <strong>10 minutes</strong> while you confirm. If not confirmed, it will be released for others.</span>
      </div>
    </div>
  );
}
