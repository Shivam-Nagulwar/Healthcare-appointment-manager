'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckIcon, SparklesIcon, MapPinIcon, StarFilledIcon,
  BriefcaseIcon, AlertTriangleIcon,
} from '@/components/Icons';
import styles from './page.module.css';
import { bookAppointment, holdAppointmentSlot } from '@/actions/appointments';

const STEPS = ['Select Date & Time', 'Describe Symptoms', 'Confirm Booking'];

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  totalReviews: number;
  experience: number;
  location: string | null;
  slotDurationMin: number;
  workingHours: any;
};

// Generates time slots. e.g. 09:00, 09:30 based on doctor's slot duration
function generateTimeSlots(date: Date, workingHours: any, slotDurationMin: number, bookedSlots: {slotStart: string, slotEnd: string}[]) {
  const dayMap: Record<number, string> = {
    0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
  };
  const dayKey = dayMap[date.getDay()];
  
  if (!workingHours) return [];
  const hours = workingHours[dayKey];
  
  if (!hours || !Array.isArray(hours) || hours.length < 2) return [];
  
  const [startStr, endStr] = hours;
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  
  let current = new Date(date);
  current.setHours(startH, startM, 0, 0);
  
  const end = new Date(date);
  end.setHours(endH, endM, 0, 0);
  
  const slots = [];
  while (current < end) {
    const timeString = current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + slotDurationMin * 60000);
    
    // Check for overlap
    const isBooked = bookedSlots.some(booked => {
      const bStart = new Date(booked.slotStart);
      const bEnd = new Date(booked.slotEnd);
      return (slotStart < bEnd && slotEnd > bStart);
    });

    slots.push({
      time: timeString,
      available: !isBooked,
      slotStart,
      slotEnd,
    });
    current.setMinutes(current.getMinutes() + slotDurationMin);
  }
  return slots;
}

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: Date, onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, expiresAt.getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const m = Math.floor(timeLeft / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{m}:{s.toString().padStart(2, '0')}</span>;
}


