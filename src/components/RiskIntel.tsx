import React from "react";
import { RiskEmployee, RiskSystem } from "../types";
import { ShieldAlert, Users, Layers, TrendingUp, Compass, AlertCircle, Sparkles, CheckCircle } from "lucide-react";

interface RiskIntelProps {
  overallRiskScore: number;
  enterpriseBusFactor: number;
  atRiskEmployees: RiskEmployee[];
  atRiskSystems: RiskSystem[];
}

export default function RiskIntel({ overallRiskScore, enterpriseBusFactor, atRiskEmployees, atRiskSystems }: RiskIntelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Risk dials and high level metrics */}
      <div className="lg:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-slate-100 text-sm">Risk Intel Dashboard</h3>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            The Knowledge Risk Agent monitors system updates, documentation frequency, and code author logs to audit concentrations, single-points-of-failure (SPOFs), and general vulnerability levels.
          </p>
        </div>

        {/* Big Risk score dial */}
        <div className="flex flex-col items-center justify-center py-6 bg-[#09090b] rounded-xl border border-white/10 relative">
          <div className="absolute top-2.5 right-3 px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-mono border border-red-500/20 rounded">
            LEVEL: HIGH
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle track and fill */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#161618"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#ef4444"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * overallRiskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-100">{overallRiskScore}%</span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">SYSTEM RISK</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full px-5 mt-4 pt-4 border-t border-white/5 text-center">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-100 font-mono">{enterpriseBusFactor}</span>
              <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Enterprise Bus Factor</span>
            </div>
            <div className="flex flex-col border-l border-white/5">
              <span className="text-xl font-bold text-red-400 font-mono">{atRiskEmployees.length}</span>
              <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">SME Bottlenecks</span>
            </div>
          </div>
        </div>

        {/* AI risk mitigation guide summary */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-200">Mitigation Priority Active</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jonathan Vance holds exclusive mapping and execution credentials for <b>S4HANA Payment Gateway</b>. Departure raises systemic downtime vulnerability by <b>92%</b>.
            </p>
          </div>
        </div>
      </div>

      {/* High-Risk Systems list */}
      <div className="lg:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Top Vulnerable Key Systems</h3>
        </div>

        <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[380px] pr-1">
          {atRiskSystems.map((sys) => (
            <div key={sys.systemId} className="bg-[#161618] p-3.5 border border-white/5 rounded-xl flex flex-col gap-2 relative">
              {sys.riskLevel === "High" && (
                <span className="absolute top-3.5 right-3.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}

              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-semibold">System of Dependency</span>
                <span className="text-sm font-bold text-slate-200">{sys.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0c0c0e]/85 p-2 rounded-lg border border-white/5">
                <div className="flex flex-col">
                  <span className="text-slate-500 uppercase font-mono text-[9px]">Redundancy Status</span>
                  <span className={`font-semibold font-mono ${sys.redundancyScore < 2 ? "text-yellow-500" : "text-blue-400"}`}>
                    {sys.redundancyScore} / 5 SMEs
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 uppercase font-mono text-[9px]">Criticality</span>
                  <span className={`font-semibold ${sys.criticality === "High" ? "text-red-400" : "text-yellow-400"}`}>
                    {sys.criticality} Level
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between mt-1 pt-1.5 border-t border-white/5 font-sans">
                <span className="text-[10px] text-slate-500">Sole Core SME:</span>
                <span className="font-semibold text-slate-300 bg-[#09090b] px-2 py-0.5 rounded border border-white/5">
                  {sys.soleSMEName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top vulnerable employees with auto-generated mitigations */}
      <div className="lg:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm">Bottleneck SME Profiles</h3>
        </div>

        <div className="flex flex-col gap-3.5 flex-grow overflow-y-auto max-h-[380px] pr-1">
          {atRiskEmployees.map((emp) => (
            <div key={emp.employeeId} className="bg-[#161618] p-3.5 border border-white/5 rounded-xl flex flex-col gap-2.5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-200">{emp.name}</span>
                  <span className="text-xs text-slate-400">{emp.role}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-extrabold text-red-400">{emp.riskScore}%</span>
                  <span className="text-[8px] font-mono text-slate-500 leading-none">RISK WEIGHT</span>
                </div>
              </div>

              {/* Skills silos */}
              <div className="flex flex-wrap gap-1.5">
                {emp.knowledgeConcentration.map((skill, sIdx) => (
                  <span key={sIdx} className="text-[10px] bg-[#0c0c0e] border border-white/5 px-2 py-0.5 text-slate-300 rounded font-mono">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Auto mitigations */}
              <div className="p-2.5 bg-[#09090b]/85 border border-white/10 rounded-lg flex flex-col gap-0.5 text-xs">
                <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-400 font-mono tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse-slow" />
                  <span>Agent Mitigation Directive</span>
                </div>
                <p className="text-slate-400 leading-relaxed mt-1 text-[11px] font-sans">
                  {emp.mitigationPlan}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
