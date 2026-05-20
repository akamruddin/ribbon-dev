// RibbonForum.jsx — Community Forum mockup
// Ribbon Developer Community · Sprint 0
// All data is hardcoded. No backend required.

import { useState } from "react";

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  navyDk: "#0F1638", navy: "#1E2761", navyMid: "#2A3676",
  ice: "#CADCFC", iceLt: "#EBF1FE", accent: "#C8102E",
  gold: "#F4A300", green: "#1F8A4C", white: "#FFFFFF",
  textDk: "#1A1A1A", textMd: "#4A4A4A", textLt: "#8895AE",
  rule: "#D0D7E8", bg: "#F2F5FF",
};

// ─── Mock data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",             label: "All Discussions",        icon: "◈", count: 281 },
  { id: "announcements",   label: "Announcements",           icon: "📣", count: 8   },
  { id: "getting-started", label: "Getting Started",         icon: "🚀", count: 23  },
  { id: "neptune",         label: "Neptune / rNOS APIs",     icon: "🔷", count: 47  },
  { id: "apollo",          label: "Apollo Optical APIs",     icon: "⚡", count: 31  },
  { id: "muse",            label: "Muse Orchestration",      icon: "⚙️", count: 58  },
  { id: "acumen",          label: "Acumen AIOps",            icon: "🤖", count: 12  },
  { id: "code",            label: "Code Snippets",           icon: "💻", count: 89  },
  { id: "bugs",            label: "Bug Reports",             icon: "🐛", count: 7   },
  { id: "showcase",        label: "Showcase",                icon: "✨", count: 14  },
];

const THREADS = [
  {
    id: 1, pinned: true, category: "announcements",
    title: "Welcome to Ribbon Developer Community — Start Here",
    author: "ribbon_devrel", role: "staff", replies: 42, views: 1204, lastActivity: "2h ago",
    tags: ["welcome", "announcement"],
    body: "Welcome to the Ribbon Developer Community. This is your hub for API documentation, sandbox reservations, code sharing, and peer-to-peer technical help.\n\nUse the categories on the left to find relevant discussions, reserve a sandbox environment, or browse the Code Exchange.\n\nThe community sandbox gives you access to 5 Neptune devices (rNOS), 5 Apollo optical devices, and a Muse orchestration instance — all isolated per session, provisioned on demand, and wiped clean on teardown.",
    replies_data: [
      { author: "netops_first", role: "member", time: "1h ago", body: "Great to be here! Already got my first NETCONF session working against Neptune in the sandbox. Much easier than I expected." },
      { author: "si_partner_mx", role: "partner", time: "45m ago", body: "Thanks for setting this up. Looking forward to the Muse workflow authoring docs once they land." },
    ]
  },
  {
    id: 2, pinned: false, category: "neptune",
    title: "NETCONF RPC examples for Neptune — L2VPN, L3VPN, and EVPN service activation",
    author: "netops_eng_42", role: "member", replies: 18, views: 340, lastActivity: "45m ago",
    tags: ["netconf", "l2vpn", "evpn", "examples"],
    body: "Working on automating service activation on our Neptune NPT-2714 cluster. Sharing a reference set of NETCONF RPCs validated in the sandbox. Will update as I add more service types.\n\nL2VPN point-to-point create:\n\n```xml\n<rpc message-id=\"101\" xmlns=\"urn:ietf:params:xml:ns:netconf:base:1.0\">\n  <edit-config>\n    <target><running/></target>\n    <config><!-- service config here --></config>\n  </edit-config>\n</rpc>\n```\n\nFeel free to post corrections or EVPN examples.",
    replies_data: [
      { author: "ribbon_se_team", role: "staff", time: "30m ago", body: "Great thread. Once this covers EVPN VPWS as well we'll move it to the docs. Keep it coming." },
      { author: "automate_everything", role: "member", time: "20m ago", body: "I tested the L3VPN variant on NPT-1 and NPT-3 in the sandbox — works cleanly. Adding the RPC to my muse-py library." },
    ]
  },
  {
    id: 3, pinned: false, category: "muse",
    title: "Muse REST API — how do I do conditional branching in a multi-step workflow?",
    author: "si_developer", role: "partner", replies: 9, views: 178, lastActivity: "3h ago",
    tags: ["muse", "workflows", "rest-api"],
    body: "Trying to build a Muse workflow that branches based on a service health-check result — continue activation if healthy, rollback if not. I can't find docs on how to express the conditional step type in the workflow definition JSON.\n\nIs this supported in the current Muse REST API? Or do I need to do it in the orchestrating script and call separate Muse workflows for each branch?",
    replies_data: []
  },
  {
    id: 4, pinned: false, category: "apollo",
    title: "Apollo RESTCONF — getting 403 on /ietf-network:networks/optical-topology",
    author: "photon_jockey", role: "member", replies: 4, views: 89, lastActivity: "6h ago",
    tags: ["apollo", "restconf", "auth"],
    body: "Running into a 403 trying to hit the optical-topology endpoint on sandbox device APL-2.\n\nGET /restconf/data/ietf-network:networks/optical-topology\n\nBearer token is valid — same token works fine on NPT-1 for the IP topology endpoints. Checked Accept header (application/yang-data+json). What am I missing?",
    replies_data: [
      { author: "ribbon_devrel", role: "staff", time: "5h ago", body: "The Apollo optical-topology endpoint requires the optical-read scope on top of the base scope. We'll update the sandbox onboarding docs to call this out explicitly — it's bitten a few people." },
    ]
  },
  {
    id: 5, pinned: false, category: "getting-started",
    title: "Sandbox tip: use snapshot restore for faster time-to-ready on repeat sessions",
    author: "ribbon_devrel", role: "staff", replies: 7, views: 203, lastActivity: "1d ago",
    tags: ["sandbox", "tip", "performance"],
    body: "When you're iterating on a lab exercise and don't need a full cold boot, select the snapshot restore option at reservation time. It cuts time-to-ready roughly in half by restoring a pre-booted state rather than booting from scratch.\n\nFull cold boot is still the default — and the right choice when you need a completely pristine environment. Snapshot restore is best for iterative lab work.",
    replies_data: []
  },
  {
    id: 6, pinned: false, category: "showcase",
    title: "[Showcase] muse-py — Python client for Muse REST API, L3VPN lifecycle (open source)",
    author: "automate_everything", role: "member", replies: 22, views: 512, lastActivity: "2d ago",
    tags: ["showcase", "muse", "python", "l3vpn", "open-source"],
    body: "Released muse-py, a typed Python client for the Muse REST API focused on L3VPN lifecycle management. Covers create, modify, delete, and rollback with full type hints and test coverage against the community sandbox.\n\npip install muse-py\n\nRepo: github.com/automate-everything/muse-py\n\nPRs welcome — planning to add L2VPN and Muse workflow authoring next.",
    replies_data: [
      { author: "si_developer", role: "partner", time: "1d ago", body: "This is exactly what I needed. Opening a PR for L2VPN support today." },
      { author: "netops_eng_42", role: "member", time: "20h ago", body: "Tested against NPT-3 and NPT-5 in the sandbox. Works great. Thanks for releasing this." },
    ]
  },
];

