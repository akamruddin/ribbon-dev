import { useState } from 'react'
import PillButton from '../components/ui/PillButton'
import styles from './CodeExchangePage.module.css'

const GITHUB_ORG = 'https://github.com/ribbon-dev/community'

const CATEGORY_GROUPS = [
  {
    product: 'neptune',
    label: 'Neptune',
    color: '#7D00B9',
    categories: [
      { id: 'neptune-evpn', label: 'EVPN' },
    ],
  },
  {
    product: 'muse',
    label: 'Muse',
    color: '#D91791',
    categories: [
      { id: 'muse-tasks',             label: 'Tasks' },
      { id: 'muse-workflows',         label: 'Workflows' },
      { id: 'muse-dashboards',        label: 'Dashboards - insights' },
      { id: 'muse-service-templates', label: 'Service creation templates' },
      { id: 'muse-api-kickstart',     label: 'API Kickstart' },
      { id: 'muse-ztp-neptune',       label: 'ZTP - Neptune' },
      { id: 'muse-ztp-apollo',        label: 'ZTP - Apollo' },
    ],
  },
  {
    product: 'apollo',
    label: 'Apollo',
    color: '#C0059E',
    categories: [
      { id: 'apollo-port-config', label: 'Port configuration' },
    ],
  },
]

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories.map(c => ({ ...c, product: g.product, productLabel: g.label, color: g.color })))

function getCategoryMeta(categoryId) {
  return ALL_CATEGORIES.find(c => c.id === categoryId) ?? { label: categoryId, productLabel: '', color: '#888' }
}

