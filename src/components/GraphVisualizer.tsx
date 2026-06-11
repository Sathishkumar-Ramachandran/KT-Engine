import React, { useState, useMemo } from "react";
import { GraphNode, GraphEdge, NodeType } from "../types";
import { Network, Search, Database, Layers, Shield, User, Sparkles, Filter, ChevronRight } from "lucide-react";

interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
  selectedNodeId?: string;
}

export default function GraphVisualizer({ nodes, edges, onSelectNode, selectedNodeId }: GraphVisualizerProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchType = filterType === "ALL" || node.type === filterType;
      const matchSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [nodes, filterType, searchQuery]);

  // Visual layout calculation: Distribute nodes in coordinates based on their Type to look highly organized (like Neo4j layer layout)
  const nodePositions = useMemo(() => {
    const layoutMap: Record<string, { x: number; y: number }> = {};
    const width = 800;
    const height = 480;

    // Define lanes or rings for different semantic types to prevent random overlapping slop
    const typeSlices: Record<string, { startX: number; rangeX: number; startY: number; rangeY: number }> = {
      [NodeType.Employee]: { startX: 100, rangeX: 180, startY: 80, rangeY: 300 },
      [NodeType.Skill]: { startX: 280, rangeX: 150, startY: 50, rangeY: 380 },
      [NodeType.System]: { startX: 430, rangeX: 160, startY: 80, rangeY: 300 },
      [NodeType.Project]: { startX: 620, rangeX: 120, startY: 60, rangeY: 180 },
      [NodeType.Decision]: { startX: 610, rangeX: 130, startY: 260, rangeY: 160 },
      [NodeType.Document]: { startX: 150, rangeX: 450, startY: 410, rangeY: 50 }
    };

    // Keep track of counts per type to stagger coordinate distributions
    const typeCounters: Record<string, number> = {};

    nodes.forEach((node) => {
      const type = node.type;
      if (!typeCounters[type]) typeCounters[type] = 0;
      
      const config = typeSlices[type] || { startX: 150, rangeX: 500, startY: 150, rangeY: 200 };
      const currentIdx = typeCounters[type];
      
      // Calculate a pseudo-deterministic grid-stagger or circle coordinates
      const maxInLane = Math.max(5, Math.ceil(nodes.filter(n => n.type === type).length));
      
      // Calculate staggered placement to make the graph incredibly clean and highly balanced
      const stepX = config.rangeX / (maxInLane + 1 || 1);
      const x = config.startX + ((currentIdx % maxInLane) + 0.8) * stepX;
      
      const stepY = config.rangeY / (maxInLane || 1);
      // Give some sine wave jitter to prevent hard straight lanes
      const y = config.startY + (currentIdx * 65) % (config.rangeY + 5) + Math.sin(currentIdx) * 12;

      layoutMap[node.id] = { x: Math.min(width - 40, Math.max(40, x)), y: Math.min(height - 40, Math.max(30, y)) };
      typeCounters[type] = currentIdx + 1;
    });

    return layoutMap;
  }, [nodes]);

  // Find node details if selected
  const activeNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  // Helper colors for different nodes
  const getNodeColor = (type: NodeType, isSelected: boolean) => {
    if (isSelected) return { bg: "bg-blue-600", border: "border-blue-400 ring-4 ring-blue-500/20", text: "text-blue-450" };
    
    switch (type) {
      case NodeType.Employee:
        return { bg: "bg-sky-500", border: "border-sky-400", text: "text-sky-300", stroke: "#0ea5e9" };
      case NodeType.Skill:
        return { bg: "bg-amber-500", border: "border-amber-400", text: "text-amber-300", stroke: "#f59e0b" };
      case NodeType.System:
        return { bg: "bg-violet-600", border: "border-violet-500", text: "text-violet-300", stroke: "#7c3aed" };
      case NodeType.Project:
        return { bg: "bg-rose-500", border: "border-rose-400", text: "text-rose-300", stroke: "#f43f5e" };
      case NodeType.Decision:
        return { bg: "bg-red-500", border: "border-red-400", text: "text-red-300", stroke: "#ef4444" };
      default:
        return { bg: "bg-slate-400", border: "border-slate-300", text: "text-slate-200", stroke: "#94a3b8" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar Controls & Node Details */}
      <div className="lg:col-span-1 flex flex-col gap-5 bg-[#0c0c0e] border border-white/10 p-5 rounded-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Network className="w-5 h-5 text-blue-400 animate-pulse-slow" />
          <h3 className="font-semibold text-slate-100 text-sm">Neo4j Graph Controller</h3>
        </div>

        {/* Quick Search across graph nodes */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes or system..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filtering Options */}
        <div>
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">Node Filter</label>
          <div className="grid grid-cols-2 gap-1.5">
            {["ALL", NodeType.Employee, NodeType.Skill, NodeType.System, NodeType.Project, NodeType.Decision].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-1.5 px-2 rounded text-xs text-left transition-colors truncate cursor-pointer ${
                  filterType === type 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/25 font-bold" 
                    : "bg-[#09090b] text-slate-400 border border-transparent hover:bg-white/5"
                }`}
              >
                {type === "ALL" ? "Show All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Active Node Detail Card */}
        <div className="mt-2 pt-4 border-t border-white/10 flex-grow">
          {activeNode ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getNodeColor(activeNode.type, false).bg}`} />
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">{activeNode.type}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-100">{activeNode.name}</h4>
              
              <div className="bg-[#09090b] rounded-lg p-3 border border-white/10 flex flex-col gap-2 text-xs">
                <div className="text-slate-400 font-mono text-[10px]">Node ID: <code className="text-blue-400 font-bold">{activeNode.id}</code></div>
                {Object.entries(activeNode.properties || {}).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-slate-500 uppercase font-mono text-[9px] tracking-wider font-semibold">{key}</span>
                    <span className="text-slate-300 font-medium font-sans">{String(val)}</span>
                  </div>
                ))}
              </div>

              {/* Related nodes finder */}
              <div className="text-xs">
                <div className="text-slate-500 mb-1.5 uppercase font-mono text-[9px] tracking-widest font-bold">Connected Edges</div>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {edges
                    .filter(e => e.source === activeNode.id || e.target === activeNode.id)
                    .map(edge => {
                      const otherNodeId = edge.source === activeNode.id ? edge.target : edge.source;
                      const otherNode = nodes.find(n => n.id === otherNodeId);
                      const isOutgoing = edge.source === activeNode.id;
                      return (
                        <div key={edge.id} className="flex items-center justify-between p-1 px-2 bg-[#09090b] rounded hover:bg-white/5 text-slate-350 border border-white/5 text-[11px]">
                          <span className="text-blue-400/90 font-mono text-[10px] font-semibold">{edge.type}</span>
                          <span className="truncate max-w-[120px] font-sans text-slate-400 text-xs">
                            {isOutgoing ? "→" : "←"} {otherNode ? otherNode.name : otherNodeId}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-[#09090b]/55 rounded-lg border border-white/10 border-dashed">
              <Database className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs text-slate-500 leading-relaxed font-sans">Click a node on the workspace graph canvas to inspect active Neo4j database correlations.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive SVG Graph Space */}
      <div className="lg:col-span-3 flex flex-col bg-[#161618] border border-white/5 rounded-xl relative overflow-hidden min-h-[480px]">
        
        {/* Title and stats bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#0c0c0e] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Durable Neo4j Index Schema Canvas</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span>Nodes: <b>{nodes.length}</b></span>
            <span>Relationships: <b>{edges.length}</b></span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-[#0c0c0e]/95 border border-white/10 p-2.5 rounded-lg text-[10px] flex gap-3 z-10 font-sans text-slate-300 shadow-md">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Employee</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-600 inline-block" /> System</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Skill</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Project</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Decision</div>
        </div>

        {/* SVG Drawing Zone */}
        <div className="w-full h-full flex-grow relative overflow-auto">
          <svg className="w-full min-h-[420px] select-none" viewBox="0 0 800 480">
            {/* Draw Relationship Lines */}
            <g id="relation-edges">
              {edges.map((edge) => {
                const sourcePos = nodePositions[edge.source];
                const targetPos = nodePositions[edge.target];
                
                if (!sourcePos || !targetPos) return null;

                // Check if either node is filtered out
                const hasSource = filteredNodes.some(n => n.id === edge.source);
                const hasTarget = filteredNodes.some(n => n.id === edge.target);
                
                const isSelectedFocus = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
                const opacity = isSelectedFocus ? "0.9" : (hasSource && hasTarget ? "0.35" : "0.08");
                const color = isSelectedFocus ? "#3b82f6" : "#475569";
                const strokeWidth = isSelectedFocus ? 2.5 : 1.2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={color}
                      strokeWidth={strokeWidth}
                      style={{ opacity, transition: "all 0.3s" }}
                    />
                    {/* Add Arrow markers or label in midpoint if selected */}
                    {isSelectedFocus && (
                      <text
                        x={(sourcePos.x + targetPos.x) / 2}
                        y={(sourcePos.y + targetPos.y) / 2 - 4}
                        fill="#3b82f6"
                        fontSize="8px"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bg-[#09090b] px-1 font-mono"
                      >
                        {edge.type}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Draw Interactive Node circles */}
            <g id="graph-nodes">
              {nodes.map((node) => {
                const isFiltered = !filteredNodes.some(n => n.id === node.id);
                const pos = nodePositions[node.id];
                
                if (!pos) return null;

                const isSelected = selectedNodeId === node.id;
                const nodeColors = getNodeColor(node.type, isSelected);

                // Highlight connections if another node is selected
                let opacity = 1;
                if (isFiltered) {
                  opacity = 0.15;
                } else if (selectedNodeId) {
                  const isConnected = edges.some(e => 
                    (e.source === selectedNodeId && e.target === node.id) ||
                    (e.target === selectedNodeId && e.source === node.id) ||
                    node.id === selectedNodeId
                  );
                  opacity = isConnected ? 1 : 0.35;
                }

                // Size of circles based on NodeType importance
                const radius = node.type === NodeType.Employee ? 14 : (node.type === NodeType.System ? 13 : 11);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    style={{ opacity, cursor: "pointer", transition: "all 0.3s" }}
                    onClick={() => onSelectNode && onSelectNode(node)}
                    className="group"
                  >
                    {/* Node Aura if hovered/selected */}
                    <circle
                      r={radius + 4}
                      fill="transparent"
                      stroke={isSelected ? "#3b82f6" : "#020617"}
                      strokeWidth={1.5}
                      className="group-hover:stroke-blue-500/50 group-hover:scale-110 transition-transform"
                    />

                    {/* Core circle */}
                    <circle
                      r={radius}
                      className={`${nodeColors.bg} transition-colors`}
                      stroke={isSelected ? "#ffffff" : nodeColors.stroke}
                      strokeWidth={1.5}
                    />

                    {/* Simple Icon placeholder characters */}
                    <text
                      y={4}
                      fill="#ffffff"
                      fontSize="9px"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.type === NodeType.Employee ? "👤" : (node.type === NodeType.System ? "🖥️" : (node.type === NodeType.Skill ? "💡" : "⚙️"))}
                    </text>

                    {/* Node text label */}
                    <text
                      y={radius + 14}
                      fill={isSelected ? "#3b82f6" : (opacity < 1 ? "#64748b" : "#cbd5e1")}
                      fontSize="9px"
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                      className="font-sans drop-shadow-md text-ellipsis"
                    >
                      {node.name.length > 16 ? `${node.name.substring(0, 14)}..` : node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
