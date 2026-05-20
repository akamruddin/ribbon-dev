// RibbonSandbox.jsx — Sandbox Environment mockup
// Ribbon Developer Community · Sprint 0
// Sprint 0 spec: every env = 5 Neptune + 5 Apollo + 1 Muse. No tiers.

import { useState } from "react";

const C = {
  navyDk: "#0F1638", navy: "#1E2761", navyMid: "#2A3676",
  ice: "#CADCFC", iceLt: "#EBF1FE", accent: "#C8102E",
  gold: "#F4A300", green: "#1F8A4C", teal: "#1A7FBF",
  white: "#FFFFFF", textDk: "#1A1A1A", textMd: "#4A4A4A",
  textLt: "#8895AE", rule: "#D0D7E8", bg: "#F2F5FF",
};

// ─── Device definitions ──────────────────────────────────────────────────────

const NEPTUNE_NODES = [
  { id: "NPT-1", ip: "10.0.1.1", port: 2221 },
  { id: "NPT-2", ip: "10.0.1.2", port: 2222 },
  { id: "NPT-3", ip: "10.0.1.3", port: 2223 },
  { id: "NPT-4", ip: "10.0.1.4", port: 2224 },
  { id: "NPT-5", ip: "10.0.1.5", port: 2225 },
];
const APOLLO_NODES = [
  { id: "APL-1", ip: "10.0.2.1", port: 2231 },
  { id: "APL-2", ip: "10.0.2.2", port: 2232 },
  { id: "APL-3", ip: "10.0.2.3", port: 2233 },
  { id: "APL-4", ip: "10.0.2.4", port: 2234 },
  { id: "APL-5", ip: "10.0.2.5", port: 2235 },
];
const MUSE_NODE = { id: "MUSE", ip: "10.0.3.1", port: 8443 };

const BOOT_STAGES = [
  { label: "Allocate compute resources",          est: "~30s" },
  { label: "Build GNS3 network topology",         est: "~45s" },
  { label: "Boot Neptune and Apollo devices",     est: "~2–3m" },
  { label: "Deploy Muse orchestrator (k8s)",      est: "~1m" },
  { label: "Health checks and expose console links", est: "~30s" },
];

// ─── Top nav (shared with forum) ─────────────────────────────────────────────

function TopNav({ onSwitchView }) {
  return (
    <div style={{ background: C.navyDk, borderBottom: `3px solid ${C.accent}`,
      display: "flex", alignItems: "center", padding: "0 24px", height: 54,
      gap: 28, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "Georgia, serif" }}>R</span>
        </div>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>
          ribbon<span style={{ color: C.ice }}>dev</span>
        </span>
      </div>
      <nav style={{ display: "flex", gap: 24, marginLeft: 8 }}>
        {["Docs", "Code Exchange"].map(n => (
          <span key={n} style={{ color: C.textLt, fontSize: 13, cursor: "pointer" }}>{n}</span>
        ))}
        <span onClick={() => onSwitchView("forum")}
          style={{ color: C.textLt, fontSize: 13, cursor: "pointer" }}>Forum</span>
        <span style={{ color: C.ice, fontSize: 13, fontWeight: 700,
          borderBottom: `2px solid ${C.accent}`, paddingBottom: 3 }}>Sandbox</span>
      </nav>
      <div style={{ marginLeft: "auto" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.navyMid,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.ice, fontSize: 12, fontWeight: 700 }}>AK</div>
      </div>
    </div>
  );
}

// ─── Session header bar ───────────────────────────────────────────────────────

