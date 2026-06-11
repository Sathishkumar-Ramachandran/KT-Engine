import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  NodeType, 
  RelationType, 
  GraphNode, 
  GraphEdge, 
  IngestedDocument, 
  DigitalTwin, 
  OnboardingPlan, 
  RiskEmployee, 
  RiskSystem, 
  MultiAgentStep, 
  CollaborationSession 
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini GenAI initialized successfully.");
  } catch (error) {
    console.error("Error initializing Gemini API:", error);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment. Running in mock-enhanced mode.");
}

// ==========================================
// IN-MEMORY DATABASES (PG / NEO4J / QDRANT MOCK INDEX)
// ==========================================

const DATABASE = {
  // Pre-seed 10 robust historical enterprise documents
  documents: [
    {
      id: "doc-1",
      title: "S4HANA Payment Gateway Integration Architecture SOP",
      type: "Architecture",
      content: `OIOS PAYMENT INTEGRATION BLUEPRINT v4.2
Author: Jonathan Vance (Chief Payments Architect)
Status: Approved & Implemented

This document defines the interface between our legacy ERP Core and the S4HANA Payment Gateway.
Core Routing Protocol:
- All transactions are queued in the 'payment-ingress-v2' Apache Kafka cluster.
- The SAP Payment Broker ingests events from Kafka, maps accounts, and posts to S4HANA Ledger via RFC.
- Database: Core transactions are stored in Oracle DB, while ledger logs are stored in PostgreSQL database.

Single Point of Failure Warning:
Jonathan Vance is the sole structural architect with credentials and schema knowledge of the proprietary RFC mapping script ('sap-rfc-mounter.sh'). No other team member has edit clearance. Highly concentrated skill block: S4HANA Core, RFC mounting.`,
      date: "2026-03-12",
      author: "Jonathan Vance",
      status: "Parsed",
      entitiesCount: 7,
      relationshipsCount: 8
    },
    {
      id: "doc-2",
      title: "Kafka Cluster Cluster Topology & Broker Provisioning Guide",
      type: "SOP",
      content: `OIOS KAFKA INFRASTRUCTURE MANUAL
Author: Sarah Lin (Principal SME)
Last Updated: 2026-05-20

Our high-throughput data pipelines rely on a multi-broker Apache Kafka cluster run in Kubernetes.
Core Components:
- Zookeeperless mode enabled (KRaft).
- Topics: 'payment-ingress-v2' (partition-count=12), 'customer-telemetry-v1', 'audit-trails-prod'.
- Key Owner: Sarah Lin owns Kafka administration and clustering.
- System of dependecy: the Payments System depends on our Kafka Cluster for real-time validation and asynchronous logging.`,
      date: "2026-05-20",
      author: "Sarah Lin",
      status: "Parsed",
      entitiesCount: 5,
      relationshipsCount: 6
    },
    {
      id: "doc-3",
      title: "Q3 Strategic Payments Failure Outage Post-Mortem",
      type: "Transcript",
      content: `TRANSCRIPT: SEVERITY 1 INCIDENT RECOVERY CALL
Date: June 01, 2026
Attendees: Jonathan Vance (Lead Architect), Sarah Lin (SME), Marcus Brody (VP Ops)

Marcus: Why did the Transaction Ledger freeze?
Jonathan: The SAP Gateway rejected the RFC payload because the mapping script failed.
Sarah: The kafka topic 'payment-ingress-v2' backed up because the broker was throttled on S4HANA response delays.
Jonathan: I manually restarted the broker service using 'sap-rfc-mounter.sh'. S4HANA re-established handshake after 42 minutes.
Marcus: Action items: We must recruit back-ups. Jonathan is our only S4HANA master code-owner. If Jonathan departs, we have a major risk.`,
      date: "2026-06-01",
      author: "Marcus Brody",
      status: "Parsed",
      entitiesCount: 8,
      relationshipsCount: 11
    },
    {
      id: "doc-4",
      title: "Enterprise Multi-Core Ledger Migration Plan",
      type: "PDF",
      content: `PROJECT ATLAS: LEDGER REFACTOR
Target: De-risk Oracle DB dependencies. Migrate core ledger streams to PostgreSQL v16 on Google Cloud.
Lead System Engineer: David K. (Dev Lead)
Dependencies: Uses Kafka for state replication. Relies heavily on Jonathan Vance's SAP account mappings.`,
      date: "2026-04-10",
      author: "David K.",
      status: "Parsed",
      entitiesCount: 4,
      relationshipsCount: 4
    }
  ] as IngestedDocument[],

  // 10 Core employees
  employees: [
    { id: "emp-1", name: "Jonathan Vance", role: "Chief Payments Architect", department: "Payments Infrastructure", email: "j.vance@oios.internal" },
    { id: "emp-2", name: "Sarah Lin", role: "Principal Kafka & Middleware SME", department: "SaaS Reliability Engineering", email: "s.lin@oios.internal" },
    { id: "emp-3", name: "Marcus Brody", role: "VP Operations", department: "Operations Leadership", email: "m.brody@oios.internal" },
    { id: "emp-4", name: "David K.", role: "Lead Systems Engineer", department: "Cloud Platform", email: "d.k@oios.internal" },
    { id: "emp-5", name: "Elena Rostova", role: "Database Administrator", department: "Core Databases", email: "e.rostova@oios.internal" },
    { id: "emp-6", name: "Amir Al-Damil", role: "Senior Java Spring Developer", department: "Payments Client Integration", email: "a.damil@oios.internal" }
  ],

  // In-Memory Graph structures
  nodes: [
    { id: "emp-1", type: NodeType.Employee, name: "Jonathan Vance", label: "Jonathan Vance", properties: { role: "Chief Payments Architect", dept: "Payments Infrastructure" } },
    { id: "emp-2", type: NodeType.Employee, name: "Sarah Lin", label: "Sarah Lin", properties: { role: "Principal Kafka SME", dept: "SRE" } },
    { id: "emp-3", type: NodeType.Employee, name: "Marcus Brody", label: "Marcus Brody", properties: { role: "VP Operations" } },
    { id: "emp-4", type: NodeType.Employee, name: "David K.", label: "David K.", properties: { role: "Lead Systems Engineer" } },
    { id: "emp-5", type: NodeType.Employee, name: "Elena Rostova", label: "Elena Rostova", properties: { role: "Database Administrator" } },
    { id: "emp-6", type: NodeType.Employee, name: "Amir Al-Damil", label: "Amir Al-Damil", properties: { role: "Senior Java Spring Developer" } },

    { id: "skill-sap", type: NodeType.Skill, name: "S4HANA ERP", label: "S4HANA ERP", properties: { field: "Enterprise Finance" } },
    { id: "skill-kafka", type: NodeType.Skill, name: "Apache Kafka", label: "Apache Kafka", properties: { field: "Event Streaming" } },
    { id: "skill-postgres", type: NodeType.Skill, name: "PostgreSQL", label: "PostgreSQL", properties: { field: "Relational DBs" } },
    { id: "skill-rfc", type: NodeType.Skill, name: "SAP RFC Mapping", label: "SAP RFC Mapping", properties: { field: "Integrations" } },
    { id: "skill-java", type: NodeType.Skill, name: "Java Spring Boot", label: "Java Spring Boot", properties: { field: "Backend Development" } },

    { id: "sys-s4hana", type: NodeType.System, name: "S4HANA Payment Ledger", label: "S4HANA Payment Ledger", properties: { criticality: "High", host: "On-Prem SAP Grid" } },
    { id: "sys-kafka", type: NodeType.System, name: "Core Kafka Cluster", label: "Core Kafka Cluster", properties: { criticality: "High", environment: "Production" } },
    { id: "sys-postgres", type: NodeType.System, name: "Internal Ledger DB", label: "Internal Ledger DB", properties: { criticality: "Medium" } },
    
    { id: "proj-atlas", type: NodeType.Project, name: "Project Atlas Ledger Refactor", label: "Project Atlas", properties: { tier: "Tier-1 Strategic" } },
    
    { id: "decision-rfc", type: NodeType.Decision, name: "Manual RFC Handshake Restart", label: "Manual RFC Handshake Restart", properties: { trigger: "Outage 2026-06-01" } },
    { id: "doc-1", type: NodeType.Document, name: "Payment Architect Blueprint", label: "Doc: S4HANA SOP", properties: { url: "/docs/sop-s4hana" } },
    { id: "doc-2", type: NodeType.Document, name: "Kafka Infrastructure Manual", label: "Doc: Kafka Guide", properties: { url: "/docs/kafka-manual" } }
  ] as GraphNode[],

  edges: [
    // Skills
    { id: "e1", source: "emp-1", target: "skill-sap", type: RelationType.EXPERT_IN },
    { id: "e2", source: "emp-1", target: "skill-rfc", type: RelationType.EXPERT_IN, weight: 1.0 },
    { id: "e3", source: "emp-2", target: "skill-kafka", type: RelationType.EXPERT_IN, weight: 0.95 },
    { id: "e4", source: "emp-5", target: "skill-postgres", type: RelationType.EXPERT_IN },
    { id: "e5", source: "emp-6", target: "skill-java", type: RelationType.EXPERT_IN },
    { id: "e5b", source: "emp-1", target: "skill-kafka", type: RelationType.EXPERT_IN, weight: 0.70 },

    // Works on
    { id: "e6", source: "emp-1", target: "proj-atlas", type: RelationType.WORKS_ON },
    { id: "e7", source: "emp-4", target: "proj-atlas", type: RelationType.WORKS_ON },
    { id: "e8", source: "emp-2", target: "proj-atlas", type: RelationType.WORKS_ON },

    // System Ownerships
    { id: "e9", source: "emp-1", target: "sys-s4hana", type: RelationType.OWNS },
    { id: "e10", source: "emp-2", target: "sys-kafka", type: RelationType.OWNS },
    { id: "e11", source: "emp-5", target: "sys-postgres", type: RelationType.OWNS },

    // System Dependencies
    { id: "e12", source: "sys-s4hana", target: "sys-kafka", type: RelationType.DEPENDS_ON },
    { id: "e13", source: "proj-atlas", target: "sys-postgres", type: RelationType.USES },
    
    // Created
    { id: "e14", source: "emp-1", target: "doc-1", type: RelationType.CREATED },
    { id: "e15", source: "emp-2", target: "doc-2", type: RelationType.CREATED },

    // Mentioned in / Responsible for
    { id: "e16", source: "emp-1", target: "decision-rfc", type: RelationType.RESPONSIBLE_FOR },
    { id: "e17", source: "decision-rfc", target: "sys-s4hana", type: RelationType.MENTIONED_IN }
  ] as GraphEdge[]
};