const SAMPLES = [
  {
    id: 1,
    category: 'neptune-evpn',
    title: 'EVPN VXLAN fabric bring-up via NETCONF',
    desc: 'Python script that bootstraps a full EVPN VXLAN underlay and overlay on Neptune rNOS using ncclient. Configures BGP peering, VNIs, and L2/L3 VRFs from a YAML intent file.',
    lang: 'Python',
    author: 'jsmith',
    stars: 14,
    path: 'tree/main/samples/neptune/evpn-vxlan-bringup',
  },
  {
    id: 2,
    category: 'neptune-evpn',
    title: 'EVPN route leak validator',
    desc: 'CLI tool that queries running state from Neptune and validates that EVPN type-5 routes are leaking correctly across VRFs. Outputs a pass/fail report.',
    lang: 'Python',
    author: 'netops_42',
    stars: 8,
    path: 'tree/main/samples/neptune/evpn-route-validator',
  },
  {
    id: 3,
    category: 'muse-tasks',
    title: 'Workflow execution tracker with Slack alerts',
    desc: 'Polls the Muse Workflow NBI (GET execution status by WEX-NNN ID) on a schedule and posts Slack notifications when executions enter Failed state or stall in Running beyond a configurable timeout.',
    lang: 'Python',
    author: 'schen',
    stars: 11,
    path: 'tree/main/samples/muse/workflow-tracker-slack',
  },
  {
    id: 4,
    category: 'muse-workflows',
    title: 'L3VPN service deploy workflow (NBI)',
    desc: 'Executes the Muse L3VPN provisioning workflow via the Workflow NBI Execute API, polls GET execution status until complete, then validates reachability. Supports eBGP and OSPFv2 PE-CE modes.',
    lang: 'Python',
    author: 'devrel_ribbon',
    stars: 22,
    path: 'tree/main/samples/muse/l3vpn-workflow-nbi',
  },
  {
    id: 5,
    category: 'muse-workflows',
    title: 'Day-2 change workflow with alarm-triggered rollback',
    desc: 'Triggers a Muse Day-2 workflow via the Workflow NBI, monitors execution status (WEX-NNN), and calls a rollback workflow automatically if alarms appear in /restconf/data/tapi-common:context/alarms/current post-commit.',
    lang: 'Python',
    author: 'mlopez',
    stars: 17,
    path: 'tree/main/samples/muse/day2-alarm-rollback',
  },
  {
    id: 6,
    category: 'muse-dashboards',
    title: 'Muse PM + alarm Grafana dashboard',
    desc: 'Prometheus exporter that polls Muse OAM job content (opt-oam-job-content NBI) and current alarms (alarms/current) to feed a pre-built Grafana dashboard with optical PM counters and standing alarm counts.',
    lang: 'Go',
    author: 'akamruddin',
    stars: 19,
    path: 'tree/main/samples/muse/grafana-pm-alarm-dash',
  },
  {
    id: 7,
    category: 'muse-service-templates',
    title: 'EVPN service creation template (NBI)',
    desc: 'Parameterised JSON request body for the Muse IP Service NBI Create EVPN API. Covers standard EVPN, IRB, VLAN-aware bundle, and VPWS P2P variants with documented required vs optional fields.',
    lang: 'JSON',
    author: 'schen',
    stars: 13,
    path: 'tree/main/samples/muse/evpn-service-template',
  },
  {
    id: 8,
    category: 'muse-service-templates',
    title: 'L3VPN service template with VRRP + RTBH',
    desc: 'Ready-to-use Muse IP Service NBI request body for L3VPN with VRRP gateway redundancy and RTBH blackhole routing. Includes eBGP and OSPFv2 PE-CE variants.',
    lang: 'JSON',
    author: 'devrel_ribbon',
    stars: 9,
    path: 'tree/main/samples/muse/l3vpn-vrrp-rtbh-template',
  },
  {
    id: 9,
    category: 'muse-api-kickstart',
    title: 'Muse NBI Postman collection (TAPI + Workflow)',
    desc: 'Postman collection covering the full Muse NBI: OSS auth, TAPI optical service CRUD, topology GET, inventory, alarms/current, OAM job configuration, and Workflow execute/status endpoints. Lab and production environment files included.',
    lang: 'JSON',
    author: 'akamruddin',
    stars: 31,
    path: 'tree/main/samples/muse/postman-nbi-collection',
  },
  {
    id: 10,
    category: 'muse-api-kickstart',
    title: 'Python client for Muse RESTCONF NBI',
    desc: 'Typed Python client for the Muse RESTCONF NBI — wraps TAPI connectivity-service CRUD, topology GET, alarm polling, OAM job management, and Workflow execute/status with automatic token refresh.',
    lang: 'Python',
    author: 'jsmith',
    stars: 24,
    path: 'tree/main/samples/muse/python-nbi-client',
  },
  {
    id: 11,
    category: 'muse-ztp-neptune',
    title: 'Neptune ZTP via Muse Workflow NBI',
    desc: 'End-to-end ZTP pipeline: DHCP option 67 triggers a Python script that calls the Muse Workflow NBI Execute API with device IP as input, polls WEX-NNN status, and confirms the device appears in the Inventory RESTCONF NBI.',
    lang: 'Python',
    author: 'netops_42',
    stars: 27,
    path: 'tree/main/samples/muse/ztp-neptune-workflow',
  },
  {
    id: 12,
    category: 'muse-ztp-apollo',
    title: 'Apollo ZTP via Muse Workflow NBI',
    desc: 'Muse Workflow NBI script that discovers a newly connected Apollo device via the Inventory NBI (tapi-equipment:physical-context), triggers a ZTP workflow, and verifies the device appears in the optical topology context.',
    lang: 'Python',
    author: 'mlopez',
    stars: 15,
    path: 'tree/main/samples/muse/ztp-apollo-workflow',
  },
  {
    id: 13,
    category: 'apollo-port-config',
    title: 'Apollo bulk port configuration via REST',
    desc: 'Script that reads a port plan spreadsheet and applies OTSi channel settings (frequency, power, modulation) to Apollo via the REST API.',
    lang: 'Python',
    author: 'netops_42',
    stars: 10,
    path: 'tree/main/samples/apollo/bulk-port-config',
  },
  {
    id: 14,
    category: 'apollo-port-config',
    title: 'Apollo port config Ansible role',
    desc: 'Ansible role for idempotent Apollo port configuration. Handles add, modify, and remove for optical channels with built-in pre/post PM checks.',
    lang: 'Ansible',
    author: 'schen',
    stars: 12,
    path: 'tree/main/samples/apollo/port-config-ansible',
  },
]