function SessionHeader({ state, setState }) {
  const isBooting = state === "booting";
  return (
    <div style={{ background: C.navy, borderBottom: `1px solid ${C.navyMid}`,
      display: "flex", alignItems: "center", padding: "0 24px", height: 50,
      gap: 20, flexShrink: 0 }}>

      {/* Session ID */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "Consolas, 'Courier New', monospace", fontSize: 13,
          color: C.ice, fontWeight: 600, letterSpacing: 0.5 }}>RES-1042</span>
        <span style={{ background: isBooting ? C.gold : C.green,
          color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {isBooting ? "⏳ Booting" : "● Ready"}
        </span>
      </div>

      {/* Timer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
        <span style={{ color: C.textLt, fontSize: 12 }}>⏱</span>
        <span style={{ fontFamily: "Consolas, 'Courier New', monospace",
          fontSize: 14, color: C.ice, fontWeight: 600 }}>
          {isBooting ? "—:—:—" : "3:42:18"}
        </span>
        <span style={{ fontSize: 11, color: C.textLt }}>remaining</span>
      </div>

      {/* State toggle (mockup control) */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Mockup toggle label */}
        <span style={{ fontSize: 10, color: C.textLt, textTransform: "uppercase",
          letterSpacing: 0.5, border: `1px solid ${C.navyMid}`,
          padding: "2px 8px", borderRadius: 3 }}>Mockup toggle</span>
        <button onClick={() => setState(isBooting ? "ready" : "booting")}
          style={{ background: "transparent", border: `1px solid ${C.ice}`,
            borderRadius: 5, color: C.ice, padding: "5px 14px",
            fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
          View as {isBooting ? "Ready ↗" : "Booting ↗"}
        </button>
        {!isBooting && (
          <>
            <button style={{ background: "transparent", border: `1px solid ${C.navyMid}`,
              borderRadius: 5, color: C.ice, padding: "5px 14px",
              fontSize: 12, cursor: "pointer" }}>Extend</button>
            <button style={{ background: C.accent, border: "none", borderRadius: 5,
              color: "#fff", padding: "5px 14px", fontSize: 12, cursor: "pointer",
              fontWeight: 600 }}>End Session</button>
          </>
        )}
        {isBooting && (
          <button style={{ background: "transparent", border: `1px solid ${C.navyMid}`,
            borderRadius: 5, color: C.textLt, padding: "5px 14px",
            fontSize: 12, cursor: "pointer" }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

// ─── Booting view ─────────────────────────────────────────────────────────────

function BootingView() {
  // Stage 3 is "in progress" in the mockup
  const activeStage = 2;

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, padding: 40 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        {/* Title */}
        <div style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: 22, color: C.navyDk, margin: 0, fontWeight: 700 }}>
            Building your Ribbon sandbox
          </h2>
        </div>
        <p style={{ fontSize: 13, color: C.textLt, margin: "0 0 32px",
          fontFamily: "Consolas, 'Courier New', monospace" }}>
          11 devices · 1 Muse instance · clean state guaranteed
        </p>

        {/* Stage list */}
        <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10,
          overflow: "hidden", marginBottom: 20,
          boxShadow: "0 2px 10px rgba(30,39,97,0.07)" }}>

          {/* Mock browser chrome */}
          <div style={{ background: C.iceLt, borderBottom: `1px solid ${C.rule}`,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            {[C.accent, C.gold, C.green].map((col, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: col }} />
            ))}
            <span style={{ fontFamily: "Consolas, 'Courier New', monospace",
              fontSize: 11, color: C.textMd, marginLeft: 8 }}>
              ribbon.dev / sandbox / session / RES-1042
            </span>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navyDk, marginBottom: 4 }}>
              Building your Medium sandbox
            </div>
            <div style={{ fontSize: 12, color: C.textMd, marginBottom: 20 }}>
              Estimated time to ready: <strong>~ 4 minutes</strong> &nbsp;·&nbsp; 5 Neptune · 5 Apollo · 1 Muse
            </div>

            {BOOT_STAGES.map((stage, i) => {
              const isDone    = i < activeStage;
              const isActive  = i === activeStage;
              const isPending = i > activeStage;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center",
                  padding: "11px 14px", marginBottom: 6, borderRadius: 7,
                  background: isActive ? C.iceLt : C.white,
                  border: `1px solid ${isActive ? C.ice : C.rule}` }}>
                  {/* Status dot */}
                  <div style={{ width: 20, height: 20, borderRadius: "50%",
                    background: isDone ? C.green : isActive ? C.gold : C.rule,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginRight: 12, fontSize: 10, color: "#fff" }}>
                    {isDone ? "✓" : isActive ? "●" : ""}
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 400,
                    color: isPending ? C.textLt : C.textDk }}>
                    {stage.label}
                  </div>

                  {/* Status */}
                  <div style={{ fontSize: 11, fontWeight: 700, flexShrink: 0,
                    color: isDone ? C.green : isActive ? C.gold : C.textLt }}>
                    {isDone ? "Complete" : isActive ? "In progress" : "Pending"}
                  </div>
                </div>
              );
            })}

            {/* Progress bar */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                fontSize: 11, color: C.textLt, marginBottom: 6 }}>
                <span>Overall progress · {activeStage} of {BOOT_STAGES.length} stages complete</span>
                <span>{Math.round((activeStage / BOOT_STAGES.length) * 100)}%</span>
              </div>
              <div style={{ height: 8, background: C.iceLt, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: C.navy,
                  width: `${(activeStage / BOOT_STAGES.length) * 100}%`,
                  transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: C.textLt, marginTop: 6, fontStyle: "italic" }}>
                Booting 3 of 5 Neptune devices — estimated 2 minutes remaining
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Topology diagram (SVG) ───────────────────────────────────────────────────