// ==========================================
// API ENDPOINTS
// ==========================================

// Get all documents
app.get("/api/documents", (req, res) => {
  res.json(DATABASE.documents);
});

// Upload and parsed document using Gemini AI
app.post("/api/documents", async (req, res) => {
  const { title, type, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  const newDocId = `doc-${Date.now()}`;
  const newDoc: IngestedDocument = {
    id: newDocId,
    title,
    type: type || "TXT",
    content,
    author: author || "Anonymous Administrator",
    date: new Date().toISOString().split("T")[0],
    status: "Parsing",
    entitiesCount: 0,
    relationshipsCount: 0
  };

  DATABASE.documents.push(newDoc);

  // Push Document to the Graph database immediately
  DATABASE.nodes.push({
    id: newDocId,
    type: NodeType.Document,
    name: title,
    label: `Doc: ${title.substring(0, 15)}...`,
    properties: { author, date: newDoc.date, type }
  });

  // Background parsing
  try {
    if (ai) {
      console.log(`Live parsing document "${title}" via Gemini...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this corporate document, SOP, or meeting transcript. Extract all critical entities (People, Skills, Systems, Projects, Decisions) and relationships between them.
        
        Document:
        ---
        Title: ${title}
        Type: ${type}
        Author: ${author}
        Content: ${content}
        ---

        Return a JSON structure matching this exact shape:
        {
          "entities": [
            {"id": "suggested-short-id", "type": "Employee|Skill|Project|System|Process|Decision", "name": "Exact Name", "properties": {}}
          ],
          "relationships": [
            {"source": "source-id", "target": "target-id", "type": "OWNS|WORKS_ON|EXPERT_IN|USES|DEPENDS_ON|CREATED|MENTIONED_IN|RESPONSIBLE_FOR", "weight": 0.0to1.0}
          ]
        }`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const rawJson = response.text || "{}";
      const parsed = JSON.parse(rawJson);

      let addedNodesCount = 0;
      let addedEdgesCount = 0;

      if (parsed.entities && Array.isArray(parsed.entities)) {
        parsed.entities.forEach((ent: any) => {
          // Check if node already exists
          const exists = DATABASE.nodes.some(n => n.id === ent.id || n.name.toLowerCase() === ent.name.toLowerCase());
          if (!exists) {
            let mappedType = NodeType.System;
            if (ent.type?.toUpperCase() === "EMPLOYEE") mappedType = NodeType.Employee;
            else if (ent.type?.toUpperCase() === "SKILL") mappedType = NodeType.Skill;
            else if (ent.type?.toUpperCase() === "PROJECT") mappedType = NodeType.Project;
            else if (ent.type?.toUpperCase() === "DECISION") mappedType = NodeType.Decision;
            else if (ent.type?.toUpperCase() === "PROCESS") mappedType = NodeType.Process;

            DATABASE.nodes.push({
              id: ent.id,
              type: mappedType,
              name: ent.name,
              label: ent.name,
              properties: ent.properties || {}
            });
            addedNodesCount++;
            
            // If employee, also seed employee table if not exist
            if (mappedType === NodeType.Employee) {
              const empExists = DATABASE.employees.some(e => e.id === ent.id);
              if (!empExists) {
                DATABASE.employees.push({
                  id: ent.id,
                  name: ent.name,
                  role: ent.properties?.role || "Developer",
                  department: ent.properties?.dept || "Technology",
                  email: `${ent.id}@oios.internal`
                });
              }
            }
          }
        });
      }

      if (parsed.relationships && Array.isArray(parsed.relationships)) {
        parsed.relationships.forEach((rel: any, idx: number) => {
          const edgeId = `edge-${Date.now()}-${idx}`;
          // Ensure both source and target exist
          const sourceExists = DATABASE.nodes.some(n => n.id === rel.source);
          const targetExists = DATABASE.nodes.some(n => n.id === rel.target);
          if (sourceExists && targetExists) {
            DATABASE.edges.push({
              id: edgeId,
              source: rel.source,
              target: rel.target,
              type: (rel.type as RelationType) || RelationType.USES,
              weight: rel.weight || 0.8
            });
            addedEdgesCount++;
          }
        });
      }

      // Link new document node to its author (Employee node) if they exist
      const authorNode = DATABASE.nodes.find(n => n.type === NodeType.Employee && n.name.toLowerCase().includes(author.toLowerCase()));
      if (authorNode) {
        DATABASE.edges.push({
          id: `edge-${Date.now()}-author-link`,
          source: authorNode.id,
          target: newDocId,
          type: RelationType.CREATED,
          weight: 1.0
        });
      }

      // Update doc stats
      newDoc.status = "Parsed";
      newDoc.entitiesCount = addedNodesCount;
      newDoc.relationshipsCount = addedEdgesCount;

    } else {
      // Fallback parse simulation so app is fully executable even without API Key!
      console.log("Simulating document parse fallback...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Auto-extract content variables
      let entitiesCount = 4;
      let relationshipsCount = 3;

      if (content.toLowerCase().includes("postgres") || content.toLowerCase().includes("sql")) {
        // Mock link to postgres node
        DATABASE.edges.push({
          id: `edge-mock-${Date.now()}-1`,
          source: newDocId,
          target: "skill-postgres",
          type: RelationType.MENTIONED_IN
        });
      }

      newDoc.status = "Parsed";
      newDoc.entitiesCount = entitiesCount;
      newDoc.relationshipsCount = relationshipsCount;
    }
  } catch (err) {
    console.error("Document parse failed:", err);
    newDoc.status = "Error";
  }

  res.json(newDoc);
});

// Get Knowledge Graph Database State Node and Edge lists (Neo4j simulation)
app.get("/api/graph", (req, res) => {
  res.json({
    nodes: DATABASE.nodes,
    edges: DATABASE.edges
  });
});

// Complete Employee list
app.get("/api/employees", (req, res) => {
  res.json(DATABASE.employees);
});

// ==========================================
// ENTERPRISE SEARCH & VECTOR MOCK OVERLAY
// ==========================================
app.post("/api/search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Search query required." });

  const queryLower = query.toLowerCase();

  // 1. Elasticsearch Match Calculation & Vector similarity (Simulated scores)
  const matches = DATABASE.documents.map(doc => {
    let textScore = 0;
    if (doc.title.toLowerCase().includes(queryLower)) textScore += 30;
    if (doc.content.toLowerCase().includes(queryLower)) textScore += 20;

    // keyword highlights
    const keywordMatches = queryLower.split(" ").filter((k: string) => k.length > 2 && doc.content.toLowerCase().includes(k));
    textScore += keywordMatches.length * 10;

    // vector scores simulation (normalized 0.35 to 0.95 based on keyword matching)
    const vectorSimilarity = textScore > 0 ? Math.min(0.95, 0.45 + textScore / 100) : Math.max(0.2, Math.random() * 0.4);

    return {
      document: doc,
      elasticsearchScore: textScore,
      vectorSimilarity: Number(vectorSimilarity.toFixed(2)),
      hybridScore: Number(((textScore + vectorSimilarity * 100) / 2).toFixed(1))
    };
  }).filter(m => m.hybridScore > 10).sort((a,b) => b.hybridScore - a.hybridScore);

  // 2. Map Entity correlations from Graph
  const matchedNodes = DATABASE.nodes.filter(n => 
    n.name.toLowerCase().includes(queryLower) || 
    (n.properties && Object.values(n.properties).some(v => String(v).toLowerCase().includes(queryLower)))
  );

  // 3. Smart Semantic AI Synthesis Synthesis via Gemini
  let aiSynthesis = "";
  if (ai) {
    try {
      const prompt = `You are the chief AI Enterprise Architect for OIOS. The user is searching the company memory database for: "${query}".
      Below are the top relevant matching documents found via our dense/sparse vector index:
      ${matches.map(m => `[Doc: ${m.document.title}] Author: ${m.document.author} - Content Summary: ${m.document.content}`).join("\n\n")}
      
      Synthesize a concise, high-value architecture-expert response answering their query based strictly on the stored facts. Suggest the primary employee (SME) who owns or has expert credentials in the topic.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      aiSynthesis = response.text || "";
    } catch (e) {
      aiSynthesis = "Error generating live semantic synthesis. Falling back to local index resolution.";
    }
  }

  // Fallback / standard auto-synthesis if Gemini not loaded or errored
  if (!aiSynthesis) {
    if (matches.length > 0) {
      const topDoc = matches[0].document;
      aiSynthesis = `Unified Multi-Agent Discovery: The query matches document "${topDoc.title}" written by ${topDoc.author}. Stored index reveals critical systems associated: ${DATABASE.nodes.filter(n => n.type === NodeType.System).map(s => s.name).slice(0, 3).join(", ")}. Please recruit ${topDoc.author} for live system inquiries.`;
    } else {
      aiSynthesis = `No active memory logs contain a clear index match for "${query}". Try searching S4HANA, Kafka Broker, SAP RFC, or Snail Ledger.`;
    }
  }

  res.json({
    query,
    hits: matches,
    matchedNodes,
    aiSynthesis
  });
});

// ==========================================
// DIGITAL TWINS BUILDER
// ==========================================
const DIGITAL_TWINS: DigitalTwin[] = [
  {
    id: "twin-1",
    employeeId: "emp-1",
    name: "Jonathan Vance",
    role: "Chief Payments Architect",
    department: "Payments Infrastructure",
    confidenceScore: 0.94,
    personaDescription: "John is a highly technical, slightly cynical, veteran mainframe and SAP core engineer with 15 years experience. Speaks concisely, points out system bottlenecks instantly, hates legacy workarounds but built a few himself. Prefers RFC mappings and solid database isolation schemas.",
    coreSkills: ["S4HANA ERP", "SAP RFC Mapping", "Enterprise Ledger", "Oracle DB Tuning", "PostgreSQL"],
    projects: ["Project Atlas Ledger Refactor"],
    systemsManaged: ["S4HANA Payment Ledger", "Internal Ledger DB"]
  },
  {
    id: "twin-2",
    employeeId: "emp-2",
    name: "Sarah Lin",
    role: "Principal Kafka & Middleware SME",
    department: "SaaS Reliability Engineering",
    confidenceScore: 0.91,
    personaDescription: "Sarah is a detailed-oriented, supportive, system reliability advocate. She is obsessed with high availability, Kafka KRaft partitions, metrics-driven clustering, and horizontal microservice scalability. She values proper onboarding documents to avoid outages.",
    coreSkills: ["Apache Kafka", "Kubernetes Clustering", "Event-Driven Microservices", "Prometheus Metric Logging", "Go Runtime Tuning"],
    projects: ["Project Atlas Ledger Refactor"],
    systemsManaged: ["Core Kafka Cluster"]
  }
];

app.get("/api/digital-twin", (req, res) => {
  res.json(DIGITAL_TWINS);
});

// Chat with a Digital Twin
app.post("/api/digital-twin/ask", async (req, res) => {
  const { twinId, question } = req.body;
  if (!twinId || !question) return res.status(400).json({ error: "twinId and question are required." });

  const twin = DIGITAL_TWINS.find(t => t.id === twinId);
  if (!twin) return res.status(404).json({ error: "Digital twin not found." });

  // Get matching files authored or mentions
  const relevantDocs = DATABASE.documents.filter(doc => 
    doc.content.toLowerCase().includes(twin.name.toLowerCase()) || 
    doc.author.toLowerCase() === twin.name.toLowerCase()
  );

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the Digital AI Twin replica of ${twin.name}, holding the role of ${twin.role} at OIOS. 
        
        Your Core Persona Profile:
        ---
        ${twin.personaDescription}
        Skills: ${twin.coreSkills.join(", ")}
        Managed Systems: ${twin.systemsManaged.join(", ")}
        ---

        Grounding Documents authored or mentioning you:
        ${relevantDocs.map(d => `[Document: ${d.title}]\n${d.content}`).join("\n\n")}

        User Question to you: "${question}"

        Please answer precisely as ${twin.name} would, adopting their voice, technical depth, shortcuts, or opinions. Never announce that you are an AI or breaks character. Keep your reply concise, specific to OIOS infrastructure facts, and rich in design insights.`,
        config: {
          temperature: 0.7
        }
      });
      return res.json({ answer: response.text });
    } catch (e) {
      console.error("Twin live generation error:", e);
    }
  }

  // Backup Mock reply generator mimicking character
  setTimeout(() => {
    let mockAns = "";
    if (twinId === "twin-1") {
      mockAns = `Look, regarding "${question}"—it's standard payment routing. That's why we routed the ingress event logs straight inside the Kafka topics before hammering the S4HANA RFC broker. Unnecessary sync handshakes only lock down the DB connections. S4HANA is robust, but the moment you feed it bad mapper schemas, everything hangs up. I'd recommend you check 'sap-rfc-mounter.sh' before changing anything in the postgres tables.`;
    } else {
      mockAns = `In regards to "${question}", our primary focus with OIOS pipelines is ensuring topic partitioning handles the event spikes safely. That's why Kafka underpins the transaction ledger state model. Let's make sure our consumers are well-configured, and that standard retry limits are implemented. We can sync on a metrics dashboard review later!`;
    }
    res.json({ answer: mockAns });
  }, 1000);
});

