export interface ClinicalNote {
  id: string;
  title: string;
  date: string;
  therapyType: string;
  content: {
    insights: any;
    recommendations?: {
      nextSession: string[];
      homework: string[];
    };
    // Optional fields for backward compatibility
    nextSession?: string[];
    homework?: string[];
  };
  clientId?: string;
  tags?: string[];
}
