'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, SparklesIcon,
  AlertTriangleIcon, FileTextIcon, CheckIcon, PlusIcon,
  TrashIcon, ActivityIcon,
} from '@/components/Icons';
import { submitNotes } from '@/actions/notes';
import styles from './page.module.css';
import RetryAIButton from '@/components/RetryAIButton';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(dateStr: string | Date) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getUrgencyConfig(level: string) {
  const map: Record<string, { className: string; color: string; label: string }> = {
    LOW: { className: 'badge-success', color: 'var(--success-500)', label: 'Low' },
    MEDIUM: { className: 'badge-warning', color: 'var(--warning-500)', label: 'Medium' },
    HIGH: { className: 'badge-danger', color: 'var(--danger-500)', label: 'High' },
  };
  return map[level] || { className: 'badge-neutral', color: 'var(--slate-400)', label: level };
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function NotesClient({ appointment }: { appointment: any }) {
  const router = useRouter();

  const [notes, setNotes] = useState(appointment.postVisitNote?.clinicalNotes || '');
  const initialRx = appointment.postVisitNote?.prescriptions?.length > 0 
    ? appointment.postVisitNote.prescriptions.map((rx: any) => ({
        medication: rx.medication,
        dosage: rx.dosage,
        frequency: rx.frequency,
        duration: rx.durationDays.toString()
      }))
    : [{ medication: '', dosage: '', frequency: '', duration: '' }];

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialRx);
  const [followUp, setFollowUp] = useState(appointment.postVisitNote?.followUpRecommended || false);
  const [followUpDays, setFollowUpDays] = useState(appointment.postVisitNote?.followUpDays?.toString() || '7');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removePrescription = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const updatePrescription = (idx: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[idx][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitNotes(appointment.id, notes, prescriptions, followUp, followUpDays);
      setIsSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to save notes');
    }
    setIsSubmitting(false);
  };

  const preVisit = appointment.preVisitSummary;
  const patientName = appointment.patient.user.name;

  if (isSubmitted) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckIcon size={40} />
        </div>
        <h2>Notes Saved Successfully!</h2>
        <p>AI will generate a patient-friendly summary from your clinical notes.</p>
        <div className={styles.aiProcessing}>
          <SparklesIcon size={16} style={{ color: 'var(--primary-500)' }} />
          <span>Gemini is processing your notes into a patient-friendly summary...</span>
        </div>
        <div className={styles.successActions}>
          <button className="btn btn-primary" onClick={() => router.push('/doctor')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-ghost"
        onClick={() => router.push('/doctor')}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ChevronLeftIcon size={16} /> Back to Dashboard
      </button>

      <div className={styles.notesLayout}>
        {/* Main — Notes Form */}
        <div className={styles.mainCol}>
          {/* Patient Info Header */}
          <div className={`card ${styles.patientHeader}`}>
            <div className={styles.patientRow}>
              <div className="avatar avatar-lg avatar-accent">
                {getInitials(patientName)}
              </div>
              <div>
                <h2 className={styles.patientName}>{patientName}</h2>
                <div className={styles.appointmentMeta}>
                  <span><CalendarIcon size={14} /> {formatDate(appointment.slotStart)}</span>
                  <span><ClockIcon size={14} /> {formatTime(appointment.slotStart)} — {formatTime(appointment.slotEnd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className={`card ${styles.formCard}`}>
            <h3 className={styles.formTitle}>
              <FileTextIcon size={20} />
              Clinical Notes
            </h3>
            <p className={styles.formDesc}>
              Write your clinical observations and diagnosis. AI will convert this into a patient-friendly summary.
            </p>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your clinical notes here... Include diagnosis, findings, treatment plan, and any relevant observations."
              style={{ minHeight: 200 }}
            />
          </div>

          {/* Prescriptions */}
          <div className={`card ${styles.formCard}`}>
            <div className={styles.formTitleRow}>
              <h3 className={styles.formTitle}>
                <span>💊</span>
                Prescriptions
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={addPrescription}>
                <PlusIcon size={14} /> Add Medication
              </button>
            </div>

            <div className={styles.prescriptionsList}>
              {prescriptions.map((rx, idx) => (
                <div key={idx} className={styles.prescriptionForm}>
                  <div className={styles.rxHeader}>
                    <span className={styles.rxNumber}>#{idx + 1}</span>
                    {prescriptions.length > 1 && (
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => removePrescription(idx)}
                        style={{ color: 'var(--danger-500)' }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                  <div className={styles.rxFields}>
                    <div className="form-group">
                      <label className="form-label">Medication</label>
                      <input
                        className="form-input"
                        value={rx.medication}
                        onChange={(e) => updatePrescription(idx, 'medication', e.target.value)}
                        placeholder="e.g., Amoxicillin"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dosage</label>
                      <input
                        className="form-input"
                        value={rx.dosage}
                        onChange={(e) => updatePrescription(idx, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Frequency</label>
                      <input
                        className="form-input"
                        value={rx.frequency}
                        onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input
                        className="form-input"
                        value={rx.duration}
                        onChange={(e) => updatePrescription(idx, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Up */}
          <div className={`card ${styles.formCard}`}>
            <h3 className={styles.formTitle}>
              <CalendarIcon size={20} />
              Follow-Up
            </h3>
            <div className={styles.followUpRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={followUp}
                  onChange={(e) => setFollowUp(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.toggleSwitch} />
                Recommend follow-up appointment
              </label>
            </div>
            {followUp && (
              <div className={styles.followUpDays}>
                <label className="form-label">Follow-up in (days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  min="1"
                  max="365"
                  style={{ width: 120 }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className={styles.submitRow}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim()}
            >
              {isSubmitting ? (
                <><span className={styles.spinner} /> Saving Notes...</>
              ) : (
                <><CheckIcon size={18} /> Save & Generate AI Summary</>
              )}
            </button>
            <button className="btn btn-ghost" onClick={() => router.push('/doctor')}>
              Cancel
            </button>
          </div>
        </div>

        {/* Right — AI Pre-Visit Summary */}
        <div className={styles.sideCol}>
          {preVisit && preVisit.llmStatus === 'FAILED' && (
            <div className={`card ${styles.preVisitCard}`} style={{ borderLeft: '4px solid var(--danger-500)' }}>
              <div className={styles.preVisitHeader}>
                <AlertTriangleIcon size={18} style={{ color: 'var(--danger-500)' }} />
                <h3 style={{ color: 'var(--danger-700)' }}>AI Generation Failed</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                The pre-visit summary failed to generate. You can review the raw symptoms below or retry generation.
              </p>
              
              <div className={styles.preVisitSection} style={{ marginBottom: 'var(--space-4)' }}>
                <h4>Patient&apos;s Words</h4>
                <p className={styles.rawInput} style={{ backgroundColor: 'var(--danger-50)' }}>
                  {preVisit.rawSymptoms}
                </p>
              </div>

              <RetryAIButton appointmentId={appointment.id} />
            </div>
          )}

          {preVisit && preVisit.llmStatus === 'OK' && (
            <div className={`card ${styles.preVisitCard}`}>
              <div className={styles.preVisitHeader}>
                <SparklesIcon size={18} style={{ color: 'var(--primary-500)' }} />
                <h3>AI Pre-Visit Summary</h3>
              </div>

              {preVisit.urgencyLevel && (
                <div className={styles.urgencyBadge}>
                  <AlertTriangleIcon size={14} style={{ color: getUrgencyConfig(preVisit.urgencyLevel).color }} />
                  <span className={`badge ${getUrgencyConfig(preVisit.urgencyLevel).className}`}>
                    {getUrgencyConfig(preVisit.urgencyLevel).label} Urgency
                  </span>
                </div>
              )}

              {preVisit.chiefComplaint && (
                <div className={styles.preVisitSection}>
                  <h4>Chief Complaint</h4>
                  <p>{preVisit.chiefComplaint}</p>
                </div>
              )}

              {preVisit.differentialDiagnosis && (Array.isArray(preVisit.differentialDiagnosis) ? preVisit.differentialDiagnosis as string[] : []).length > 0 && (
                <div className={styles.preVisitSection}>
                  <h4>Possible Conditions</h4>
                  <ul className={styles.conditionList}>
                    {(preVisit.differentialDiagnosis as string[]).map((d, i) => (
                      <li key={i}><ActivityIcon size={12} /> {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {preVisit.redFlags && (Array.isArray(preVisit.redFlags) ? preVisit.redFlags as string[] : []).length > 0 && (
                <div className={styles.preVisitSection}>
                  <h4 style={{ color: 'var(--danger-500)' }}>⚠️ Red Flags</h4>
                  <ul className={styles.redFlags}>
                    {(preVisit.redFlags as string[]).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {preVisit.rawSymptoms && (
                <div className={styles.preVisitSection}>
                  <h4>Patient&apos;s Words</h4>
                  <p className={styles.rawInput}>{preVisit.rawSymptoms}</p>
                </div>
              )}
            </div>
          )}

          {!preVisit && (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <SparklesIcon size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                No AI pre-visit summary available for this patient.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
