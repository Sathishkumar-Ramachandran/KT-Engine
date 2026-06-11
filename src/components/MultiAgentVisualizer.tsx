import React, { useState } from "react";
import { MultiAgentStep, CollaborationSession } from "../types";
import { Users, Send, Settings, ArrowRight, ShieldCheck, Cpu, Code, HelpCircle, Activity, Hourglass } from "lucide-react";

interface MultiAgentVisualizerProps {
  onRunCollaboration: (query: string) => Promise<CollaborationSession>;
}

const PRESET_QUERIES = [
  "Who can replace the architect responsible for our S4HANA Payment Gateway?",
  "Review our Kafka broker systems, map sole key owners and outline redundancy scores.",
  "Recommend a learning path and expert mentors for joining our Project Atlas Ledger Migration."
];

export default function MultiAgentVisualizer({ onRunCollaboration }: MultiAgentVisualizerProps) {
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);

  // Trigger A2A Agent communication cascade
  const handleTrigger = async (queryText: string) => {
    setLoading(true);
    setActiveStepIdx(-1);
    setActiveSession(null);
    try {
      // Simulate real-time stepping for breathtaking visual layout mechanics
      const result = await onRunCollaboration(queryText);
      setActiveSession(result);

      // Cascade stepping
      for (let i = 0; i < result.steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 850));
        setActiveStepIdx(i);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAgentColor = (agentName: string) => {
    switch (agentName) {
      case "Search Agent": return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
      case "Expert Discovery Agent": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "Knowledge Graph Agent": return "text-violet-400 border-violet-500/20 bg-violet-500/5";
      case "Risk Agent": return "text-red-400 border-red-500/20 bg-red-500/5";
      case "Digital Twin Agent": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      default: return "text-slate-400 border-slate-700 bg-slate-800/20";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Intro Header & Query Presets */}
      <div className="bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
        <div className="flex items-start gap-4 justify-between lg:flex-row flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-extrabold text-slate-100">A2A Broker Protocol Workflows</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              OIOS enforces non-siloed collaboration. When you submit a complex command, specialized system agents collaborate asynchronously using the <b>A2A Federated Protocol</b> to retrieve, query, audit risk metrics, and twin replica feedback for a unified answer.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-[#09090b] border border-white/10 rounded-lg text-[10px] font-mono text-blue-400 font-bold shrink-0">
            <Cpu className="w-3.5 h-3.5 animate-spin-slow text-blue-400" />
            <span>A2A PROTOCOL V1.2 ACTIVE</span>
          </div>
        </div>

        {/* Query Builder box */}
        <div className="mt-5 flex flex-col gap-3 font-sans">
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Ask OIOS: 'Who can replace the SRE responsible for our message pipelines?'"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              disabled={loading}
              className="flex-grow bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => handleTrigger(customQuery || "Who can replace the payments lead?")}
              disabled={loading || (!customQuery && !PRESET_QUERIES[0])}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Run A2A Case
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Select Enterprise Scenarios</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomQuery(q);
                    handleTrigger(q);
                  }}
                  disabled={loading}
                  className="py-1 px-3 bg-[#161618] border border-white/5 rounded-md text-[11px] text-slate-300 hover:border-blue-500/50 hover:text-white transition-colors text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Diagram & Unified Output */}
      { (loading || activeSession) && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
          
          {/* Cascade Stepping Trace Logger */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Collaborating Systems Loop</span>
              <span className="text-xs font-mono text-slate-500">Live Agent Bus Logs</span>
            </div>

            {/* Stepped Timeline */}
            <div className="flex flex-col gap-3">
              {/* If empty but loading */}
              {loading && activeStepIdx === -1 && (
                <div className="py-10 text-center flex flex-col items-center justify-center gap-2 font-mono">
                  <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
                  <span className="text-xs text-slate-400">Searching metadata and traversing Neo4j endpoints...</span>
                </div>
              )}

              {/* Step Cascaders */}
              {activeSession && activeSession.steps.map((step, idx) => {
                const isActive = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                if (!isActive) return null;

                return (
                  <div 
                    key={idx} 
                    className={`p-4 border rounded-xl flex gap-3.5 transition-all duration-300 ${
                      isCurrent 
                        ? "border-blue-500/30 bg-blue-500/[0.03] ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                        : "border-white/5 bg-[#161618]"
                    }`}
                  >
                    {/* Agent Dot Indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs ${
                        isCurrent 
                          ? "bg-blue-500 text-white border-blue-300 animate-bounce" 
                          : "bg-[#0c0c0e] border-white/10 text-slate-400"
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < activeSession.steps.length - 1 && (
                        <div className="w-[1.5px] h-full bg-white/10 mt-2 min-h-[30px]" />
                      )}
                    </div>

                    {/* Agent content segment */}
                    <div className="flex-grow flex flex-col gap-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono py-0.5 px-2 border rounded font-bold uppercase tracking-wide ${getAgentColor(step.agent)}`}>
                          {step.agent}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">Action: <b>{step.action}</b></span>
                      </div>
                      
                      <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">{step.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combined AI Answer Delivery Card */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 flex flex-col gap-4 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl h-fit">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-[#ffffff] text-xs font-sans uppercase tracking-widest">Unified Synthesis Output</h4>
              </div>

              {activeStepIdx < (activeSession?.steps.length || 0) - 1 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-450 rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-400 text-center leading-relaxed">Formulating unified analysis as decentralized agents return data registers...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fade-in font-sans">
                  <div className="text-[11px] bg-blue-500/10 text-blue-400 p-2.5 border border-blue-500/20 rounded-lg font-sans leading-relaxed">
                    <b>A2A Convergence Match: 100%</b>. Scenarios analyzed, risk indexes audited, and Digital SME replica mapped successfully.
                  </div>

                  <div className="flex flex-col gap-1 bg-[#161618] p-4 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Decentralized Final Resolution</span>
                    <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line mt-1 font-sans font-medium">
                      {activeSession?.finalAnswer}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <span className="font-mono text-slate-500 font-bold uppercase tracking-wider text-[10px]">Extracted Paths Included:</span>
                    <div className="p-2 bg-[#161618] border border-white/5 rounded-lg font-mono text-[10px] text-slate-400 flex flex-col gap-1">
                      <div>📁 [Source Docs]: S4HANA SOP and Outage report</div>
                      <div>👥 [Primary SMEs]: Jonathan Vance, Sarah Lin</div>
                      <div>🚨 [Structural Risk score]: High (Mitigation active)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