// ==========================================
// EXPERT DISCOVERY & COVERAGE MAPS
// ==========================================
app.get("/api/expert-discovery", (req, res) => {
  // For each Skill Node, calculate SME weights based on edge weights & occurrences
  const skillNodes = DATABASE.nodes.filter(n => n.type === NodeType.Skill);
  
  const skillRankings = skillNodes.map(skill => {
    // Find Employees linked to this skill
    const connectedEdges = DATABASE.edges.filter(e => e.target === skill.id && e.type === RelationType.EXPERT_IN);
    const experts = connectedEdges.map(edge => {
      const emp = DATABASE.employees.find(e => e.id === edge.source);
      return {
        employeeId: edge.source,
        name: emp ? emp.name : "Unknown Engineer",
        role: emp ? emp.role : "SME",
        weightScore: edge.weight || 0.8,
        proofOfExpertise: `Authored architecture logs or managed systems linked within Node connection.`
      };
    }).sort((a,b) => b.weightScore - a.weightScore);

    return {
      skillId: skill.id,
      skillName: skill.name,
      field: skill.properties?.field || "Technology",
      experts
    };
  });

  res.json(skillRankings);
});

// ==========================================
// KNOWLEDGE RISK INTELLIGENCE CALCULATOR
// ==========================================
app.get("/api/risk-intelligence", (req, res) => {
  // 1. Identify single points of failure (employees who are sole expert in High Criticality systems)
  const systemNodes = DATABASE.nodes.filter(n => n.type === NodeType.System);
  const employeeNodes = DATABASE.nodes.filter(n => n.type === NodeType.Employee);

  const riskSystemsList: RiskSystem[] = systemNodes.map(sys => {
    // Look at who OWNS this system
    const ownershipEdges = DATABASE.edges.filter(e => e.target === sys.id && e.type === RelationType.OWNS);
    const critical = sys.properties?.criticality === "High" ? "High" : "Medium";
    
    // Find sole SME context
    let soleSMEId = "emp-1";
    let soleSMEName = "Jonathan Vance";
    if (sys.id === "sys-kafka") {
      soleSMEId = "emp-2";
      soleSMEName = "Sarah Lin";
    } else if (sys.id === "sys-postgres") {
      soleSMEId = "emp-5";
      soleSMEName = "Elena Rostova";
    }

    const redundancyScore = ownershipEdges.length; // number of owners acts as redundancy index
    const riskLevel = redundancyScore < 2 ? "High" : "Medium";

    return {
      systemId: sys.id,
      name: sys.name,
      criticality: critical as "High" | "Medium",
      soleSMEId,
      soleSMEName,
      riskLevel: riskLevel as "High" | "Medium",
      redundancyScore: Math.max(1, redundancyScore)
    };
  });

  const riskEmployeesList: RiskEmployee[] = [
    {
      employeeId: "emp-1",
      name: "Jonathan Vance",
      role: "Chief Payments Architect",
      riskScore: 92,
      busFactorContribution: 9.5,
      knowledgeConcentration: ["S4HANA ERP", "SAP RFC Mapping script code", "Mainframe RFC Broker"],
      mitigationPlan: "Must document the layout of 'sap-rfc-mounter.sh' and train junior developer Amir Al-Damil immediately."
    },
    {
      employeeId: "emp-2",
      name: "Sarah Lin",
      role: "Principal Kafka SME",
      riskScore: 78,
      busFactorContribution: 8.0,
      knowledgeConcentration: ["Zookeeperless KRaft Clustering", "Telemetry Event streams"],
      mitigationPlan: "Setup peer on-call rotation intervals with David K. and Elena to load-balance critical cluster configs."
    },
    {
      employeeId: "emp-5",
      name: "Elena Rostova",
      role: "Database Administrator",
      riskScore: 64,
      busFactorContribution: 6.5,
      knowledgeConcentration: ["Postgres State replication", "Ledger DB failover scripts"],
      mitigationPlan: "Document Ledger replication protocols in the Master Runbook index."
    }
  ];

  const totalBusFactor = 1.8; // Enterprise risk bus factor score

  res.json({
    enterpriseBusFactor: totalBusFactor,
    atRiskEmployees: riskEmployeesList,
    atRiskSystems: riskSystemsList,
    overallRiskScore: 78 // Combined OIOS risk metric
  });
});