export default function BookClient({ doctor, user, bookedSlots }: { doctor: Doctor, user: any, bookedSlots: {slotStart: string, slotEnd: string}[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{time: string, slotStart: Date, slotEnd: Date} | null>(null);
  
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);

  const [primarySymptom, setPrimarySymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

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

  const workingDates = useMemo(() => {
    const dayMap: Record<number, string> = {
      0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
    };
    return dates.filter(d => doctor.workingHours && doctor.workingHours[dayMap[d.getDay()]]);
  }, [dates, doctor]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate, doctor.workingHours, doctor.slotDurationMin, bookedSlots);
  }, [selectedDate, doctor, bookedSlots]);

  const canProceed = () => {
    if (step === 0) return selectedDate && selectedSlot;
    if (step === 1) return primarySymptom.trim() !== '' && duration.trim() !== '' && severity !== '';
    return true;
  };

  const handleNext = async () => {
    if (step === 0 && selectedSlot) {
      setIsSubmitting(true);
      try {
        const res = await holdAppointmentSlot(doctor.id, selectedSlot.slotStart.toISOString(), selectedSlot.slotEnd.toISOString());
        if (res?.error) {
          alert(res.error);
          window.location.reload(); // Refresh slots
        } else if (res?.id) {
          setHoldId(res.id);
          setHoldExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
          setStep(step + 1);
        }
      } catch(e) {
        alert('Failed to reserve slot. Please try again.');
      }
      setIsSubmitting(false);
    } else if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleConfirm = async () => {
    if (!holdId) return;
    setIsSubmitting(true);
    
    try {
      const res = await bookAppointment(
        holdId,
        `Primary Symptom: ${primarySymptom}\nDuration: ${duration}\nSeverity: ${severity}\nAdditional Context: ${additionalContext}`
      );
      
      if (res?.error) {
        alert(res.error);
        if (res.error.toLowerCase().includes('expire')) {
          setStep(0);
          setHoldId(null);
          setHoldExpiresAt(null);
          setSelectedSlot(null);
        }
      } else {
        setIsBooked(true);
      }
    } catch (err) {
      console.error(err);
      alert('Error confirming appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="PATIENT" userName={user.name} userEmail={user.email} />
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
                  <span>{selectedSlot?.time}</span>
                </div>
                <div className={styles.successDetailItem}>
                  <MapPinIcon size={16} />
                  <span>{doctor.location || 'N/A'}</span>
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
      <Sidebar role="PATIENT" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Book Appointment" subtitle={`with ${doctor.name}`} />
        <main className="page-content">
          <div className={styles.bookingLayout}>
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
                    <span>{doctor.location || 'N/A'}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <ClockIcon size={14} />
                    <span>{doctor.slotDurationMin} min per slot</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bookingContent}>
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

              <div className={`card ${styles.stepCard} animate-fade-in`}>
                {holdExpiresAt && step > 0 && (
                  <div style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <ClockIcon size={16} />
                    <span>Slot temporarily reserved for: <CountdownTimer expiresAt={holdExpiresAt} onExpire={() => { alert('Reservation expired.'); setStep(0); setHoldId(null); setHoldExpiresAt(null); setSelectedSlot(null); }} /></span>
                  </div>
                )}
                
                {step === 0 && (
                  <Step1DateSlot
                    workingDates={workingDates}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    slotDuration={doctor.slotDurationMin}
                    slots={slots}
                  />
                )}
                {step === 1 && (
                  <Step2Symptoms
                    primarySymptom={primarySymptom} setPrimarySymptom={setPrimarySymptom}
                    duration={duration} setDuration={setDuration}
                    severity={severity} setSeverity={setSeverity}
                    additionalContext={additionalContext} setAdditionalContext={setAdditionalContext}
                  />
                )}
                {step === 2 && (
                  <Step3Confirm
                    doctor={doctor}
                    selectedDate={selectedDate!}
                    selectedSlot={selectedSlot!}
                    symptoms={`Primary Symptom: ${primarySymptom}\nDuration: ${duration}\nSeverity: ${severity}\nAdditional Context: ${additionalContext}`}
                  />
                )}
              </div>

              <div className={styles.stepNav}>
                {step > 0 && (
                  <button className="btn btn-secondary" onClick={handleBack}>
                    <ChevronLeftIcon size={16} /> Back
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button
                  className={step === STEPS.length - 1 ? "btn btn-primary btn-lg" : "btn btn-primary"}
                  onClick={step === STEPS.length - 1 ? handleConfirm : handleNext}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className={styles.spinner} /> Processing...</>
                  ) : (
                    step === STEPS.length - 1 ? <><CheckIcon size={16} /> Confirm Booking</> : <>Next <ChevronRightIcon size={16} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Step1DateSlot({
  workingDates, selectedDate, setSelectedDate,
  selectedSlot, setSelectedSlot, slotDuration, slots,
}: {
  workingDates: Date[];
  selectedDate: Date | null;
  setSelectedDate: (d: Date) => void;
  selectedSlot: any;
  setSelectedSlot: (s: any) => void;
  slotDuration: number;
  slots: {time: string, available: boolean, slotStart: Date, slotEnd: Date}[];
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
              onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
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
            {slots.map((slot) => (
              <button
                key={slot.time}
                className={`${styles.slotChip} ${!slot.available ? styles.slotUnavailable : ''} ${selectedSlot?.time === slot.time ? styles.slotSelected : ''}`}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot)}
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

function Step2Symptoms({ 
  primarySymptom, setPrimarySymptom,
  duration, setDuration,
  severity, setSeverity,
  additionalContext, setAdditionalContext
}: { 
  primarySymptom: string; setPrimarySymptom: (s: string) => void;
  duration: string; setDuration: (s: string) => void;
  severity: string; setSeverity: (s: string) => void;
  additionalContext: string; setAdditionalContext: (s: string) => void;
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'var(--space-6)' }}>
        <div className="form-group">
          <label className="form-label">
            Primary Symptom <span style={{ color: 'var(--danger-500)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            value={primarySymptom}
            onChange={(e) => setPrimarySymptom(e.target.value)}
            placeholder="e.g. Severe headache, Fever, Back pain"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Duration <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <input
              type="text"
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 3 days, 2 weeks"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Severity <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="">Select Severity</option>
              <option value="Mild (Noticeable but manageable)">Mild (Noticeable but manageable)</option>
              <option value="Moderate (Impacts daily activities)">Moderate (Impacts daily activities)</option>
              <option value="Severe (Unable to do daily tasks)">Severe (Unable to do daily tasks)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Context / Current Medications</label>
          <textarea
            className="form-textarea"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any other details your doctor should know?"
            style={{ minHeight: 100 }}
          />
        </div>
      </div>
    </div>
  );
}

function Step3Confirm({
  doctor, selectedDate, selectedSlot, symptoms,
}: {
  doctor: Doctor;
  selectedDate: Date;
  selectedSlot: { time: string, slotStart: Date, slotEnd: Date };
  symptoms: string;
}) {
  const endTime = selectedSlot.slotEnd.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

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
            <span>{selectedSlot.time} — {endTime} ({doctor.slotDurationMin} minutes)</span>
          </div>
          <div className={styles.confirmDetail}>
            <MapPinIcon size={16} />
            <span>{doctor.location || 'N/A'}</span>
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
