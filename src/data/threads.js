export const THREADS = [
  {
    id: 1,
    pinned: true,
    category: 'announcements',
    title: 'Welcome to Ribbon Developer Community — Start Here',
    author: 'ribbon_devrel',
    initials: 'RD',
    color: '#7D00B9',
    role: 'staff',
    replyCount: 42,
    viewCount: 1204,
    lastActivity: '2h ago',
    tags: ['welcome', 'announcement'],
    body: `Welcome to the Ribbon Developer Community — your hub for API documentation, sandbox reservations, code sharing, and peer-to-peer technical help.

The community sandbox gives you access to 5 Neptune devices (rNOS), 5 Apollo optical devices, and a Muse orchestration instance — all isolated per session, provisioned on demand, and wiped clean on teardown.`,
    replies: [
      {
        author: 'netops_first',
        initials: 'NF',
        color: '#0070A8',
        role: 'member',
        time: '1h ago',
        body: 'Great to be here! Already got my first NETCONF session working against NPT-1 in the sandbox.',
      },
      {
        author: 'si_partner_mx',
        initials: 'SP',
        color: '#C0059E',
        role: 'partner',
        time: '45m ago',
        body: 'Thanks for setting this up. Looking forward to the Muse workflow authoring docs.',
      },
    ],
  },
  {
    id: 2,
    pinned: false,
    category: 'neptune',
    title: 'NETCONF RPC examples for Neptune — L2VPN, L3VPN, and EVPN service activation',
    author: 'netops_eng_42',
    initials: 'NE',
    color: '#7D00B9',
    role: 'member',
    replyCount: 18,
    viewCount: 340,
    lastActivity: '45m ago',
    tags: ['netconf', 'l2vpn', 'evpn'],
    body: `Sharing a set of NETCONF RPCs validated against NPT-1 through NPT-3 in the sandbox.

  <rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
    <edit-config>
      <target><running/></target>
      <config><!-- l2vpn service --></config>
    </edit-config>
  </rpc>`,
    replies: [
      {
        author: 'ribbon_se_team',
        initials: 'RS',
        color: '#7D00B9',
        role: 'staff',
        time: '30m ago',
        body: 'Great thread. Will move to official docs once EVPN VPWS is covered.',
      },
    ],
  },
  {
    id: 3,
    pinned: false,
    category: 'muse',
    title: 'Muse REST API — conditional branching in workflow definitions',
    author: 'si_developer',
    initials: 'SD',
    color: '#D91791',
    role: 'partner',
    replyCount: 9,
    viewCount: 178,
    lastActivity: '3h ago',
    tags: ['muse', 'workflows'],
    body: 'Trying to build a Muse workflow that branches on a health-check result. Is the conditional step type supported in the current release, or do I handle branching externally?',
    replies: [],
  },
  {
    id: 4,
    pinned: false,
    category: 'apollo',
    title: 'Apollo RESTCONF — 403 on /ietf-network:networks/optical-topology',
    author: 'photon_jockey',
    initials: 'PJ',
    color: '#0070A8',
    role: 'member',
    replyCount: 4,
    viewCount: 89,
    lastActivity: '6h ago',
    tags: ['apollo', 'restconf', 'auth'],
    body: `Getting a 403 on APL-2:
  GET /restconf/data/ietf-network:networks/optical-topology

Same bearer token works on NPT-1. What scope does optical-topology require?`,
    replies: [
      {
        author: 'ribbon_devrel',
        initials: 'RD',
        color: '#7D00B9',
        role: 'staff',
        time: '5h ago',
        body: 'Optical-topology needs the optical-read scope in addition to base scope. Updating the onboarding docs.',
      },
    ],
  },
  {
    id: 5,
    pinned: false,
    category: 'getting-started',
    title: 'Sandbox tip: snapshot restore for faster time-to-ready on iterative sessions',
    author: 'ribbon_devrel',
    initials: 'RD',
    color: '#7D00B9',
    role: 'staff',
    replyCount: 7,
    viewCount: 203,
    lastActivity: '1d ago',
    tags: ['sandbox', 'tip'],
    body: `When iterating on the same lab exercise, select snapshot restore at reservation time — cuts time-to-ready roughly in half.

Full cold boot remains the default and right choice for a completely clean state.`,
    replies: [],
  },
  {
    id: 6,
    pinned: false,
    category: 'showcase',
    title: '[Showcase] muse-py — typed Python client for Muse REST API, L3VPN lifecycle',
    author: 'automate_everything',
    initials: 'AE',
    color: '#14855A',
    role: 'member',
    replyCount: 22,
    viewCount: 512,
    lastActivity: '2d ago',
    tags: ['showcase', 'python', 'muse'],
    body: `Released muse-py, a typed Python client for the Muse REST API.
  pip install muse-py

Covers L3VPN create, modify, delete, rollback. github.com/automate-everything/muse-py`,
    replies: [
      {
        author: 'si_developer',
        initials: 'SD',
        color: '#D91791',
        role: 'partner',
        time: '1d ago',
        body: 'Opening a PR for L2VPN support today.',
      },
      {
        author: 'netops_eng_42',
        initials: 'NE',
        color: '#7D00B9',
        role: 'member',
        time: '20h ago',
        body: 'Validated against NPT-3 and NPT-5. Works cleanly.',
      },
    ],
  },
]
