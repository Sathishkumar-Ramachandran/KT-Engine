import React, { useState } from "react";
import { IngestedDocument } from "../types";
import { UploadCloud, FileText, CheckCircle, Clock, ShieldAlert, FileCode, Users, PlusCircle, Sparkles, RefreshCw } from "lucide-react";

interface IngestionPanelProps {
  documents: IngestedDocument[];
  onIngestDocument: (doc: { title: string; type: string; content: string; author: string }) => Promise<IngestedDocument>;
}

// Staggeringly beautiful template payloads so they are ready out-of-the-box to enrich OIOS
const TEMPLATE_DOCS = [
  {
    title: "PostgreSQL High Availability replication & Failover SOP",
    type: "SOP",
    author: "Elena Rostova",
    content: `OIOS POSTGRESQL FAILOVER GUIDE v1.0
Author: Elena Rostova (Lead Database Administrator)

Database Topology:
- Internal Ledger DB uses PostgreSQL v16 on Cloud Run GKE.
- Replica nodes exist in us-central1 and us-east1 to de-risk outages.
- Sync replication is triggered by PgPool-II orchestration maps.

Key Ownership block:
Elena Rostova controls the recovery keys. Project Atlas targets migrations away from legacy oracle systems straight inside this internal ledger database.`
  },
  {
    title: "Outage Incident Retrospective: Kafka Consumer lag spikes",
    type: "Transcript",
    author: "David K.",
    content: `TRANSCRIPT: HIGH SEVERITY EVENT EMERGENCY CORRELATION
Attendees: Sarah Lin, David K., Jonathan Vance

David: The core Kafka Cluster broker partitions backed up during Project Atlas ledger migration tests.
Sarah: The consumers listening to the 'payment-ingress-v2' topic stalled because their buffer allocation was set to standard pre-build layouts. We should configure horizontal replica partitions instead.
Jonathan: Let's increase standard partitions from 12 to 32 and update our S4HANA mapper sync threads. Sarah will run the topology upgrade.`
  }
];

export default function IngestionPanel({ documents, onIngestDocument }: IngestionPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("SOP");
  const [author, setAuthor] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setUploading(true);
    try {
      await onIngestDocument({
        title,
        type,
        content,
        author: author || "System Ingestion Administrator"
      });
      // Clear forms
      setTitle("");
      setContent("");
      setAuthor("");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleApplyTemplate = async (template: typeof TEMPLATE_DOCS[0]) => {
    setUploading(true);
    try {
      await onIngestDocument({
        title: template.title,
        type: template.type,
        content: template.content,
        author: template.author
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Create / Upload form */}
      <div className="lg:col-span-2 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <UploadCloud className="w-5 h-5 text-blue-400 animate-pulse-slow" />
          <h3 className="font-bold text-slate-100 font-sans text-sm">Ingestion Console</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Disaster Recovery SOP, API Specs..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={uploading}
              className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Double column inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Document Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={uploading}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              >
                <option value="SOP">SOP Guide</option>
                <option value="Architecture">Architecture SOP</option>
                <option value="Transcript">Meeting Transcript</option>
                <option value="PDF">Standard PDF / Doc</option>
                <option value="TXT">Raw Text Log</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Primary Author</label>
              <input
                type="text"
                placeholder="e.g. John Doe, Elena..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={uploading}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">SOP / Transcript Contents</label>
            <textarea
              rows={6}
              placeholder="Paste rich structured technical files or transcripts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={uploading}
              className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-205 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Trigger button */}
          <button
            type="submit"
            disabled={uploading || !title.trim() || !content.trim()}
            className="w-full py-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                <span>Extracting Entities via Gemini AI...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Ingest and Parse Document</span>
              </>
            )}
          </button>
        </form>

        {/* Dynamic templates injector */}
        <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Inject Enterprise Scenarios</span>
          <div className="grid grid-cols-1 gap-2">
            {TEMPLATE_DOCS.map((temp, index) => (
              <button
                key={index}
                onClick={() => handleApplyTemplate(temp)}
                disabled={uploading}
                className="w-full text-left p-2.5 bg-[#161618] border border-white/5 rounded-lg text-xs hover:border-blue-500/50 hover:bg-[#0c0c0e] hover:text-white transition-colors flex flex-col gap-1"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-slate-300 leading-tight truncate max-w-[200px]">{temp.title}</span>
                  <span className="text-[9px] font-mono text-slate-500 border border-white/10 px-1 rounded uppercase shrink-0">{temp.type}</span>
                </div>
                <span className="text-[10px] text-slate-400">Author: {temp.author}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Uploaded / Ingested lists with live statuses */}
      <div className="lg:col-span-3 flex flex-col bg-[#161618] border border-white/5 rounded-xl relative overflow-hidden min-h-[380px]">
        
        {/* Header stats bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#0c0c0e] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">OIOS Document Ledger Index</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Active: <b className="text-blue-400">{documents.length} Files</b>
          </div>
        </div>

        {/* Docs list scrollbar */}
        <div className="flex-grow overflow-y-auto max-h-[460px] p-5 flex flex-col gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-3.5 bg-[#0c0c0e] border border-white/5 rounded-xl flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-8 h-8 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-200">{doc.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>By: {doc.author}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>

                  {/* Extracts counts */}
                  {doc.status === "Parsed" && (
                    <div className="flex gap-2.5 mt-2">
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 py-0.5 px-1.5 rounded">
                        Nodes: +{doc.entitiesCount || 0}
                      </span>
                      <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 py-0.5 px-1.5 rounded">
                        Edges: +{doc.relationshipsCount || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status pill */}
              <div className="flex flex-col items-end gap-1.5">
                {doc.status === "Parsed" && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Parsed</span>
                  </div>
                )}
                {doc.status === "Parsing" && (
                  <div className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 font-bold animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Parsing...</span>
                  </div>
                )}
                {doc.status === "Error" && (
                  <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Parsing Fail</span>
                  </div>
                )}
                
                <span className="text-[9px] font-mono text-slate-500">ID: {doc.id}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
