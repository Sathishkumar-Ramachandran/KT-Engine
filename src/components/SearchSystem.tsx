import React, { useState } from "react";
import { Search, Database, FileText, ChevronRight, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { IngestedDocument } from "../types";

interface SearchHit {
  document: IngestedDocument;
  elasticsearchScore: number;
  vectorSimilarity: number;
  hybridScore: number;
}

interface SearchResults {
  query: string;
  hits: SearchHit[];
  matchedNodes: any[];
  aiSynthesis: string;
}

interface SearchSystemProps {
  onSearch: (query: string) => Promise<SearchResults>;
}

export default function SearchSystem({ onSearch }: SearchSystemProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const searchData = await onSearch(query);
      setResults(searchData);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const loadPresetQuery = (q: string) => {
    setQuery(q);
    setTimeout(() => {
      setSearching(true);
      onSearch(q).then(res => {
        setResults(res);
        setSearching(false);
      });
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Enterprise search input column */}
      <div className="xl:col-span-1 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-4 h-fit">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Search className="w-5 h-5 text-blue-400 animate-pulse-slow" />
            <h3 className="font-bold text-slate-100 text-sm">Enterprise Search</h3>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Ask OIOS architectural queries using natural language. We route requests through our dense-vector (Qdrant semantic weights) and sparse-term (Elastic keyword matches) hybrid index server.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask: 'S4HANA mapping rules'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={searching}
            className="flex-grow bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="py-1.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {searching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Scenarios presets */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest block mb-1">Semantic Index Presets</span>
          <div className="flex flex-col gap-1.5">
            {[
              "Explain our kafka partition setup",
              "Who wrote the S4HANA mapping blueprint?",
              "What led to our Strategic Payments outage?",
              "Project Atlas database ledger targets"
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPresetQuery(preset)}
                disabled={searching}
                className="text-left py-1.5 text-xs px-2.5 rounded bg-[#161618] hover:bg-[#0c0c0e] hover:text-white text-slate-300 font-medium transition-colors border border-white/5 truncate cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Workspace Column */}
      <div className="xl:col-span-2 flex flex-col gap-5 min-h-[380px]">
        
        {searching && (
          <div className="flex-grow bg-[#0c0c0e] border border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-450 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-400">Walking Neo4j schemas, computing sparse-dense similarity maps...</span>
          </div>
        )}

        {!searching && !results && (
          <div className="flex-grow bg-[#0c0c0e] border border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center text-slate-500 gap-3 border-dashed">
            <Database className="w-10 h-10 text-slate-600" />
            <div className="flex flex-col gap-0.5 max-w-sm">
              <span className="text-sm font-semibold text-slate-300">Semantic Search Active</span>
              <span className="text-xs text-slate-400 leading-relaxed">Input a search term or select an indexing preset on the left panel to scan enterprise architectural records.</span>
            </div>
          </div>
        )}

        {!searching && results && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* 1. Smart Synthesis Summary */}
            <div className="p-4 bg-blue-900/[0.05] border border-blue-500/25 rounded-xl flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-500/10">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse-slow" />
                <span className="text-xs font-bold text-slate-200">Sparse/Dense Hybrid LLM Synthesis</span>
              </div>
              <p className="text-xs font-sans leading-relaxed text-slate-300 whitespace-pre-wrap">
                {results.aiSynthesis}
              </p>
            </div>

            {/* 2. List of Matching File Hits */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-[#0c0c0e] p-2 border border-white/10 rounded-lg px-4 text-xs">
                <span className="text-slate-400 font-semibold uppercase font-mono text-[9px] tracking-wider">Enterprise Ingestion File Hits</span>
                <span className="text-slate-500 font-mono">Found {results.hits.length} matches</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {results.hits.length > 0 ? (
                  results.hits.map((hit) => (
                    <div key={hit.document.id} className="p-4 bg-[#161618] border border-white/5 rounded-xl flex flex-col gap-3">
                      
                      {/* Top Header metrics */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{hit.document.title}</span>
                            <span className="text-[9px] font-mono text-slate-500">Author: {hit.document.author} • {hit.document.type} • {hit.document.date}</span>
                          </div>
                        </div>

                        {/* Scores badge */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 py-0.5 px-2 rounded border border-blue-500/20 font-mono font-bold">
                              Match: {hit.hybridScore}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">Sparse/Dense Score</span>
                          </div>
                        </div>
                      </div>

                      {/* Content extract */}
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-[#0c0c0e]/80 p-2.5 rounded-lg border border-white/10 line-clamp-3">
                        {hit.document.content}
                      </p>

                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500 bg-[#161618] rounded-xl border border-dashed border-white/10">
                    <AlertCircle className="w-7 h-7 text-slate-600 mb-1" />
                    <span className="text-xs">No matching indices found. Re-phrase terms.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