// ==========================================
// ONBOARDING INTELLIGENCE ENGINE (AI PLANNER)
// ==========================================
app.post("/api/onboarding", async (req, res) => {
  const { roleName, focusSystems } = req.body;
  if (!roleName) return res.status(400).json({ error: "Role name is required for onboarding." });

  if (ai) {
    try {
      const prompt = `You are the Onboarding Intelligence Agent for OIOS. Generate a bespoke, professional, high-impact 90-day learning path for a newly hired "${roleName}" joining our engineering unit.
      Focus systems they will work in include: ${focusSystems?.join(", ") || "Payments Infrastructure, Apache Kafka, Core PostgreSQL Database"}.
      
      Suggest specific documents from our library that are required reading:
      - S4HANA Payment Gateway Integration Architecture SOP
      - Kafka Cluster Topology & Broker Provisioning Guide
      
      Recommend specific experts they should shadow:
      - Jonathan Vance (Chief Payments Architect)
      - Sarah Lin (Kafka SME)

      Format your response strictly as a JSON object matching this structure:
      {
        "roleName": "${roleName}",
        "durationDays": 90,
        "learningPath": [
          {"week": 1, "focus": "System Onboarding & Security Setup", "topics": ["Active Directory permissions", "GitHub access to payments repo"]},
          {"week": 2, "focus": "Database Schemas and Mapping", "topics": ["S4HANA ledger syncing", "RFC connection scripts"]},
          {"week": 4, "focus": "SRE Reliability Core", "topics": ["Kafka partition topologies", "Docker cluster debugging"]}
        ],
        "requiredDocuments": [
          "S4HANA Payment Gateway Integration Architecture SOP",
          "Kafka Cluster Topology & Broker Provisioning Guide"
        ],
        "requiredMeetings": [
          "Bi-weekly Payments Tech Sync with Jonathan Vance",
          "Kafka Reliability Overview with Sarah Lin"
        ],
        "recommendedExperts": [
          "Jonathan Vance (Chief Payments Architect)",
          "Sarah Lin (Principal Kafka SME)"
        ],
        "milestones": [
          "Deploy local mapped dev container test environment",
          "First successful trace validation through payment endpoints"
        ]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      return res.json(JSON.parse(response.text || "{}"));
    } catch (e) {
      console.error("AI Onboarding agent error, returning mock plan:", e);
    }
  }

  // Backup mock plan generator
  const mockPlan: OnboardingPlan = {
    roleName: roleName,
    durationDays: 90,
    learningPath: [
      {
        week: 1,
        focus: "Infrastructure Foundations & Security Handshakes",
        topics: [
          "Gain AD root credentials for 'payment-ingress-v2'",
          "Walkthrough Kafka Cluster topologies with Sarah Lin"
        ]
      },
      {
        week: 2,
        focus: "SAP Mappings & RFC Mount Protocols",
        topics: [
          "Code review 'sap-rfc-mounter.sh' with Jonathan Vance",
          "Map core postgres staging schemas to ERP Ledgers"
        ]
      },
      {
        week: 4,
        focus: "Shadowing and High-Severity Playbooks",
        topics: [
          "Review Q3 Outage Post-Mortems carefully",
          "Practice manual node replication trigger and Kafka client throttling hooks"
        ]
      },
      {
        week: 12,
        focus: "Active On-Call Operations Rotation",
        topics: [
          "Take over secondary ownership of SAP Account Mappings",
          "Implement new metrics alerts for RFC ledger dropouts"
        ]
      }
    ],
    requiredDocuments: [
      "S4HANA Payment Gateway Integration Architecture SOP (doc-1)",
      "Kafka Cluster Topology & Broker Provisioning Guide (doc-2)"
    ],
    requiredMeetings: [
      "Bi-weekly Payments Tech Coordination (Jonathan Vance)",
      "Reliability Engineering Standup (Sarah Lin)"
    ],
    recommendedExperts: [
      "Jonathan Vance (Chief Payments Architect)",
      "Sarah Lin (Principal Kafka & Middleware SME)"
    ],
    milestones: [
      "Deploy self-standing mock Kafka cluster locally",
      "Successfully map a simulated Oracle RFC transaction log back to Postgres",
      "Lead secondary on-call support rotation alongside SME"
    ]
  };

  res.json(mockPlan);
});

// ==========================================
// A2A MULTI-AGENT COLLABORATION SEQUENCE WORKFLOW
// ==========================================
app.post("/api/multi-agent/collaborate", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Collaboration query command required." });

  const timestamp = new Date().toISOString().substring(11, 19);

  // Generate a live beautiful orchestrated solution based on structural OIOS nodes and edges
  if (ai) {
    try {
      const prompt = `You are orchestrating the Multi-Agent Collaboration system (A2A Protocol) in OIOS.
      The user submitted a complex query: "${query}"

      The multi-agent system contains 5 specialized virtual agents that must speak to each other sequentially:
      1. Search Agent (Indexes resources, matches files)
      2. Expert Discovery Agent (Ranks relevant employees and skill maps)
      3. Knowledge Graph Agent (Finds connection paths and dependent structures)
      4. Risk Agent (Analyzes single-points-of-failure and bus factor)
      5. Digital Twin Agent (Re-incarnates SME personas to form human recommendations)

      Please generate a multi-step collaboration trace where each agent reports its segment of analysis relative to OIOS context (e.g. S4HANA, Jonathan Vance, Kafka, Sarah Lin, Project Atlas).
      And then compile a highly integrated "Final Answer" response.

      Format your response strictly as a JSON object matching this structure:
      {
        "query": "${query}",
        "steps": [
          {
            "agent": "Search Agent",
            "action": "Semantic Retrieval",
            "message": "Scanned Elastic and vector indices. Found doc-1 (SAP Mappings v4) and doc-3 (Incident post-mortem)."
          },
          {
            "agent": "Expert Discovery Agent",
            "action": "SME Rank mapping",
            "message": "Identified Jonathan Vance as sole S4HANA architect with 1.0 weight score. Sarah Lin holds Zookeeperless Kafka skill."
          },
          {
            "agent": "Knowledge Graph Agent",
            "action": "Graph database path traversals",
            "message": "Found path: Jonathan Vance -> OWNS -> S4HANA Payment Ledger -> DEPENDS_ON -> Core Kafka Cluster (managed by Sarah Lin)."
          },
          {
            "agent": "Risk Agent",
            "action": "Concentration intelligence calculation",
            "message": "CRITICAL RISK: Jonathan Vance is the exclusive SME for RFC mounter script. Redundancy score of 1."
          },
          {
            "agent": "Digital Twin Agent",
            "action": "Twin replica persona consult",
            "message": "Consulted Vance's replica. Suggestion: 'I've been saying this for years. Train David K. or get someone in Spring. S4HANA isn't black magic, but we need backups.'"
          }
        ],
        "finalAnswer": "High-fidelity summary answering user query including exact mappings, risk numbers, and mitigation steps."
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });

      return res.json(JSON.parse(response.text || "{}"));
    } catch (e) {
      console.error("Agent trace generation error, fallback used:", e);
    }
  }

  // Backup mock trace sequence
  const fallbackSession: CollaborationSession = {
    query: query,
    steps: [
      {
        agent: "Search Agent",
        action: "Metadata Index Match",
        message: "Parsed query tokens. Triggered hybrid vector search on Postgres embeddings. Strong correlations found with 'doc-1: S4HANA Payments v4.2' Authored by Jonathan Vance.",
        timestamp: `${timestamp} - S01`
      },
      {
        agent: "Expert Discovery Agent",
        action: "DGraph Expertise ranking",
        message: "Retrieved skill metrics. ERP Oracle is owned exclusively by Jonathan Vance (SME weight level 1.0). Kafka is owned by Sarah Lin. David K. has works-on logs.",
        timestamp: `${timestamp} - S02`
      },
      {
        agent: "Knowledge Graph Agent",
        action: "Neo4j connection mapping",
        message: "Mapped structural path: Project Atlas [USES] -> S4HANA Ledger [OWNS] -> Jonathan Vance. Payments depend on Kafka Topic queues [OWNED BY] -> Sarah Lin.",
        timestamp: `${timestamp} - S03`
      },
      {
        agent: "Risk Agent",
        action: "Bus Factor scoring",
        message: "ALERT: Bus factor is high. System 'S4HANA Payment Ledger' has redundancy score of 1. Sole SME: Jonathan Vance.",
        timestamp: `${timestamp} - S04`
      },
      {
        agent: "Digital Twin Agent",
        action: "Persona consult simulations",
        message: "Queried Twin: 'If I leave tomorrow, Project Atlas is blind. We need David K. to shadow the RFC connection setup.'",
        timestamp: `${timestamp} - S05`
      }
    ],
    finalAnswer: `Based on unified Multi-Agent discovery, the payments architecture is exposed with a Bus Factor of 1. Jonathan Vance is the direct SME on 'sap-rfc-mounter.sh' mapping Kafka queues to S4HANA. To mitigate, we propose:
    1. Immediately assign David K. to shadow Jonathan.
    2. Conduct SOP review on the RFC mapper script parameters.
    3. Register Sarah Lin as second responder for general cluster handshakes.`,
    timestamp: new Date().toISOString()
  };

  res.json(fallbackSession);
});

// ==========================================
// VITE DEV SERVER AND PRODUCTION ASSETS ENTRY
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Preparing Vite on dev mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Preparing production serving directories...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OIOS Backend Live and Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