// ─── Small components ────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const map = {
    staff:   { bg: C.accent,   label: "Ribbon Staff" },
    partner: { bg: C.gold,     label: "Partner"       },
    member:  { bg: "#5B7FBF",  label: "Member"        },
  };
  const s = map[role] || map.member;
  return (
    <span style={{ background: s.bg, color: "#fff", fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 3, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span style={{ background: C.iceLt, color: C.navyMid, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 12, border: `1px solid ${C.rule}` }}>
      {label}
    </span>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ textAlign: "center", minWidth: 48 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textLt, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Top nav ─────────────────────────────────────────────────────────────────

function TopNav({ activeView, onSwitchView }) {
  return (
    <div style={{ background: C.navyDk, borderBottom: `3px solid ${C.accent}`,
      display: "flex", alignItems: "center", padding: "0 24px", height: 54, gap: 28, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "Georgia, serif" }}>R</span>
        </div>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>
          ribbon<span style={{ color: C.ice }}>dev</span>
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 24, marginLeft: 8 }}>
        {["Docs", "Forum", "Code Exchange"].map(n => (
          <span key={n} style={{ color: n === "Forum" ? C.ice : C.textLt, fontSize: 13,
            fontWeight: n === "Forum" ? 700 : 400, cursor: "pointer",
            borderBottom: n === "Forum" ? `2px solid ${C.accent}` : "none", paddingBottom: 3 }}>
            {n}
          </span>
        ))}
        <span onClick={() => onSwitchView("sandbox")}
          style={{ color: C.textLt, fontSize: 13, cursor: "pointer", paddingBottom: 3 }}>
          Sandbox
        </span>
      </nav>

      {/* Account */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.navyMid,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.ice, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${C.navyMid}` }}>
          AK
        </div>
      </div>
    </div>
  );
}

// ─── Forum sidebar ────────────────────────────────────────────────────────────

function ForumSidebar({ active, setActive }) {
  return (
    <aside style={{ width: 220, background: C.navy, flexShrink: 0,
      display: "flex", flexDirection: "column", padding: "16px 0", overflowY: "auto" }}>
      <div style={{ padding: "0 16px 10px", color: C.textLt, fontSize: 10,
        fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
        Categories
      </div>
      {CATEGORIES.map(c => (
        <button key={c.id} onClick={() => setActive(c.id)} style={{
          width: "100%", textAlign: "left", background: active === c.id ? C.navyMid : "transparent",
          border: "none", borderLeft: active === c.id ? `3px solid ${C.accent}` : "3px solid transparent",
          color: active === c.id ? "#fff" : C.ice, padding: "9px 16px",
          fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 4 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.icon} {c.label}
          </span>
          <span style={{ fontSize: 11, color: C.textLt, flexShrink: 0 }}>{c.count}</span>
        </button>
      ))}

      <div style={{ height: 1, background: C.navyMid, margin: "16px 16px 8px" }} />
      <div style={{ padding: "0 16px 10px", color: C.textLt, fontSize: 10,
        fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
        My Activity
      </div>
      {["My Posts", "Bookmarks", "Following"].map(item => (
        <button key={item} style={{ width: "100%", textAlign: "left", background: "transparent",
          border: "none", borderLeft: "3px solid transparent", color: C.ice,
          padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
          {item}
        </button>
      ))}
    </aside>
  );
}

// ─── Thread card ──────────────────────────────────────────────────────────────

function ThreadCard({ thread, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onSelect(thread)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: C.white, borderRadius: 8,
        border: thread.pinned ? `1px solid ${C.gold}` : `1px solid ${C.rule}`,
        borderLeft: thread.pinned ? `4px solid ${C.gold}` : `4px solid transparent`,
        padding: "15px 20px", cursor: "pointer", marginBottom: 10,
        boxShadow: hovered ? "0 3px 12px rgba(30,39,97,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.15s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7, flexWrap: "wrap" }}>
            {thread.pinned && (
              <span style={{ fontSize: 10, color: C.gold, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.5 }}>📌 Pinned</span>
            )}
            <RoleBadge role={thread.role} />
            {thread.tags.slice(0, 3).map(t => <Tag key={t} label={t} />)}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navyDk, marginBottom: 6, lineHeight: 1.4 }}>
            {thread.title}
          </div>
          <div style={{ fontSize: 12, color: C.textMd }}>
            <strong>{thread.author}</strong> · {thread.lastActivity}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
          <StatBox label="Replies" value={thread.replies} />
          <StatBox label="Views" value={thread.views} />
        </div>
      </div>
    </div>
  );
}

// ─── Thread detail ────────────────────────────────────────────────────────────

function ThreadDetail({ thread, onBack }) {
  const [reply, setReply] = useState("");
  return (
    <div style={{ padding: 28, maxWidth: 860 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.navy,
        fontSize: 13, cursor: "pointer", marginBottom: 18, fontWeight: 600,
        padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Forum
      </button>

      <h1 style={{ fontSize: 22, color: C.navyDk, marginBottom: 10, lineHeight: 1.35, marginTop: 0 }}>
        {thread.title}
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
        <RoleBadge role={thread.role} />
        {thread.tags.map(t => <Tag key={t} label={t} />)}
        <span style={{ fontSize: 12, color: C.textLt }}>
          by <strong style={{ color: C.textMd }}>{thread.author}</strong> · {thread.lastActivity}
        </span>
      </div>

      {/* Original post */}
      <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8,
        padding: "20px 24px", marginBottom: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <pre style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14, color: C.textDk, lineHeight: 1.7, whiteSpace: "pre-wrap",
          margin: 0, wordBreak: "break-word" }}>
          {thread.body}
        </pre>
      </div>

      {/* Replies */}
      {thread.replies_data.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textLt, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: 0.5, marginBottom: 10, marginLeft: 24 }}>
            {thread.replies_data.length} {thread.replies_data.length === 1 ? "Reply" : "Replies"}
          </div>
          {thread.replies_data.map((r, i) => (
            <div key={i} style={{ background: C.iceLt, border: `1px solid ${C.rule}`,
              borderRadius: 8, padding: "14px 18px", marginBottom: 10, marginLeft: 24,
              borderLeft: `3px solid ${C.rule}` }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <RoleBadge role={r.role} />
                <span style={{ fontSize: 12, color: C.textMd }}>
                  <strong>{r.author}</strong> · {r.time}
                </span>
              </div>
              <div style={{ fontSize: 13, color: C.textDk, lineHeight: 1.65 }}>{r.body}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reply box */}
      <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8,
        padding: "18px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navyDk, marginBottom: 10 }}>
          Post a reply
        </div>
        <textarea value={reply} onChange={e => setReply(e.target.value)}
          placeholder="Share your answer, context, or follow-up question..."
          style={{ width: "100%", minHeight: 110, border: `1px solid ${C.rule}`, borderRadius: 6,
            padding: "11px 14px", fontSize: 13, fontFamily: "inherit",
            resize: "vertical", boxSizing: "border-box", color: C.textDk,
            outline: "none" }} />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.rule}`,
            borderRadius: 6, padding: "8px 16px", fontSize: 13, color: C.textMd, cursor: "pointer" }}>
            Cancel
          </button>
          <button style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 6,
            padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Post Reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────

function ForumRightSidebar({ onSandbox }) {
  return (
    <aside style={{ width: 220, flexShrink: 0, padding: "20px 16px",
      overflowY: "auto", background: C.bg, borderLeft: `1px solid ${C.rule}` }}>

      {/* Stats */}
      <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8,
        padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLt, textTransform: "uppercase",
          letterSpacing: 0.8, marginBottom: 12 }}>Community Stats</div>
        {[["Members", "1,204"], ["Threads", "281"], ["Online now", "43"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between",
            marginBottom: 9, fontSize: 13 }}>
            <span style={{ color: C.textMd }}>{l}</span>
            <span style={{ fontWeight: 700, color: C.navyDk }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Sandbox CTA */}
      <div style={{ background: C.navy, borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ice, marginBottom: 8 }}>
          Reserve a Sandbox
        </div>
        <div style={{ fontSize: 11, color: C.textLt, marginBottom: 14, lineHeight: 1.6 }}>
          5 Neptune · 5 Apollo · Muse<br />Clean state. On demand.
        </div>
        <button onClick={onSandbox} style={{ width: "100%", background: C.accent,
          border: "none", borderRadius: 6, color: "#fff", padding: "9px 0",
          fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3 }}>
          Reserve Now →
        </button>
      </div>

      {/* Quick links */}
      <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textLt, textTransform: "uppercase",
          letterSpacing: 0.8, marginBottom: 12 }}>Quick Links</div>
        {["API Reference", "Sandbox Guide", "Code Exchange", "Report a Bug"].map(link => (
          <div key={link} style={{ fontSize: 13, color: C.navy, marginBottom: 9,
            cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: C.accent, fontSize: 10 }}>▶</span> {link}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Forum main view ──────────────────────────────────────────────────────────

function ForumView({ onSwitchView }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedThread, setSelectedThread] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = THREADS.filter(t => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || "All Discussions";

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <ForumSidebar active={activeCategory}
        setActive={cat => { setActiveCategory(cat); setSelectedThread(null); }} />

      <main style={{ flex: 1, overflowY: "auto", background: C.bg }}>
        {selectedThread ? (
          <ThreadDetail thread={selectedThread} onBack={() => setSelectedThread(null)} />
        ) : (
          <div style={{ padding: "24px 28px" }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 20, color: C.navyDk, margin: 0, fontWeight: 700 }}>
                {catLabel}
              </h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search discussions…"
                  style={{ border: `1px solid ${C.rule}`, borderRadius: 6,
                    padding: "8px 14px", fontSize: 13, width: 200,
                    outline: "none", color: C.textDk, background: C.white }} />
                <button style={{ background: C.navy, color: "#fff", border: "none",
                  borderRadius: 6, padding: "8px 18px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  + New Thread
                </button>
              </div>
            </div>

            {/* Thread list */}
            {filtered.length > 0 ? (
              filtered.map(t => (
                <ThreadCard key={t.id} thread={t} onSelect={setSelectedThread} />
              ))
            ) : (
              <div style={{ textAlign: "center", color: C.textLt,
                padding: "60px 20px", fontSize: 15 }}>
                No discussions found{search ? ` for "${search}"` : ""}.
              </div>
            )}
          </div>
        )}
      </main>

      <ForumRightSidebar onSandbox={() => onSwitchView("sandbox")} />
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function RibbonForum({ onSwitchView = () => {} }) {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, color: C.textDk }}>
      <TopNav activeView="forum" onSwitchView={onSwitchView} />
      <ForumView onSwitchView={onSwitchView} />
    </div>
  );
}
