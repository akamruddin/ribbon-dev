import bcrypt from 'bcryptjs'
import { db } from './index.js'

export async function seedIfEmpty() {
  const { rows } = await db.query('SELECT COUNT(*) FROM users')
  if (parseInt(rows[0].count) > 0) return  // already seeded

  console.log('  seeding database…')

  // Seed users
  const users = [
    { email: 'devrel@ribbon.com',     username: 'ribbon_devrel',      role: 'staff',   initials: 'RD', color: '#7D00B9', password: 'ribbon2026!' },
    { email: 'netops42@example.com',  username: 'netops_eng_42',      role: 'member',  initials: 'NE', color: '#7D00B9', password: 'member2026' },
    { email: 'si@partner.com',        username: 'si_developer',       role: 'partner', initials: 'SD', color: '#D91791', password: 'partner2026' },
    { email: 'photon@example.com',    username: 'photon_jockey',      role: 'member',  initials: 'PJ', color: '#0070A8', password: 'member2026' },
    { email: 'automate@example.com',  username: 'automate_everything',role: 'member',  initials: 'AE', color: '#14855A', password: 'member2026' },
    { email: 'rse@ribbon.com',        username: 'ribbon_se_team',     role: 'staff',   initials: 'RS', color: '#7D00B9', password: 'ribbon2026!' },
    { email: 'si2@partner.com',       username: 'si_partner_mx',      role: 'partner', initials: 'SP', color: '#C0059E', password: 'partner2026' },
    { email: 'netops1@example.com',   username: 'netops_first',       role: 'member',  initials: 'NF', color: '#0070A8', password: 'member2026' },
  ]

  const userIds = {}
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    const { rows } = await db.query(
      `INSERT INTO users (email, username, password_hash, role, initials, color)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [u.email, u.username, hash, u.role, u.initials, u.color]
    )
    userIds[u.username] = rows[0].id
  }

  // Seed categories
  const categories = [
    { slug: 'announcements',   label: 'Announcements',       icon: '📣', sort_order: 1 },
    { slug: 'getting-started', label: 'Getting Started',     icon: '🚀', sort_order: 2 },
    { slug: 'neptune',         label: 'Neptune / rNOS APIs', icon: '🔷', sort_order: 3 },
    { slug: 'apollo',          label: 'Apollo Optical APIs', icon: '⚡', sort_order: 4 },
    { slug: 'muse',            label: 'Muse Orchestration',  icon: '⚙️', sort_order: 5 },
    { slug: 'acumen',          label: 'Acumen AIOps',        icon: '🤖', sort_order: 6 },
    { slug: 'code',            label: 'Code Snippets',       icon: '💻', sort_order: 7 },
    { slug: 'bugs',            label: 'Bug Reports',         icon: '🐛', sort_order: 8 },
    { slug: 'showcase',        label: 'Showcase',            icon: '✨', sort_order: 9 },
  ]
  for (const c of categories) {
    await db.query(
      `INSERT INTO categories (slug, label, icon, sort_order) VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.label, c.icon, c.sort_order]
    )
  }

  // Seed threads
  const threads = [
    {
      pinned: true, category: 'announcements', author: 'ribbon_devrel',
      title: 'Welcome to Ribbon Developer Community — Start Here',
      tags: ['welcome','announcement'],
      body: `Welcome to the Ribbon Developer Community — your hub for API documentation, sandbox reservations, code sharing, and peer-to-peer technical help.\n\nThe community sandbox gives you access to 5 Neptune devices (rNOS), 5 Apollo optical devices, and a Muse orchestration instance — all isolated per session, provisioned on demand, and wiped clean on teardown.`,
      replies: [
        { author: 'netops_first',  body: 'Great to be here! Already got my first NETCONF session working against NPT-1 in the sandbox.' },
        { author: 'si_partner_mx', body: 'Thanks for setting this up. Looking forward to the Muse workflow authoring docs.' },
      ],
    },
    {
      pinned: false, category: 'neptune', author: 'netops_eng_42',
      title: 'NETCONF RPC examples for Neptune — L2VPN, L3VPN, and EVPN service activation',
      tags: ['netconf','l2vpn','evpn'],
      body: `Sharing a set of NETCONF RPCs validated against NPT-1 through NPT-3 in the sandbox.\n\n  <rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">\n    <edit-config>\n      <target><running/></target>\n      <config><!-- l2vpn service --></config>\n    </edit-config>\n  </rpc>`,
      replies: [
        { author: 'ribbon_se_team', body: 'Great thread. Will move to official docs once EVPN VPWS is covered.' },
      ],
    },
    {
      pinned: false, category: 'muse', author: 'si_developer',
      title: 'Muse REST API — conditional branching in workflow definitions',
      tags: ['muse','workflows'],
      body: 'Trying to build a Muse workflow that branches on a health-check result. Is the conditional step type supported in the current release, or do I handle branching externally?',
      replies: [],
    },
    {
      pinned: false, category: 'apollo', author: 'photon_jockey',
      title: 'Apollo RESTCONF — 403 on /ietf-network:networks/optical-topology',
      tags: ['apollo','restconf','auth'],
      body: `Getting a 403 on APL-2:\n  GET /restconf/data/ietf-network:networks/optical-topology\n\nSame bearer token works on NPT-1. What scope does optical-topology require?`,
      replies: [
        { author: 'ribbon_devrel', body: 'Optical-topology needs the optical-read scope in addition to base scope. Updating the onboarding docs.' },
      ],
    },
    {
      pinned: false, category: 'getting-started', author: 'ribbon_devrel',
      title: 'Sandbox tip: snapshot restore for faster time-to-ready on iterative sessions',
      tags: ['sandbox','tip'],
      body: `When iterating on the same lab exercise, select snapshot restore at reservation time — cuts time-to-ready roughly in half.\n\nFull cold boot remains the default and right choice for a completely clean state.`,
      replies: [],
    },
    {
      pinned: false, category: 'showcase', author: 'automate_everything',
      title: '[Showcase] muse-py — typed Python client for Muse REST API, L3VPN lifecycle',
      tags: ['showcase','python','muse'],
      body: `Released muse-py, a typed Python client for the Muse REST API.\n  pip install muse-py\n\nCovers L3VPN create, modify, delete, rollback. github.com/automate-everything/muse-py`,
      replies: [
        { author: 'si_developer',  body: 'Opening a PR for L2VPN support today.' },
        { author: 'netops_eng_42', body: 'Validated against NPT-3 and NPT-5. Works cleanly.' },
      ],
    },
  ]

  for (const t of threads) {
    const authorId = userIds[t.author]
    const { rows } = await db.query(
      `INSERT INTO threads (category_slug, title, body, author_id, pinned, reply_count, view_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [t.category, t.title, t.body, authorId, t.pinned, t.replies.length, Math.floor(Math.random() * 500) + 50]
    )
    const threadId = rows[0].id
    for (const tag of t.tags) {
      await db.query('INSERT INTO thread_tags (thread_id, tag) VALUES ($1,$2)', [threadId, tag])
    }
    for (const r of t.replies) {
      await db.query(
        'INSERT INTO replies (thread_id, author_id, body) VALUES ($1,$2,$3)',
        [threadId, userIds[r.author], r.body]
      )
    }
  }

  console.log('  ✓ seed complete')
}
