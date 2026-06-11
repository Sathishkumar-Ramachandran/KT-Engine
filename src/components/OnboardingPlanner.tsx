import React, { useState } from "react";
import { OnboardingPlan } from "../types";
import { Compass, GraduationCap, Calendar, Users, BookOpen, CheckCircle2, Award, ClipboardList, RefreshCw } from "lucide-react";

interface OnboardingPlannerProps {
  onGeneratePlan: (roleName: string, focusSystems: string[]) => Promise<OnboardingPlan>;
}

const SAMPLE_ROLES = [
  "Payment Infrastructure Engineer",
  "SaaS Reliability Associate (SRE)",
  "Junior Ledger DBA",
  "Enterprise Integration Developer"
];

const AVAILABLE_SYSTEMS = [
  "S4HANA Payment Ledger",
  "Core Kafka Cluster",
  "Internal Ledger DB",
  "Project Atlas Ledger Refactor"
];

export default function OnboardingPlanner({ onGeneratePlan }: OnboardingPlannerProps) {
  const [roleName, setRoleName] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["Core Kafka Cluster"]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);

  const toggleSystem = (sys: string) => {
    setSelectedSystems(current => 
      current.includes(sys) ? current.filter(s => s !== sys) : [...current, sys]
    );
  };

  const handleGenerate = async () => {
    const roleToGen = roleName.trim() || SAMPLE_ROLES[0];
    setGenerating(true);
    try {
      const gPlan = await onGeneratePlan(roleToGen, selectedSystems);
      setPlan(gPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* Parameter Inputs sidebar */}
      <div className="xl:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-5 h-fit">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <GraduationCap className="w-5 h-5 text-blue-400 animate-pulse-slow" />
            <h3 className="font-bold text-slate-100 text-sm">AI Onboarding Planner</h3>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
            The Onboarding Agent compiles technical learning paths for new hires. It connects new engineering assignments to exact system dependencies, required SOP specs, and ranked structural mentors from the Knowledge Graph.
          </p>
        </div>

        {/* Input Role Name */}
        <div className="flex flex-col gap-1.5 font-sans">
          <label className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Target Job Title</label>
          <input
            type="text"
            placeholder="e.g. Payment Gateway dev..."
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={generating}
            className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Quick presets list */}
          <div className="flex flex-wrap gap-1.1 mt-1.5">
            {SAMPLE_ROLES.map((r, rIdx) => (
              <button
                key={rIdx}
                type="button"
                onClick={() => setRoleName(r)}
                disabled={generating}
                className="text-[9px] py-1 px-2.5 bg-[#161618] hover:bg-[#0c0c0e] hover:text-white text-slate-350 font-mono rounded border border-white/5 cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Multi Select Systems checkboxes */}
        <div className="flex flex-col gap-2 font-sans">
          <label className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Focus System Modules</label>
          <div className="flex flex-col gap-1.5">
            {AVAILABLE_SYSTEMS.map((sys, idx) => {
              const isChecked = selectedSystems.includes(sys);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSystem(sys)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked 
                      ? "border-blue-500/30 bg-blue-500/[0.02] text-slate-200" 
                      : "border-white/5 bg-[#09090b]/80 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <span>{sys}</span>
                  <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors ${
                    isChecked ? "border-blue-500 bg-blue-600 text-white" : "border-slate-700"
                  }`}>
                    {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compile Trigger Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {generating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling Syllabus...</span>
            </>
          ) : (
            <>
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Deploy AI Onboarding Path</span>
            </>
          )}
        </button>
      </div>

      {/* Compiled Syllabus Output workspace */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        {generating && (
          <div className="flex-grow bg-[#0c0c0e] border border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-450 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-400">Onboarding Agent crawling dependency trees and formulating Learning Milestones...</span>
          </div>
        )}

        {!generating && !plan && (
          <div className="flex-grow bg-[#0c0c0e] border border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center text-slate-500 gap-3 border-dashed bg-[#09090b]/55 col-span-2">
            <GraduationCap className="w-10 h-10 text-slate-600" />
            <div className="flex flex-col gap-0.5 max-w-sm">
              <span className="text-sm font-semibold text-slate-300">Awaiting Syllabus Directives</span>
              <span className="text-xs text-slate-400 leading-relaxed font-sans">Specify a starting Role profile and dependency modules on the left panel to compile an intelligent 90-day learning curriculum.</span>
            </div>
          </div>
        )}

        {!generating && plan && (
          <div className="flex flex-col gap-5 animate-fade-in font-sans">
            {/* Plan Header */}
            <div className="bg-[#0c0c0e] p-4 border border-white/10 rounded-xl flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-blue-400 tracking-wider font-bold">AI AGENT COMPILED PATHWAYS</span>
                <span className="text-base font-extrabold text-slate-100">{plan.roleName} Onboarding Blueprint</span>
              </div>
              <span className="text-xs bg-blue-500/15 border border-blue-500/25 px-2.5 py-1 text-blue-400 font-mono rounded-lg">
                Syllabus Duration: <b>{plan.durationDays} Days</b>
              </span>
            </div>

            {/* In-Depth Weekly Steps */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-widest block mb-1">Checkpoints & Weekly Curriculum</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.learningPath.map((step, idx) => (
                  <div key={idx} className="p-4 bg-[#161618] border border-white/5 rounded-xl flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0c0c0e] border border-white/10 text-xs text-blue-400 font-mono flex items-center justify-center shrink-0 font-bold">
                      W{step.week}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-200 leading-tight">{step.focus}</span>
                      <ul className="flex flex-col gap-1 pr-2">
                        {step.topics.map((t, tIdx) => (
                          <li key={tIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-tight">
                            <span className="text-blue-400 select-none font-bold">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents, Meetings & Mentoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
              
              {/* Readings & Required Assets */}
              <div className="bg-[#161618] border border-white/5 p-4.5 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-slate-300">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold font-mono tracking-wide uppercase">Required Reading Assets</span>
                </div>
                <div className="flex flex-col gap-2">
                  {plan.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-[#0c0c0e] border border-white/5 rounded-lg text-xs text-slate-350 font-mono leading-tight flex items-start gap-1.5">
                      <span className="text-blue-400">📄</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                  {plan.requiredMeetings.map((mtg, idx) => (
                    <div key={idx} className="p-2 bg-[#0c0c0e] border border-white/5 rounded-lg text-xs text-slate-350 font-mono leading-tight flex items-start gap-1.5">
                      <span className="text-indigo-400">📅</span>
                      <span>{mtg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadows & Milestones */}
              <div className="bg-[#161618] border border-white/5 p-4.5 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-slate-300">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold font-mono tracking-wide uppercase">Primary Structural Shadows</span>
                </div>
                <div className="flex flex-col gap-2">
                  {plan.recommendedExperts.map((exp, idx) => (
                    <div key={idx} className="p-2 bg-[#0c0c0e] border border-white/5 rounded-lg text-xs font-sans text-slate-300 leading-tight flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-500/10 text-blue-400 font-mono text-[9px] font-bold rounded-full flex items-center justify-center">S</div>
                      <span>{exp}</span>
                    </div>
                  ))}
                  <div className="mt-1 pt-2.5 border-t border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Syllabus Passing Benchmarks:</span>
                    </span>
                    <ul className="flex flex-col gap-1 bg-[#09090b] p-2.5 border border-white/5 rounded-lg">
                      {plan.milestones.slice(0, 2).map((m, mIdx) => (
                        <li key={mIdx} className="text-[10px] text-slate-400 leading-tight">
                          🏆 {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
