interface TherapyFormat {
  SOAP: {
    Subjective: string[];
    Objective: string[];
    Assessment: string[];
    Plan: string[];
  };
  BIRP: {
    Behavior: string[];
    Intervention: string[];
    Response: string[];
    Plan: string[];
  };
  DAP: {
    Data: string[];
    Assessment: string[];
    Plan: string[];
  };
  ScribbledNotes: {
    observations: string[];
    keyPoints: string[];
    followUp: string[];
  };
}

export function generatePrompt(transcription: string, format: 'SOAP' | 'BIRP' | 'DAP' | 'Scribbled Notes'): string {
  const baseContext = `As a mental health professional, analyze the following therapy session transcription and generate a structured clinical report. Format the response as a JSON object according to the specified format.\n\nTranscription:\n${transcription}\n\n`;
  
  const formatSpecificPrompts = {
    SOAP: `Generate a SOAP note format report with the following structure:
    {
      "Subjective": ["Patient's statements, symptoms, and concerns"],
      "Objective": ["Observable behaviors, test results, vital signs"],
      "Assessment": ["Clinical analysis, identified patterns, diagnosis considerations"],
      "Plan": ["Treatment plans, interventions, follow-up actions"]
    }`,
    
    BIRP: `Generate a BIRP note format report with the following structure:
    {
      "Behavior": ["Client's behaviors, statements, symptoms"],
      "Intervention": ["Therapeutic techniques used, counselor's actions"],
      "Response": ["Client's response to interventions"],
      "Plan": ["Future treatment plans, homework, goals"]
    }`,
    
    DAP: `Generate a DAP note format report with the following structure:
    {
      "Data": ["Objective and subjective observations"],
      "Assessment": ["Clinical interpretation and analysis"],
      "Plan": ["Treatment plans and next steps"]
    }`,
    
    "Scribbled Notes": `Generate a free-form clinical notes summary with the following structure:
    {
      "observations": ["Key observations and notable points"],
      "keyPoints": ["Important insights and patterns"],
      "followUp": ["Action items and follow-up plans"]
    }`
  };

  return baseContext + formatSpecificPrompts[format] + 
    "\n\nEnsure the response is a valid JSON object that strictly follows this structure. Include only the most relevant and significant points in each section.";
}
