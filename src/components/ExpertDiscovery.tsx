import React, { useState, useMemo } from "react";
import { Award, Compass, Search, UserCheck, ShieldCheck, Library, ExternalLink, Sparkles } from "lucide-react";

interface Expert {
  employeeId: string;
  name: string;
  role: string;
  weightScore: number;
  proofOfExpertise: string;
}

interface SkillRank {
  skillId: string;
  skillName: string;
  field: string;
  experts: Expert[];
}

interface ExpertDiscoveryProps {
  skillRankings: SkillRank[];
}

export default function ExpertDiscovery({ skillRankings }: ExpertDiscoveryProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skillRankings[0]?.skillId || "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = useMemo(() => {
    return skillRankings.filter(s => 
      s.skillName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skillRankings, searchTerm]);

  const activeSkill = useMemo(() => {
    return skillRankings.find(s => s.skillId === selectedSkillId);
  }, [skillRankings, selectedSkillId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Skill list with quick lookup filter */}
      <div className="lg:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Award className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-sm">Enterprise Skill Map</h3>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            The Expert Discovery agent extracts credentials, written architectures, and system activity logs to continuously map expert networks across OIOS systems.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-550 text-slate-500" />
          <input
            type="text"
            placeholder="Search skills (e.g. SAP, Kafka)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#09090b] border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
          />
        </div>

        {/* Skill Cards clickable list */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
          {filteredSkills.map((skill) => {
            const isSelected = selectedSkillId === skill.skillId;
            return (
              <div
                key={skill.skillId}
                onClick={() => setSelectedSkillId(skill.skillId)}
                className={`p-3 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                  isSelected 
                    ? "border-blue-500/30 bg-[#161618] shadow-md" 
                    : "border-white/5 bg-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-200">{skill.skillName}</span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">{skill.field}</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-blue-400 font-mono bg-blue-500/10 py-0.5 px-2 border border-blue-500/25 rounded">
                    SMEs: {skill.experts.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SME Rankings list details */}
      <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col justify-between min-h-[380px]">
        {activeSkill ? (
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Expert Rankings for</span>
                <h4 className="text-base font-extrabold text-slate-100">{activeSkill.skillName}</h4>
              </div>
              <span className="text-[10px] bg-[#09090b] border border-white/10 px-3 py-1 text-slate-400 font-mono rounded-lg">
                Domain: <b>{activeSkill.field}</b>
              </span>
            </div>

            {/* List of ranked Employees */}
            <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[280px]">
              {activeSkill.experts.length > 0 ? (
                activeSkill.experts.map((expert, idx) => (
                  <div key={expert.employeeId} className="bg-[#161618] p-4 border border-white/5 rounded-xl relative flex justify-between items-start gap-4">
                    {/* Rank Badge */}
                    <div className="absolute top-0 right-14 transform -translate-y-1/2 flex items-center gap-1">
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 py-0.5 px-2 border border-blue-500/20 rounded font-mono font-bold uppercase tracking-wider">
                        SME WEIGHT: {expert.weightScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#0c0c0e] border border-white/10 flex items-center justify-center font-bold text-slate-400 font-mono text-xs uppercase shrink-0">
                        #{idx + 1}
                      </div>

                      <div className="flex flex-col gap-1 pr-6 flex-1">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">{expert.name}</span>
                          <span className="text-[11px] text-slate-400">{expert.role}</span>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 bg-[#0c0c0e]/85 p-2.5 rounded-lg border border-white/5 mt-1 leading-relaxed font-sans">
                          <b className="text-slate-350">Expertise Proof:</b> {expert.proofOfExpertise}
                        </p>
                      </div>
                    </div>

                    {/* Direct Contact / twin access link */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-mono font-bold">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
                  <UserCheck className="w-8 h-8 text-slate-600 mb-1" />
                  <span className="text-xs">No SME mapping recorded for this skill segment.</span>
                </div>
              )}
            </div>

            {/* AI Expert path advice */}
            <div className="bg-blue-500/5 mt-4 p-3 border border-blue-500/10 rounded-xl flex gap-3 items-center">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 animate-pulse-slow" />
              <div className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Skill networks update autonomously on every git commit sync and document parser run. To query {activeSkill.experts[0]?.name || "the lead expert"}'s cognitive base directly, open the <b>Digital Twins</b> console.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500 flex-grow border border-dashed border-white/10 rounded-lg bg-[#09090b]/55">
            <Compass className="w-10 h-10 text-slate-600 mb-2" />
            <span className="text-xs leading-relaxed font-sans">Select a skill core from the left pane map to retrieve active enterprise directories.</span>
          </div>
        )}
      </div>

    </div>
  );
}
