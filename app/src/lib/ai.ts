import { GoogleGenAI, Type, Schema } from '@google/genai';
import { UrgencyLevel } from '@prisma/client';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const summarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    urgencyLevel: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      description: 'The urgency level of the symptoms.'
    },
    chiefComplaint: {
      type: Type.STRING,
      description: 'A concise summary of the primary symptoms.'
    },
    differentialDiagnosis: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of 2-4 possible clinical considerations based on symptoms.'
    },
    suggestedQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of 2-3 questions the patient should ask the doctor.'
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of any severe red flag symptoms reported. Empty if none.'
    },
    patientFriendlySummary: {
      type: Type.STRING,
      description: 'A warm, reassuring 1-2 sentence summary for the patient.'
    }
  },
  required: ['urgencyLevel', 'chiefComplaint', 'differentialDiagnosis', 'suggestedQuestions', 'redFlags', 'patientFriendlySummary']
};

export async function generatePreVisitSummary(symptoms: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const prompt = `You are a clinical triage AI assistant. Analyze the following patient-reported symptoms and generate a pre-visit summary.
Do not diagnose, just provide clinical considerations.

Patient Symptoms:
${symptoms}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: summarySchema,
        temperature: 0.2, // Low temp for more clinical consistency
      }
    });

    if (!response.text) {
      throw new Error('No output from model');
    }

    return JSON.parse(response.text) as {
      urgencyLevel: UrgencyLevel;
      chiefComplaint: string;
      differentialDiagnosis: string[];
      suggestedQuestions: string[];
      redFlags: string[];
      patientFriendlySummary: string;
    };
  } catch (err) {
    console.error('Failed to generate AI summary:', err);
    throw err;
  }
}

export async function generatePostVisitSummary(notes: string, prescriptions: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const prescriptionText = prescriptions.length > 0 
    ? prescriptions.map(rx => `- ${rx.medication}: ${rx.dosage}, ${rx.frequency} for ${rx.durationDays} days`).join('\n')
    : 'None';

  const prompt = `You are a warm, empathetic doctor communicating with a patient after their visit. 
Based on the raw clinical notes and prescriptions below, write a brief, easy-to-understand 2-3 sentence summary for the patient.
Do not use complex medical jargon. Explain the diagnosis simply, what they need to do, and reassure them.

Clinical Notes:
${notes}

Prescriptions:
${prescriptionText}

Patient-Friendly Summary (Do not include any greeting or signature, just the summary paragraph):`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3, // Slightly higher temp for warmth
      }
    });
    
    if (!response.text) {
      throw new Error('No output from model');
    }

    return response.text.trim();
  } catch (error) {
    console.error('Gemini Post-Visit Generation Error:', error);
    throw new Error('Failed to generate post-visit summary.');
  }
}
