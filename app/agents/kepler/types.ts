/**
 * Tipos TypeScript para el Agente Orquestador Kepler
 */

// ============================================
// ENTRADAS
// ============================================

export interface BusinessContext {
  id: string;
  organization_id: string;
  name: string;
  content: string;
  metadata?: any;
  created_at: string;
}

export interface TeamContext {
  id: string;
  organization_id: string;
  name: string;              // Nombre de la persona
  email?: string;            // Correo (opcional)
  expertise: string;         // Especialidad/Experto de (qué hace, quién es)
  responsible_for: string;   // Responsable de (dentro de la empresa)
  created_at: string;
}

export interface NPSSurvey {
  id: string;
  score: number;
  comment?: string;
  timestamp: string;
  source: string;
}

export interface CSATSurvey {
  id: string;
  score: number;
  comment?: string;
  timestamp: string;
  source: string;
}

export interface Ticket {
  id: string;
  ticket_number?: string;
  subject: string;
  description: string;
  status: string;
  priority?: string;
  created_at: string;
  source: string;
}

export interface InstagramPost {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  commentsCount: number;
  latestComments: Array<{
    id: string;
    text: string;
    ownerUsername: string;
    timestamp: string;
  }>;
}

export interface LinkedInPost {
  id: string;
  url: string;
  text: string;
  timestamp: string;
  commentsCount: number;
  latestComments: Array<{
    id: string;
    text: string;
    ownerUsername: string;
    ownerName: string;
    timestamp: string;
  }>;
}

export interface PlayStoreReview {
  id: string;
  reviewText: string;
  rating: number;
  datePublished: string;
  userName: string;
  appId: string;
}

export interface ReportSettings {
  id: string;
  organization_id: string;
  delivery_method: string[];
  frequency?: string;
  recipients?: string[];
}

// ============================================
// INPUT PRINCIPAL DEL AGENTE
// ============================================

export interface KeplerAgentInput {
  organizationId: string;
  businessContexts: BusinessContext[];
  teamContexts?: TeamContext[];
  data: {
    nps?: NPSSurvey[];
    csat?: CSATSurvey[];
    tickets?: Ticket[];
    instagram?: InstagramPost[];
    linkedin?: LinkedInPost[];
    playstore?: PlayStoreReview[];
  };
  reportSettings?: ReportSettings;
}

// ============================================
// SALIDAS
// ============================================

export interface ActionableInsight {
  title: string; // "🎯 Foco del Día (P0): [Problema]"
  actions: {
    type: "UX/UI" | "Backend" | "Ops/Process";
    description: string;
  }[];
  owner: {
    squad: string;
    responsible: string; // @usuario
  };
  deltaAnalysis: {
    impact: string; // 1 línea explicando el daño
    violation: string; // Regla o dato del contexto roto
  };
  evidence: {
    tickets?: string[]; // IDs o números de tickets
    reviews?: string[]; // IDs de reseñas
    comments?: string[]; // IDs de comentarios
    count?: number; // Total de casos
  };
  otherFindings?: Array<{
    title: string;
    priority: "P2" | "P3";
    count: number;
  }>;
}

export interface KeplerAgentOutput {
  success: boolean;
  insight?: ActionableInsight;
  rawOutput?: string; // Output original de OpenAI en Markdown
  error?: string;
  metadata?: {
    processingTime: number;
    modelUsed: string;
    clustersDetected?: number;
    itemsAnalyzed?: number;
    tokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}
