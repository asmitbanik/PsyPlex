export interface ClinicalNote {
  id: string;
  title: string;
  date: string;
  therapyType: string;
  content: {
    insights: any;
    recommendations: {
      nextSession: string[];
      homework: string[];
    };
  };
  clientId?: string;
  tags?: string[];
}
