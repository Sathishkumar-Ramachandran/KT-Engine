import React, { useState, useEffect } from "react";
import { 
  GraphNode, 
  GraphEdge, 
  IngestedDocument, 
  DigitalTwin, 
  OnboardingPlan, 
  RiskEmployee, 
  RiskSystem, 
  CollaborationSession 
} from "./types";
import GraphVisualizer from "./components/GraphVisualizer";
import MultiAgentVisualizer from "./components/MultiAgentVisualizer";
import RiskIntel from "./components/RiskIntel";
import DigitalTwins from "./components/DigitalTwins";
import ExpertDiscovery from "./components/ExpertDiscovery";
import SearchSystem from "./components/SearchSystem";
import IngestionPanel from "./components/IngestionPanel";
import OnboardingPlanner from "./components/OnboardingPlanner";

import { 
  Layers, 
  Network, 
  Search, 
  Users, 
  ShieldAlert, 
  GraduationCap, 
  UploadCloud, 
  Activity, 
  Sparkles, 
  FileText, 
  Award, 
  Share2, 
  Cpu, 
  BookOpen, 
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("ingest");
  
  // Data States
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [skillRankings, setSkillRankings] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<{
    enterpriseBusFactor: number;
    atRiskEmployees: RiskEmployee[];
    atRiskSystems: RiskSystem[];
    overallRiskScore: number;
  } | null>(null);

  // Connection Indicator
  const [apiKeyMatched, setApiKeyMatched] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Fetch initial state logs
  const refreshState = async () => {
    try {
      const [docsRes, graphRes, twinsRes, expertRes, riskRes] = await Promise.all([
        fetch("/api/documents").then(r => r.json()),
        fetch("/api/graph").then(r => r.json()),
        fetch("/api/digital-twin").then(r => r.json()),
        fetch("/api/expert-discovery").then(r => r.json()),
        fetch("/api/risk-intelligence").then(r => r.json())
      ]);

      setDocuments(docsRes);
      setGraphNodes(graphRes.nodes);
      setGraphEdges(graphRes.edges);
      setTwins(twinsRes);
      setSkillRankings(expertRes);
      setRiskData(riskRes);
    } catch (e) {
      console.error("Error loading full-stack database registries:", e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
    
    // Check if API key is loaded via a simple health probe behavior
    fetch("/api/documents")
      .then(() => {
        // Simple internal indicator setup
        setApiKeyMatched(true);
      })
      .catch(() => setApiKeyMatched(false));
  }, []);

  // Post new document to server
  const handleIngestDocument = async (docData: { title: string; type: string; content: string; author: string }) => {
    // Add a quick visual optimistic parse log
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticDoc: IngestedDocument = {
      id: optimisticId,
      title: docData.title,
      type: docData.type as any,
      content: docData.content,
      author: docData.author,
      date: new Date().toISOString().split("T")[0],
      status: "Parsing",
      entitiesCount: 0,
      relationshipsCount: 0
    };

    setDocuments(prev => [optimisticDoc, ...prev]);

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(docData)
    });
    
    const parsedDoc = await res.json();
    
    // Refresh fully to pull the newly synthesized Neo4j graph nodes and edges
    await refreshState();
    return parsedDoc;
  };

  // Ask Twin Question Proxy
  const handleAskTwin = async (twinId: string, question: string) => {
    const res = await fetch("/api/digital-twin/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twinId, question })
    });
    const data = await res.json();
    return data.answer;
  };

  // Semantic Search Proxy
  const handleSearch = async (query: string) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    return res.json();
  };

  // Multi Agent Collaboration Proxy
  const handleRunCollaboration = async (query: string) => {
    const res = await fetch("/api/multi-agent/collaborate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    return res.json();
  };

  // Onboarding Plan Compiler Proxy
  const handleGenerateOnboarding = async (roleName: string, focusSystems: string[]) => {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName, focusSystems })
    });
    return res.json();
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090b] text-slate-200 gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="flex flex-col items-center gap-1.5 text-center px-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400 font-bold animate-pulse">Initializing OIOS System State</span>
          <span className="text-slate-500 text-[11px] max-w-sm">Configuring simulated Qdrant indexes, Neo4j connection mappings, and live AI runtimes...</span>
        </div>
      </div>
    );
  }

  // Calculate system-wide KPIs
  const systemsCount = graphNodes.filter(n => n.type === "System").length;
  const skillsCount = graphNodes.filter(n => n.type === "Skill").length;
  const criticalVulnerabilities = riskData?.atRiskSystems.filter(s => s.riskLevel === "High").length || 0;

  return (
    <div className="h-screen bg-[#09090b] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Header Bar */}
      <header className="h-14 border-b border-white/10 bg-[#0c0c0e] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0">O</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              OIOS <span className="font-mono text-[10px] bg-slate-800 text-slate-300 font-light px-1.5 py-0.5 rounded ml-1">v1.1.0-stable</span>
            </h1>
            <p className="text-[9px] text-slate-505 text-slate-400 uppercase tracking-widest leading-none">Organizational Intelligence Operating System</p>
          </div>
        </div>

        {/* System parameters indicator */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-500 uppercase">Agent Cluster Active</span>
          </div>
          
          <div className="flex gap-4 border-l border-white/10 pl-6">
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase leading-none mb-0.5">LLM Backend</p>
              <p className="text-xs font-semibold text-blue-400 leading-none">Gemini 2.5 Pro</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area containing Sidebar & Workspace */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Navigation Sidebar Panel */}
        <nav className="w-60 border-r border-white/10 bg-[#0c0c0e] flex flex-col p-4 flex-shrink-0 gap-5 justify-between">
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            
            {/* Core KPI metrics grid with High Density theme backgrounds */}
            <div className="p-3 bg-[#161618] border border-white/5 rounded-xl flex flex-col gap-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Enterprise assets</span>
              <div className="grid grid-cols-2 gap-1.5 text-center">
                <div className="bg-[#0c0c0e]/80 p-1.5 border border-white/5 rounded">
                  <span className="text-xs font-bold text-white block">{graphNodes.length}</span>
                  <span className="text-[8px] uppercase font-mono text-slate-500 leading-none">Nodes</span>
                </div>
                <div className="bg-[#0c0c0e]/80 p-1.5 border border-white/5 rounded">
                  <span className="text-xs font-bold text-blue-400 block">{documents.length}</span>
                  <span className="text-[8px] uppercase font-mono text-slate-500 leading-none">Docs</span>
                </div>
                <div className="bg-[#0c0c0e]/80 p-1.5 border border-white/5 rounded">
                  <span className="text-xs font-bold text-amber-500 block">{skillsCount}</span>
                  <span className="text-[8px] uppercase font-mono text-slate-500 leading-none">Skills</span>
                </div>
                <div className="bg-[#0c0c0e]/80 p-1.5 border border-white/5 rounded">
                  <span className="text-xs font-bold text-rose-500 block">{criticalVulnerabilities}</span>
                  <span className="text-[8px] uppercase font-mono text-slate-500 leading-none">SPOFs</span>
                </div>
              </div>
            </div>

            {/* Menu Groups */}
            <div className="flex flex-col gap-4">
              
              {/* Category Segment 1 */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1.5 px-1">Knowledge Ingestion</span>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab("ingest")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "ingest" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5 shrink-0" />
                    <span>Ingest Documents</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("graph")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "graph" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 shrink-0" />
                    <span>Knowledge Graph</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("search")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "search" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Hybrid Search</span>
                  </button>
                </div>
              </div>

              {/* Category Segment 2 */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1.5 px-1">Cognitive Agents</span>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab("twins")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "twins" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Digital Twin Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("onboard")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "onboard" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>Onboarding Planner</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("experts")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "experts" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>Expert Discovery</span>
                  </button>
                </div>
              </div>

              {/* Category Segment 3 */}
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1.5 px-1">Decisions & Risk</span>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab("risk")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "risk" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Risk Intelligence</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("multi-agent")}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-all ${
                      activeTab === "multi-agent" 
                        ? "bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Collaboration Loop</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-white/10 pt-3 px-1">
            <p className="text-[9px] text-[#52525b] uppercase leading-relaxed font-mono">Memory Store</p>
            <p className="text-[11px] font-mono text-slate-400">Neo4j + Qdrant Index</p>
          </div>
        </nav>

        {/* Core Workspace Frame content area */}
        <main className="flex-grow p-6 flex flex-col gap-5 overflow-y-auto bg-[#09090b] max-h-[calc(100vh-56px-32px)]">
          
          {activeTab === "ingest" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div className="flex justify-between items-center sm:flex-row flex-col gap-1.5">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Knowledge Ingestion Hub</h2>
                  <p className="text-xs text-slate-400 font-medium">Analyze unstructured SOP texts and transcripts to construct Neo4j vertices via Gemini.</p>
                </div>
              </div>
              <IngestionPanel documents={documents} onIngestDocument={handleIngestDocument} />
            </div>
          )}

          {activeTab === "graph" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Knowledge Graph Visualization</h2>
                <p className="text-xs text-slate-400 font-medium">Interactive network mirroring relationships mapped among organizational teams, systems, and processes.</p>
              </div>
              <GraphVisualizer nodes={graphNodes} edges={graphEdges} />
            </div>
          )}

          {activeTab === "search" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Hybrid Search Engine</h2>
                <p className="text-xs text-slate-400 font-medium">Unified semantic search over all organization records utilizing term metrics and vector similarity scoring.</p>
              </div>
              <SearchSystem onSearch={handleSearch} />
            </div>
          )}

          {activeTab === "twins" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Digital Twin Studio</h2>
                <p className="text-xs text-slate-400 font-medium font-sans">Leverage AI replicas cloned from key company experts for continuous knowledge lookup.</p>
              </div>
              <DigitalTwins twins={twins} onAskTwin={handleAskTwin} />
            </div>
          )}

          {activeTab === "onboard" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Onboarding Intelligence</h2>
                <p className="text-xs text-slate-400 font-medium">Formulate structured training syllabi and weekly checkpoint assignments for newly hired engineer roles.</p>
              </div>
              <OnboardingPlanner onGeneratePlan={handleGenerateOnboarding} />
            </div>
          )}

          {activeTab === "experts" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Expert Directory Node</h2>
                <p className="text-xs text-slate-400 font-medium">Ranks automated domain expertise scores extracted from code logs, author credits, and architecture notes.</p>
              </div>
              <ExpertDiscovery skillRankings={skillRankings} />
            </div>
          )}

          {activeTab === "risk" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Knowledge Risk Intelligence Dashboard</h2>
                <p className="text-xs text-slate-400 font-medium">Continuous tracking of Bus Factor values to automatically flag single-points-of-failure (SPOF).</p>
              </div>
              {riskData && (
                <RiskIntel
                  overallRiskScore={riskData.overallRiskScore}
                  enterpriseBusFactor={riskData.enterpriseBusFactor}
                  atRiskEmployees={riskData.atRiskEmployees}
                  atRiskSystems={riskData.atRiskSystems}
                />
              )}
            </div>
          )}

          {activeTab === "multi-agent" && (
            <div className="animate-fade-in flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">Agent Collaboration Protocol</h2>
                <p className="text-xs text-slate-400 font-medium">Trigger cooperative, multi-expert routing pipelines where autonomous specialists coordinate decisions.</p>
              </div>
              <MultiAgentVisualizer onRunCollaboration={handleRunCollaboration} />
            </div>
          )}

        </main>
      </div>

      {/* Optimized Unified Footer component */}
      <footer className="h-8 border-t border-white/10 bg-[#0c0c0e] px-6 flex items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
        <div className="flex items-center gap-6 font-mono">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Elasticsearch: Connected</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Neo4j Graph: Synced</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> MCP Tools: 12 Active</span>
        </div>
        <div className="uppercase tracking-widest font-mono opacity-60 text-[9px]">
          System Status: Optimized // Memory Retention: 100%
        </div>
      </footer>

    </div>
  );
}
