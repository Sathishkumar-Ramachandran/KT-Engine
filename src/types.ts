export enum NodeType {
  Employee = "Employee",
  Skill = "Skill",
  Project = "Project",
  System = "System",
  Process = "Process",
  Department = "Department",
  Customer = "Customer",
  Meeting = "Meeting",
  Decision = "Decision",
  Document = "Document"
}

export enum RelationType {
  OWNS = "OWNS",
  WORKS_ON = "WORKS_ON",
  EXPERT_IN = "EXPERT_IN",
  USES = "USES",
  DEPENDS_ON = "DEPENDS_ON",
  CREATED = "CREATED",
  MENTIONED_IN = "MENTIONED_IN",
  RESPONSIBLE_FOR = "RESPONSIBLE_FOR"
}

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  weight?: number;
}

export interface IngestedDocument {
  id: string;
  title: string;
  type: "PDF" | "SOP" | "Architecture" | "Transcript" | "TXT";
  content: string;
  date: string;
  author: string;
  status: "Ingested" | "Parsing" | "Parsed" | "Error";
  entitiesCount?: number;
  relationshipsCount?: number;
}

export interface DigitalTwin {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  confidenceScore: number;
  personaDescription: string;
  coreSkills: string[];
  projects: string[];
  systemsManaged: string[];
  avatarUrl?: string;
}

export interface OnboardingPlan {
  roleName: string;
  durationDays: number;
  learningPath: {
    week: number;
    focus: string;
    topics: string[];
  }[];
  requiredDocuments: string[];
  requiredMeetings: string[];
  recommendedExperts: string[];
  milestones: string[];
}

export interface RiskEmployee {
  employeeId: string;
  name: string;
  role: string;
  riskScore: number; // 0 to 100
  busFactorContribution: number; // impact of sudden departure
  knowledgeConcentration: string[]; // unique skills
  mitigationPlan: string;
}

export interface RiskSystem {
  systemId: string;
  name: string;
  criticality: "High" | "Medium" | "Low";
  soleSMEId: string;
  soleSMEName: string;
  riskLevel: "High" | "Medium" | "Low";
  redundancyScore: number; // e.g. 1 out of 5
}

export interface MultiAgentStep {
  agent: string;
  action: string;
  message: string;
  timestamp: string;
  outputs?: any;
}

export interface CollaborationSession {
  query: string;
  steps: MultiAgentStep[];
  finalAnswer: string;
  timestamp: string;
}