const LANG_COLORS = {
  Python:  '#3572A5',
  Go:      '#00ADD8',
  Ansible: '#EE0000',
  YAML:    '#cb9820',
  JSON:    '#5c6b8a',
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function CodeExchangePage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const visible = SAMPLES.filter(s => {
    const matchFilter = filter === 'all' || s.category === filter
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Community</div>
          <h1 className={styles.heroTitle}>Code Exchange</h1>
          <p className={styles.heroSub}>
            Scripts, playbooks, and tools built by the community — for Neptune, Apollo, and Muse.
            Browse by category or contribute your own via a GitHub PR.
          </p>
          <div className={styles.heroActions}>
            <PillButton
              variant="white"
              size="sm"
              onClick={() => window.open(GITHUB_ORG, '_blank', 'noreferrer')}
            >
              View on GitHub ↗
            </PillButton>
            <PillButton
              variant="ghost"
              size="sm"
              onClick={() => window.open(`${GITHUB_ORG}/compare`, '_blank', 'noreferrer')}
            >
              Submit via PR
            </PillButton>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          <button
            className={[styles.sideItem, filter === 'all' ? styles.sideItemActive : ''].join(' ')}
            style={filter === 'all' ? { borderLeftColor: '#7D00B9' } : {}}
            onClick={() => setFilter('all')}
          >
            All samples
          </button>

          {CATEGORY_GROUPS.map(group => (
            <div key={group.product}>
              <div className={styles.sideGroup} style={{ color: group.color }}>{group.label}</div>
              {group.categories.map(cat => (
                <button
                  key={cat.id}
                  className={[styles.sideItem, filter === cat.id ? styles.sideItemActive : ''].join(' ')}
                  style={filter === cat.id ? { borderLeftColor: group.color } : {}}
                  onClick={() => setFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ))}

          <div className={styles.sideSection}>Links</div>
          <a className={styles.sideLink} href={GITHUB_ORG} target="_blank" rel="noreferrer">
            GitHub repo ↗
          </a>
          <a className={styles.sideLink} href={`${GITHUB_ORG}/compare`} target="_blank" rel="noreferrer">
            Submit via PR ↗
          </a>
        </nav>

        <main className={styles.main}>
          <div className={styles.mainToolbar}>
            <span className={styles.resultCount}>
              {visible.length} sample{visible.length !== 1 ? 's' : ''}
            </span>
            <input
              className={styles.search}
              type="text"
              placeholder="Search samples…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.grid}>
            {visible.map(sample => {
              const meta = getCategoryMeta(sample.category)
              return (
                <a
                  key={sample.id}
                  className={styles.card}
                  href={`${GITHUB_ORG}/${sample.path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardChips}>
                      <span
                        className={styles.productChip}
                        style={{ color: meta.color, background: `${meta.color}18`, borderColor: `${meta.color}40` }}
                      >
                        {meta.productLabel}
                      </span>
                      <span className={styles.categoryChip}>{meta.label}</span>
                    </div>
                    <span className={styles.stars}><StarIcon /> {sample.stars}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{sample.title}</h3>
                  <p className={styles.cardDesc}>{sample.desc}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.langDot} style={{ background: LANG_COLORS[sample.lang] || '#888' }} />
                    <span className={styles.lang}>{sample.lang}</span>
                    <span className={styles.author}>@{sample.author}</span>
                  </div>
                </a>
              )
            })}

            {visible.length === 0 && (
              <div className={styles.empty}>
                No samples in this category yet —{' '}
                <a href={`${GITHUB_ORG}/compare`} target="_blank" rel="noreferrer">be the first to contribute ↗</a>
              </div>
            )}

            <a
              className={[styles.card, styles.contributeCard].join(' ')}
              href={`${GITHUB_ORG}/compare`}
              target="_blank"
              rel="noreferrer"
            >
              <div className={styles.contributeIcon}>+</div>
              <h3 className={styles.cardTitle}>Submit your sample</h3>
              <p className={styles.cardDesc}>Open a pull request to the community repo. Reviewed by the DevRel team within 5 business days.</p>
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