function TopologyDiagram({ selectedNode, onSelectNode }) {
  const W = 580, H = 360;

  // Node positions
  const musePos = { x: 290, y: 48 };
  const nptXs = [72, 167, 262, 357, 452];
  const aplXs = [72, 167, 262, 357, 452];
  const nptY = 175, aplY = 295;
  const nodeW = 72, nodeH = 28;

  const isSelected = id => selectedNode === id;

  function NodeRect({ id, x, y, label, fillColor }) {
    const sel = isSelected(id);
    return (
      <g onClick={() => onSelectNode(sel ? null : id)} style={{ cursor: "pointer" }}>
        <rect x={x - nodeW/2} y={y - nodeH/2} width={nodeW} height={nodeH}
          rx={5} ry={5}
          fill={sel ? C.gold : fillColor}
          stroke={sel ? C.gold : fillColor === C.white ? C.rule : fillColor}
          strokeWidth={sel ? 2.5 : 1.5} />
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fontWeight={700} fill="#fff"
          fontFamily="-apple-system, sans-serif">
          {label}
        </text>
        {/* Status dot */}
        <circle cx={x + nodeW/2 - 6} cy={y - nodeH/2 + 6} r={4}
          fill={C.green} stroke="#fff" strokeWidth={1} />
      </g>
    );
  }

  return (
    <div style={{ background: C.bg, borderRadius: 10, padding: 10, position: "relative" }}>
      {/* Layer labels */}
      <div style={{ position: "absolute", left: 10, top: 36, fontSize: 9, color: C.textLt,
        textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Orchestration</div>
      <div style={{ position: "absolute", left: 10, top: 163, fontSize: 9, color: C.textLt,
        textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>IP Routing</div>
      <div style={{ position: "absolute", left: 10, top: 283, fontSize: 9, color: C.textLt,
        textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Optical</div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={C.navyMid} />
          </marker>
        </defs>

        {/* ── Muse → each NPT (dashed gold orchestration lines) ── */}
        {nptXs.map((nx, i) => (
          <line key={`muse-npt-${i}`}
            x1={musePos.x} y1={musePos.y + 14}
            x2={nx} y2={nptY - 14}
            stroke={C.gold} strokeWidth={1.2} strokeDasharray="5,4" opacity={0.7} />
        ))}

        {/* ── Neptune ring (horizontal chain) ── */}
        {nptXs.slice(0,-1).map((nx, i) => (
          <line key={`npt-chain-${i}`}
            x1={nx + nodeW/2} y1={nptY}
            x2={nptXs[i+1] - nodeW/2} y2={nptY}
            stroke={C.navy} strokeWidth={2} />
        ))}

        {/* ── Neptune → Apollo (vertical IP-over-optical links) ── */}
        {nptXs.map((nx, i) => (
          <line key={`npt-apl-${i}`}
            x1={nx} y1={nptY + nodeH/2}
            x2={aplXs[i]} y2={aplY - nodeH/2}
            stroke={C.teal} strokeWidth={1.5} opacity={0.7} />
        ))}

        {/* ── Apollo ring (horizontal chain) ── */}
        {aplXs.slice(0,-1).map((ax, i) => (
          <line key={`apl-chain-${i}`}
            x1={ax + nodeW/2} y1={aplY}
            x2={aplXs[i+1] - nodeW/2} y2={aplY}
            stroke={C.teal} strokeWidth={2} />
        ))}

        {/* ── MUSE node ── */}
        <g onClick={() => onSelectNode(isSelected("MUSE") ? null : "MUSE")} style={{ cursor: "pointer" }}>
          <rect x={musePos.x - 52} y={musePos.y - 18} width={104} height={36}
            rx={7} ry={7}
            fill={isSelected("MUSE") ? C.navy : C.gold}
            stroke={isSelected("MUSE") ? C.gold : C.gold}
            strokeWidth={2} />
          <text x={musePos.x} y={musePos.y + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={11} fontWeight={800} fill="#fff"
            fontFamily="-apple-system, sans-serif" letterSpacing={1}>
            MUSE
          </text>
          <circle cx={musePos.x + 44} cy={musePos.y - 10} r={5}
            fill={C.green} stroke="#fff" strokeWidth={1.5} />
        </g>

        {/* ── Neptune nodes ── */}
        {NEPTUNE_NODES.map((n, i) => (
          <NodeRect key={n.id} id={n.id} x={nptXs[i]} y={nptY}
            label={n.id} fillColor={C.navy} />
        ))}

        {/* ── Apollo nodes ── */}
        {APOLLO_NODES.map((n, i) => (
          <NodeRect key={n.id} id={n.id} x={aplXs[i]} y={aplY}
            label={n.id} fillColor={C.teal} />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 18, padding: "6px 10px 0",
        fontSize: 11, color: C.textMd }}>
        {[
          { color: C.navy, label: "Neptune (rNOS)" },
          { color: C.teal, label: "Apollo (Optical)" },
          { color: C.gold, label: "Muse (Orchestrator)" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            {l.label}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
          All running
        </div>
      </div>
    </div>
  );
}

// ─── Console modal ────────────────────────────────────────────────────────────

function ConsoleModal({ device, onClose }) {
  const isMuse = device.id === "MUSE";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: C.navyDk, borderRadius: 10, padding: 28, width: 440,
          border: `1px solid ${C.navyMid}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.ice }}>{device.id} — Console Access</span>
          <button onClick={onClose} style={{ background: "none", border: "none",
            color: C.textLt, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {isMuse ? (
          <>
            <div style={{ fontSize: 12, color: C.textLt, marginBottom: 12 }}>Muse UI URL</div>
            <div style={{ background: "#0A0E1F", borderRadius: 6, padding: "12px 16px",
              fontFamily: "Consolas, 'Courier New', monospace", fontSize: 13, color: C.gold,
              marginBottom: 16, wordBreak: "break-all" }}>
              https://muse.sandbox-res1042.ribbon.dev:{device.port}
            </div>
            <div style={{ fontSize: 12, color: C.textLt, marginBottom: 8 }}>Credentials</div>
            <div style={{ background: "#0A0E1F", borderRadius: 6, padding: "10px 16px",
              fontFamily: "Consolas, 'Courier New', monospace", fontSize: 12, color: C.ice }}>
              user: developer<br />pass: <span style={{ color: C.gold }}>sess-token-shown-at-ready</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.textLt, marginBottom: 12 }}>SSH command</div>
            <div style={{ background: "#0A0E1F", borderRadius: 6, padding: "12px 16px",
              fontFamily: "Consolas, 'Courier New', monospace", fontSize: 13, color: C.green,
              marginBottom: 16 }}>
              <span style={{ color: C.textLt }}>$ </span>
              ssh developer@{device.ip} -p {device.port}
            </div>
            <div style={{ fontSize: 12, color: C.textLt, marginBottom: 8 }}>NETCONF / RESTCONF</div>
            <div style={{ background: "#0A0E1F", borderRadius: 6, padding: "10px 16px",
              fontFamily: "Consolas, 'Courier New', monospace", fontSize: 12, color: C.ice, lineHeight: 1.7 }}>
              host: {device.ip}<br />
              netconf: 830<br />
              restconf: 443<br />
              grpc: 57400
            </div>
          </>
        )}

        <button onClick={onClose} style={{ width: "100%", marginTop: 20, background: C.navy,
          border: "none", borderRadius: 6, color: "#fff", padding: "10px",
          fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Device table ─────────────────────────────────────────────────────────────

function DeviceTable({ selectedNode, onSelectNode }) {
  const [consoleDevice, setConsoleDevice] = useState(null);

  const allDevices = [
    ...NEPTUNE_NODES.map(n => ({ ...n, type: "Neptune (rNOS)", typeShort: "NPT" })),
    ...APOLLO_NODES.map(n => ({ ...n, type: "Apollo (Optical)", typeShort: "APL" })),
    { ...MUSE_NODE, type: "Muse Orchestrator", typeShort: "MSE" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navyDk }}>Devices</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, color: C.green, fontWeight: 600 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
          All 11 Running
        </div>
      </div>

      <div style={{ overflow: "auto", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 80px 64px",
          padding: "6px 10px", fontSize: 10, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 0.6, color: C.textLt,
          borderBottom: `1px solid ${C.rule}`, marginBottom: 2 }}>
          <span>Name</span><span>Type</span><span>Status</span><span>Access</span>
        </div>

        {allDevices.map(dev => {
          const isMuse = dev.id === "MUSE";
          const isHighlighted = selectedNode === dev.id;
          return (
            <div key={dev.id}
              onClick={() => onSelectNode(isHighlighted ? null : dev.id)}
              style={{ display: "grid", gridTemplateColumns: "72px 1fr 80px 64px",
                alignItems: "center", padding: "8px 10px", borderRadius: 6, marginBottom: 2,
                background: isHighlighted ? C.iceLt : "transparent",
                border: isHighlighted ? `1px solid ${C.ice}` : "1px solid transparent",
                cursor: "pointer" }}>

              {/* Name */}
              <span style={{ fontFamily: "Consolas, 'Courier New', monospace",
                fontSize: 12, fontWeight: 700,
                color: isMuse ? C.gold : dev.id.startsWith("NPT") ? C.navy : C.teal }}>
                {dev.id}
              </span>

              {/* Type */}
              <span style={{ fontSize: 12, color: C.textMd }}>{dev.type}</span>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
                <span style={{ color: C.green, fontWeight: 600 }}>Running</span>
              </div>

              {/* Console button */}
              <button onClick={e => { e.stopPropagation(); setConsoleDevice(dev); }}
                style={{ background: isMuse ? C.gold : C.navy, border: "none", borderRadius: 4,
                  color: "#fff", padding: "4px 10px", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap" }}>
                {isMuse ? "UI" : "SSH"}
              </button>
            </div>
          );
        })}
      </div>

      {consoleDevice && (
        <ConsoleModal device={consoleDevice} onClose={() => setConsoleDevice(null)} />
      )}
    </div>
  );
}

// ─── Idle warning bar ─────────────────────────────────────────────────────────

function IdleWarning({ onDismiss }) {
  return (
    <div style={{ background: "#7A5200", borderBottom: `2px solid ${C.gold}`,
      display: "flex", alignItems: "center", padding: "10px 24px", gap: 14 }}>
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span style={{ flex: 1, fontSize: 13, color: "#FFE9A0", fontWeight: 500 }}>
        Your session will expire in <strong style={{ color: C.gold }}>5 minutes</strong> due to inactivity.
        Extend or save your work.
      </span>
      <button onClick={onDismiss}
        style={{ background: C.navy, border: "none", borderRadius: 5, color: "#fff",
          padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        Extend Session
      </button>
      <button style={{ background: "transparent", border: `1px solid ${C.gold}`,
        borderRadius: 5, color: C.gold, padding: "6px 16px", fontSize: 12, cursor: "pointer" }}>
        End Now
      </button>
    </div>
  );
}

// ─── Ready view ───────────────────────────────────────────────────────────────

function ReadyView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showIdle, setShowIdle] = useState(false);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showIdle && <IdleWarning onDismiss={() => setShowIdle(false)} />}

      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>
        {/* Left: topology */}
        <div style={{ flex: 3, padding: "20px 20px 20px 24px", overflowY: "auto",
          borderRight: `1px solid ${C.rule}`, background: C.bg }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navyDk }}>
              Network Topology
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "transparent", border: `1px solid ${C.rule}`,
                borderRadius: 5, padding: "4px 12px", fontSize: 11,
                color: C.textMd, cursor: "pointer" }}>Zoom fit</button>
              <button onClick={() => setShowIdle(true)}
                style={{ background: "transparent", border: `1px solid ${C.gold}`,
                  borderRadius: 5, padding: "4px 12px", fontSize: 11,
                  color: C.gold, cursor: "pointer" }}>
                ⚠ Simulate idle
              </button>
            </div>
          </div>

          <TopologyDiagram selectedNode={selectedNode} onSelectNode={setSelectedNode} />

          {/* Selected node info panel */}
          {selectedNode && (() => {
            const all = [...NEPTUNE_NODES, ...APOLLO_NODES, MUSE_NODE];
            const dev = all.find(d => d.id === selectedNode);
            if (!dev) return null;
            return (
              <div style={{ marginTop: 14, background: C.white, border: `1px solid ${C.ice}`,
                borderLeft: `4px solid ${C.gold}`, borderRadius: 8, padding: "14px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyDk, marginBottom: 8 }}>
                  {dev.id} — Details
                </div>
                <div style={{ fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: 12, color: C.textMd, lineHeight: 1.8 }}>
                  <div><span style={{ color: C.textLt }}>IP:</span>   {dev.ip}</div>
                  <div><span style={{ color: C.textLt }}>Port:</span> {dev.port}</div>
                  <div><span style={{ color: C.textLt }}>Status:</span>{" "}
                    <span style={{ color: C.green, fontWeight: 600 }}>Running</span></div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right: device panel */}
        <div style={{ flex: 2, padding: "20px 20px 20px 20px", overflowY: "auto",
          background: C.white, minWidth: 0 }}>
          <DeviceTable selectedNode={selectedNode} onSelectNode={setSelectedNode} />
        </div>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function RibbonSandbox({ onSwitchView = () => {} }) {
  const [sandboxState, setSandboxState] = useState("booting");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, color: C.textDk }}>
      <TopNav onSwitchView={onSwitchView} />
      <SessionHeader state={sandboxState} setState={setSandboxState} />
      {sandboxState === "booting" ? <BootingView /> : <ReadyView />}
    </div>
  );
}
