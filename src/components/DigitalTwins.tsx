import React, { useState } from "react";
import { DigitalTwin } from "../types";
import { Users, Send, Settings, Sparkles, CheckCircle, ShieldAlert, BadgeInfo, Zap, CircleDot, HelpCircle } from "lucide-react";

interface DigitalTwinsProps {
  twins: DigitalTwin[];
  onAskTwin: (twinId: string, question: string) => Promise<string>;
}

export default function DigitalTwins({ twins, onAskTwin }: DigitalTwinsProps) {
  const [selectedTwinId, setSelectedTwinId] = useState(twins[0]?.id || "");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Record<string, { role: "user" | "twin"; text: string }[]>>({});
  const [asking, setAsking] = useState(false);

  const selectedTwin = twins.find(t => t.id === selectedTwinId);

  const handleAsk = async () => {
    if (!chatQuestion.trim() || !selectedTwinId) return;
    
    const input = chatQuestion;
    setChatQuestion("");
    setAsking(true);

    // Append user message immediately
    const twinHistory = chatHistory[selectedTwinId] || [];
    const updatedHistory = [...twinHistory, { role: "user" as const, text: input }];
    setChatHistory(prev => ({ ...prev, [selectedTwinId]: updatedHistory }));

    try {
      const responseText = await onAskTwin(selectedTwinId, input);
      setChatHistory(prev => ({
        ...prev,
        [selectedTwinId]: [...(prev[selectedTwinId] || []), { role: "twin" as const, text: responseText }]
      }));
    } catch (e) {
      console.error(e);
      setChatHistory(prev => ({
        ...prev,
        [selectedTwinId]: [...(prev[selectedTwinId] || []), { role: "twin" as const, text: "Error syncing with digital network state. Check backend logs." }]
      }));
    } finally {
      setAsking(false);
    }
  };

  const getPresetQuestion = (twinId: string) => {
    if (twinId === "twin-1") {
      return "Why was the S4HANA payment queue designed around Kafka?";
    } else {
      return "What happens if a broker partition fills up in production?";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* List of Twins & Profile Indicators */}
      <div className="xl:col-span-1 flex flex-col gap-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold px-1">Active Replica Register</span>
        
        <div className="flex flex-col gap-2.5">
          {twins.map((twin) => {
            const isSelected = selectedTwinId === twin.id;
            return (
              <div
                key={twin.id}
                onClick={() => setSelectedTwinId(twin.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col gap-3 ${
                  isSelected 
                    ? "border-blue-500/40 bg-[#161618] shadow-lg" 
                    : "border-white/5 bg-[#0c0c0e] hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#161618] border border-white/10 flex items-center justify-center font-bold text-xs text-slate-300">
                      {twin.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-200 leading-tight">{twin.name}</span>
                      <span className="text-[11px] text-slate-400 leading-none mt-0.5">{twin.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <div className="flex items-center gap-1 leading-none">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-mono font-bold text-blue-400">{(twin.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">Fidelity index</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed italic bg-[#09090b] p-2.5 rounded-lg border border-white/5 line-clamp-2">
                  "{twin.personaDescription}"
                </p>

                {/* Core skills and systems handled */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/10">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Core Knowledge Clusters</span>
                  <div className="flex flex-wrap gap-1">
                    {twin.coreSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-[9px] bg-[#161618] border border-white/5 px-1.5 py-0.5 text-slate-300 rounded font-mono">
                        {skill}
                      </span>
                    ))}
                    {twin.coreSkills.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono self-center">+{twin.coreSkills.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="xl:col-span-2 bg-[#0c0c0e] border border-white/10 rounded-xl flex flex-col min-h-[460px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 bg-[#09090b] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Replica Chat: {selectedTwin ? `${selectedTwin.name}` : "SME Twin"}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">Persona model grounded on authored and referenced source files.</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-300 bg-[#161618] py-1 px-2.5 border border-white/5 rounded-lg font-mono">
            Grounded Docs: <b>{selectedTwinId === "twin-1" ? "3 authored SOP files" : "2 topology manuals"}</b>
          </div>
        </div>

        {/* Chat Messages flow */}
        <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4 max-h-[340px]">
          {/* Welcome message */}
          <div className="p-3 bg-[#09090b]/85 border border-white/10 rounded-xl text-xs text-slate-300 max-w-[85%] flex gap-2">
            <BadgeInfo className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-slate-200 text-xs">System Replica Online</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                I can process queries using my custom-tuned persona and indexed knowledge bases. What specific system design question can I resolve for you?
              </p>
            </div>
          </div>

          {/* History */}
          {selectedTwin && (chatHistory[selectedTwin.id] || []).map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-1 max-w-[85%] ${
                msg.role === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                {msg.role === "user" ? "Consultant" : `${selectedTwin.name}`}
              </span>
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none font-semibold"
                    : "bg-[#09090b] border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-wrap font-sans"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {asking && (
            <div className="self-start flex flex-col gap-1 max-w-[80%] animate-pulse">
              <span className="text-[9px] font-mono text-slate-500 uppercase">{selectedTwin?.name} Replica</span>
              <div className="p-3 bg-[#09090b] border border-white/10 rounded-xl rounded-tl-none flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[10px] text-slate-500 font-mono ml-1">Drafting architecture response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="p-4 bg-[#09090b] border-t border-white/10 flex flex-col gap-2">
          {/* Preset trigger prompts */}
          {selectedTwin && (
            <div className="flex gap-1.5 items-center">
              <span className="text-[9px] text-slate-550 text-slate-400 font-mono uppercase font-bold">Quick Prompt:</span>
              <button
                onClick={() => setChatQuestion(getPresetQuestion(selectedTwin.id))}
                className="text-[10px] text-slate-300 font-medium py-0.5 px-2 bg-[#161618] border border-white/5 rounded hover:border-blue-500/50 hover:text-white transition-colors cursor-pointer"
              >
                {getPresetQuestion(selectedTwin.id)}
              </button>
            </div>
          )}

          <div className="flex gap-1.5 mt-1">
            <input
              type="text"
              placeholder={`Ask ${selectedTwin ? selectedTwin.name : "twin"} for design rationales...`}
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              disabled={asking}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              className="flex-grow bg-[#0c0c0e] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !chatQuestion.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Twin</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
