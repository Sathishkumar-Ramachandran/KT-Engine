# OIOS — Organizational Intelligence Operating System

> **"The Memory Layer for Enterprises"**
> Designed by Principal AI Architects & Staff Engineers at Google.

OIOS is an AI-Native Organizational Intelligence Operating System that captures, understands, evolves, and democratizes organizational memory. By representing company knowledge as an interactive network of people, skills, decisions, systems, and documents, OIOS de-risks key-man dependencies, accelerates engineer onboarding, and optimizes strategic decisions through multi-agent collaboration.

---

## 🛠️ System Architecture

OIOS is structured as a full-stack, event-informed enterprise platform:

```
                  ┌────────────────────────────────────────┐
                  │          OIOS React Client             │
                  │   (Ingestion, Graph, Twins, Risk)      │
                  └───────────────────┬────────────────────┘
                                      │ (Hunts API)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │        Express Full-Stack Server       │
                  │     (Port 3000 Ingress Routing Mode)   │
                  └──────┬──────────────────────────┬──────┘
                         │                          │
    ┌────────────────────▼────────────────────┐     │ (Grounded Personas)
    │     Simulated Neo4j Graph Index         │     ▼
    │      & Dense/Sparse Elasticsearch       │  ┌─────────────────────────┐
    │          (In-Memory DB Ledger)          │  │     Google GenAI        │
    └─────────────────────────────────────────┘  │      Gemini SDK         │
                                                 │   (gemini-3.5-flash)    │
                                                 └─────────────────────────┘
```

---

## 📂 Folder Structure

```
├── .env.example             # Environment variables placeholders
├── metadata.json            # OIOS App metadata and permissions
├── package.json             # Full-stack dependencies & esbuild compilation
├── server.ts                # App entrypoint (Express APIs & Vite Middleware)
└── src/
    ├── App.tsx              # Core dashboard layout and Tab manager
    ├── types.ts             # Strict TypeScript declarations (Node, Edge types)
    ├── main.tsx             # React Mount entrypoint
    ├── index.css            # Tailwind global stylesheets
    └── components/
        ├── GraphVisualizer.tsx     # Live SVG Neo4j Knowledge Graph Canvas
        ├── MultiAgentVisualizer.tsx# Live sequence loops for A2A protocols
        ├── RiskIntel.tsx           # Risk metrics & Bus Factor analysis charts
        ├── DigitalTwins.tsx        # Persona Chat with AI Employee replicas
        ├── ExpertDiscovery.tsx     # SME directories and skill-tree lists
        ├── SearchSystem.tsx        # Hybrid search with dense/sparse metrics
        ├── IngestionPanel.tsx      # SOP & Transcripts uploads with entity parses
        └── OnboardingPlanner.tsx   # Onboarding curriculums & Weekly trackers
```

---

## 🚀 Execution & Command-Line Guide

The application comes compiled and pre-configured out-of-the-box. To run local systems development:

### 1. Configure Secrets
Create an environment file or make sure `GEMINI_API_KEY` is loaded:
```bash
# .env
GEMINI_API_KEY="AI_STUDIO_API_KEY_HERE"
```

### 2. Live Run
Boot development servers synchronously bound to Port 3000:
```bash
npm run dev
```

### 3. Production Compilation
Bundle the Vite single-page layouts along with the esbuild CJS server bundle:
```bash
npm run build
npm start
```

---

## 💾 Core Schemas

### 1. Neo4j Graph Database Node Mapping

```typescript
export interface GraphNode {
  id: string;
  type: NodeType; // Employee | Skill | Project | System | Process | Customer | Meeting | Decision | Document
  name: string;
  label: string;
  properties: Record<string, any>;
}
```

### 2. Multi-Agent Sequential Trace Mapping (A2A Protocol)

```typescript
export interface MultiAgentStep {
  agent: string;      // Search Agent | Expert Agent | Graph Agent | Risk Agent | Twin Agent
  action: string;     // Retrieval, SME Rank mapping, Graph paths traversals, Bus Factors
  message: string;    // Compiled structured trace message payloads
  timestamp: string;  
}
```
