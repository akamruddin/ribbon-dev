import { useState } from 'react'
import styles from './DocsPage.module.css'

const PRODUCTS = [
  {
    id: 'neptune',
    name: 'Neptune rNOS',
    tag: 'EMS-NPT NBI / NETCONF / gNMI',
    color: '#7D00B9',
    sections: [
      {
        title: 'EMS & Element Management',
        badge: 'MTNM / CORBA',
        description: 'Core EMS and managed element operations via the MTNM/CORBA NBI. Retrieve EMS identity, managed elements, termination points, and user-defined labels. The LSNManagedElementMgr interface extends MTNM with proprietary Ribbon operations for device lifecycle management.',
        endpoints: [
          { method: 'OP', label: 'emsMgr::GetEMS',                    desc: 'Retrieve EMS identity, name, and software version' },
          { method: 'OP', label: 'emsMgr::GetAllTopLevelSubnetworks',  desc: 'Get all top-level subnetworks managed by this EMS' },
          { method: 'OP', label: 'emsMgr::SetUserLabel',               desc: 'Set user-defined label on any managed object' },
          { method: 'OP', label: 'managedElementManager::GetAllManagedElements', desc: 'Retrieve list of all managed Neptune NEs' },
          { method: 'OP', label: 'managedElementManager::GetAllPTPs',  desc: 'Get all Physical Termination Points for a managed element' },
          { method: 'OP', label: 'managedElementManager::GetTP',       desc: 'Retrieve a specific Termination Point by name' },
          { method: 'OP', label: 'managedElementManager::setTPData',   desc: 'Modify Termination Point attributes (user label, owner, etc.)' },
          { method: 'OP', label: 'LSNManagedElementMgr::createME',     desc: 'Create a new Managed Element entry (Ribbon proprietary)' },
          { method: 'OP', label: 'LSNManagedElementMgr::deleteME',     desc: 'Delete a Managed Element from the EMS inventory' },
          { method: 'OP', label: 'LSNManagedElementMgr::lockMEs',      desc: 'Lock one or more Managed Elements to prevent configuration changes' },
        ],
      },
      {
        title: 'Connection Provisioning',
        badge: 'MTNM / CORBA',
        description: 'Subnetwork Connection (SNC) lifecycle management. Create, activate, retrieve, and delete end-to-end cross-connections across the Neptune network for TDM and packet-based services.',
        endpoints: [
          { method: 'OP', label: 'multiLayerSubnetwork::createAndActivateSNC',      desc: 'Create and immediately activate a Subnetwork Connection (SNC)' },
          { method: 'OP', label: 'multiLayerSubnetwork::deactivateAndDeleteSNC',    desc: 'Deactivate and remove an existing SNC, releasing all resources' },
          { method: 'OP', label: 'multiLayerSubnetwork::GetAllSubnetworkConnections', desc: 'Retrieve all SNCs within a managed subnetwork' },
          { method: 'OP', label: 'multiLayerSubnetwork::GetSNC',                    desc: 'Get detailed SNC attributes including endpoints, state, and protection' },
        ],
      },
      {
        title: 'L2 Services (Flow Domain)',
        badge: 'MTNM / CORBA',
        description: 'Flow Domain and Flow Domain Fragment (FDFr) operations for Ethernet and L2 service provisioning. Supports creation, modification, and deletion of multipoint L2 services including TC profiles.',
        endpoints: [
          { method: 'OP', label: 'flowDomain::createAndActivateFDFr',  desc: 'Create and activate a Flow Domain Fragment for an L2 service' },
          { method: 'OP', label: 'flowDomain::deactivateAndDeleteFDFr', desc: 'Deactivate and remove a Flow Domain Fragment' },
          { method: 'OP', label: 'flowDomain::modifyFDFr',             desc: 'Modify FDFr attributes — add/remove CPTPs, update TC profile' },
          { method: 'OP', label: 'flowDomain::getAllFDFrs',             desc: 'Retrieve all Flow Domain Fragments within a Flow Domain' },
          { method: 'OP', label: 'flowDomain::getAllAssignedCPTPs',     desc: 'Get all Connection Potential Termination Points assigned to FDFrs' },
          { method: 'OP', label: 'flowDomain::createTCProfile',        desc: 'Create a Traffic Conditioning (TC) profile for rate and QoS policies' },
        ],
      },
      {
        title: 'Alarms & Events',
        badge: 'MTNM / CORBA',
        description: 'Fault management via active alarm retrieval and real-time CORBA event channel subscriptions. Supports alarm acknowledgement and TCA/protection switch notifications.',
        endpoints: [
          { method: 'OP', label: 'emsMgr::GetAllEMSAndMEActiveAlarms',          desc: 'Retrieve all active alarms across the full EMS scope' },
          { method: 'OP', label: 'managedElementManager::GetAllActiveAlarms',    desc: 'Get active alarms scoped to a specific Managed Element' },
          { method: 'OP', label: 'emsSessionModule::GetEventChannel',            desc: 'Subscribe to real-time CORBA event channel for alarm, TCA, and protection switch notifications' },
          { method: 'OP', label: 'performMaintenanceOperation (acknowledge)',     desc: 'Acknowledge an active alarm to suppress repeat notifications' },
        ],
      },
      {
        title: 'Performance Monitoring',
        badge: 'MTNM / CORBA',
        description: 'Enable, disable, and retrieve PM counters per Termination Point. Supports current and historical data collection with configurable granularity intervals.',
        endpoints: [
          { method: 'OP', label: 'performance::EnablePMData',          desc: 'Enable PM data collection for a TP with specified granularity' },
          { method: 'OP', label: 'performance::DisablePMData',         desc: 'Disable PM data collection for a TP' },
          { method: 'OP', label: 'performance::GetAllCurrentPMData',   desc: 'Retrieve current PM counter values for one or more TPs' },
          { method: 'OP', label: 'performance::GetHistoryPMData',      desc: 'Retrieve historical PM data for a TP over a specified time range' },
          { method: 'OP', label: 'performance::ClearPMData',           desc: 'Clear accumulated PM counters for a TP' },
        ],
      },
      {
        title: 'Protection',
        badge: 'MTNM / CORBA',
        description: 'Retrieve and control protection groups. Supports manual switch, forced switch, lockout, and release commands across APS/SNCP protection schemes.',
        endpoints: [
          { method: 'OP', label: 'protection::GetAllProtectionGroups', desc: 'List all protection groups managed by the EMS' },
          { method: 'OP', label: 'protection::GetProtectionGroup',     desc: 'Get protection group details including working/protect paths and state' },
          { method: 'OP', label: 'protection::performProtectionCommand', desc: 'Execute a protection command: manual switch, forced switch, lockout, or release' },
          { method: 'OP', label: 'protection::retrieveSwitchData',     desc: 'Retrieve current switch state and last switch reason for a protection group' },
        ],
      },
      {
        title: 'NETCONF / YANG',
        badge: 'RFC 6241',
        description: 'Model-driven configuration and state retrieval over SSH. Neptune rNOS ships a full YANG model library for all SBC and routing constructs.',
        endpoints: [
          { method: 'RPC', label: 'get-config', desc: 'Retrieve running, candidate, or startup datastore' },
          { method: 'RPC', label: 'edit-config', desc: 'Create, merge, replace, or delete configuration subtrees' },
          { method: 'RPC', label: 'commit', desc: 'Promote candidate configuration to running' },
          { method: 'RPC', label: 'get', desc: 'Retrieve config + state data in one call' },
        ],
      },
      {
        title: 'Streaming Telemetry',
        badge: 'gRPC / gNMI',
        description: 'Push-based telemetry subscriptions for high-frequency counters and alarms. Targets Prometheus / Grafana stacks.',
        endpoints: [
          { method: 'RPC', label: 'Subscribe', desc: 'Open a gNMI Subscribe stream for sensor paths' },
          { method: 'RPC', label: 'Get',       desc: 'One-shot telemetry pull for arbitrary paths' },
        ],
      },
    ],
  },
  {
    id: 'apollo',
    name: 'Apollo Optical',
    tag: 'NETCONF / OpenConfig / Open ROADM',
    color: '#C0059E',
    sections: [
      {
        title: 'NETCONF / YANG',
        badge: 'RFC 6241 / OpenConfig',
        description: 'Model-driven configuration and state management over SSH. Apollo supports both OpenConfig YANG models (TIP model implementation) and proprietary Ribbon YANG extensions. NETCONF co-exists with CLI and STMS — operators can mix management methods freely.',
        endpoints: [
          { method: 'RPC', label: 'get-config',  desc: 'Retrieve running or candidate datastore — optical channels, amplifiers, protection groups, system config' },
          { method: 'RPC', label: 'edit-config', desc: 'Configure OTSi channels (frequency, power, modulation), ROADM add/drop, amplifier set-points, OTN cross-connects' },
          { method: 'RPC', label: 'commit',      desc: 'Promote candidate configuration to running; supports confirmed-commit with automatic rollback timer' },
          { method: 'RPC', label: 'get',         desc: 'Retrieve combined config + operational state (PM counters, alarm state, inventory) in one call' },
          { method: 'RPC', label: 'get-schema',  desc: 'Retrieve YANG module source for openconfig-platform, openconfig-terminal-device, openconfig-wavelength-router, openconfig-optical-amplifier' },
          { method: 'RPC', label: 'lock / unlock', desc: 'Exclusive lock on the candidate datastore for safe multi-step configuration sequences' },
        ],
      },
      {
        title: 'Open ROADM MSA',
        badge: 'OpenROADM MSA',
        description: 'Apollo platforms fully support the Open ROADM Multi-Source Agreement (MSA) YANG device model. The OpenROADM APIs are exposed directly from the NE, enabling integration with any third-party Open Domain Controller (ODC) for OLS, DCI transponder/muxponder, and OTN switching use cases.',
        endpoints: [
          { method: 'RPC', label: 'get (org-openroadm-device)',          desc: 'Read full device state — shelf, circuit-packs, ports, interfaces, and internal links' },
          { method: 'RPC', label: 'edit-config (org-openroadm-device)',  desc: 'Configure optical channel interfaces: wavelength, power, modulation format, FEC mode' },
          { method: 'RPC', label: 'edit-config (org-openroadm-network)', desc: 'Configure network topology — roadm-connections, degree add/drop, SRG port assignments' },
          { method: 'RPC', label: 'edit-config (org-openroadm-service)', desc: 'Provision end-to-end optical connectivity services via Open ROADM service model' },
          { method: 'RPC', label: 'get (org-openroadm-pm)',              desc: 'Retrieve current and historical 15-min / 24-hr PM data per interface' },
          { method: 'RPC', label: 'get (org-openroadm-alarm)',           desc: 'Retrieve active alarm list and alarm history; subscribe to notifications via NETCONF notification stream' },
        ],
      },
      {
        title: 'gNMI Streaming Telemetry',
        badge: 'gRPC / gNMI',
        description: 'Model-driven telemetry using OpenConfig gNMI with gRPC transport. Dial-out mode only — Apollo pushes data via Publish() RPC to a configured collector (SONiC gNMIDialOut service). Streams periodic or event-driven PM and alarm data at near real-time cadence.',
        endpoints: [
          { method: 'RPC', label: 'Publish() — Ethernet client PM',   desc: 'Ethernet 10/40/100/400GE port counters: CRC errors, bad frames, PCS errors, traffic counters (frames/octets)' },
          { method: 'RPC', label: 'Publish() — OTN client PM',        desc: 'OTN client port: BBE, ES, SES, UAS per G.8201 interval' },
          { method: 'RPC', label: 'Publish() — Line port optical PM', desc: 'Pre-FEC BER, Q-Factor, OSNR, and chromatic dispersion per optical line port' },
          { method: 'RPC', label: 'Publish() — OTN line PM',          desc: 'OTN line ports: BBE, ES, SES, UAS' },
          { method: 'RPC', label: 'Publish() — PTP power',            desc: 'PTP line port current Tx power and Rx power readings' },
          { method: 'RPC', label: 'Publish() — Alarms',               desc: 'Current standing alarms and peripheral/common card alarms: equipment out, failure, bit failure, mismatch' },
        ],
      },
      {
        title: 'SNMP',
        badge: 'SNMPv2c / SNMPv3',
        description: 'Legacy OSS integration via SNMP. An SNMP agent runs on each Apollo NE. Supports MIB-based polling for PM counters and trap-based alarm forwarding to an NMS. SNMPv3 with authentication and privacy is recommended for new deployments.',
        endpoints: [
          { method: 'RPC', label: 'GET — ifTable / ifXTable',    desc: 'Poll Ethernet and OTN interface statistics via standard IF-MIB' },
          { method: 'RPC', label: 'GET — Apollo PM MIB',         desc: 'Poll 15-min and 24-hr optical PM counters (OSNR, power, BER) via proprietary Apollo PM MIB' },
          { method: 'RPC', label: 'TRAP — alarmActiveTrap',      desc: 'Receive active alarm traps from NE when faults are raised or cleared' },
          { method: 'RPC', label: 'GET — Apollo Inventory MIB',  desc: 'Poll chassis, card, and port inventory: part numbers, serial numbers, firmware versions' },
        ],
      },
    ],
  },
  {
    id: 'muse',
    name: 'Muse Orchestrator',
    tag: 'NBI / RESTCONF / TAPI',
    color: '#D91791',
    sections: [
      {
        title: 'IP Services',
        badge: 'RESTCONF',
        description: 'Lifecycle management for L2VPN (P2P, P2MP, MP2MP, BD-VSI, MSPW), L3VPN (eBGP, OSPFv2, VRRP, DHCP, IRB, RTBH), EVPN (standard, IRB, VLAN-aware bundle, VPWS P2P, VPLS E-Tree), and virtual Ethernet Segments (single-homed, dual-homed).',
        endpoints: [
          { method: 'POST',   label: 'Create IP service',           desc: 'Create L2VPN, L3VPN, or EVPN service with full parameter set' },
          { method: 'GET',    label: 'Get IP service details',       desc: 'Retrieve provisioned service state, endpoints, and operational status' },
          { method: 'PUT',    label: 'Modify IP service',            desc: 'Update service parameters — bandwidth, PE-CE protocol, VRF policy, RTBH' },
          { method: 'DELETE', label: 'Delete IP service',            desc: 'Remove L2VPN, L3VPN, or EVPN service and release all resources' },
          { method: 'POST',   label: 'Create Ethernet Segment',      desc: 'Create single-homed, dual-homed, or Port Active mode vES' },
          { method: 'GET',    label: 'Get Ethernet Segment details',  desc: 'Retrieve vES configuration and operational state' },
          { method: 'PUT',    label: 'Modify Ethernet Segment',       desc: 'Update Ethernet Segment mode or port parameters' },
          { method: 'DELETE', label: 'Delete Ethernet Segment',       desc: 'Remove Ethernet Segment and deallocate associated resources' },
        ],
      },
      {
        title: 'Optical Services',
        badge: 'TAPI v2.1.3 / TR-547',
        description: 'Optical service provisioning based on TR-547 TAPI v2.1.3 RIA. Supports standard, WSON-protected, and Alien Lambda optical connectivity services.',
        endpoints: [
          { method: 'GET',    label: '/restconf/data/tapi-common:context?depth=3',                                                    desc: 'Get full context including topology, services, and SIPs (UC 0a step 1)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context?fields=service-interface-point(uuid)',                        desc: 'Get list of Service Interface Point UUIDs (UC 0a step 3)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context/service-interface-point={uuid}',                              desc: 'Get detailed SIP information including supported layer protocols (UC 0a step 5)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context?fields=connectivity-service(uuid)', desc: 'Get UUIDs of all provisioned connectivity services (UC 0c step 1)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context/connectivity-service={uuid}', desc: 'Get full connectivity service details (UC 0c step 3)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context/services-pageable',                                          desc: 'Paginated list of all optical services' },
          { method: 'POST',   label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context',                     desc: 'Create optical connectivity service — standard, WSON-protected, or Alien Lambda (UC 1a step 1)' },
          { method: 'PUT',    label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context/connectivity-service={uuid}', desc: 'Modify existing optical service parameters' },
          { method: 'DELETE', label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context/connectivity-service={uuid}', desc: 'Delete optical connectivity service (UC 10)' },
          { method: 'GET',    label: '/restconf/data/tapi-common:context/tapi-connectivity:connectivity-context/connection={uuid}',   desc: 'Get connection detail including route and cross-connects (UC 0c step 7)' },
        ],
      },
      {
        title: 'Topology',
        badge: 'TAPI v2.1.3 / TR-547',
        description: 'Multi-layer network topology retrieval for optical and IP networks. Supports explicit layer classification (OCH, OMS, etc.) per TR-547.',
        endpoints: [
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context?fields=topology(uuid)',                                               desc: 'Get short topology list — UUIDs only (UC 0b steps 1–2)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}?fields=uuid;name;layer-protocol-name',                desc: 'Get topology details including name and layer classification (UC 0b steps 3–4)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}?fields=node(uuid)',                                   desc: 'Get node UUID list for a topology (UC 0b steps 5–6)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}/node={uuid}',                                         desc: 'Get node details including NEPs and supported layers (UC 0b steps 7–8)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}/node={uuid}/owned-node-edge-point={uuid}',            desc: 'Get Node Edge Point (NEP) detail' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}?fields=link(uuid)',                                   desc: 'Get link UUID list for a topology (UC 0b steps 9–10)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-topology:topology-context/topology={uuid}/link={uuid}',                                         desc: 'Get link details including endpoint NEPs and layer (UC 0b steps 11–12)' },
        ],
      },
      {
        title: 'Inventory',
        badge: 'TAPI v2.1.3 / TR-547',
        description: 'Physical device inventory based on TAPI equipment model (UC 4b). Retrieve managed device list and per-device hardware detail.',
        endpoints: [
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-equipment:physical-context?fields=device(uuid)', desc: 'Get list of all managed device UUIDs (UC 4b step 1)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-equipment:physical-context/device={uuid}',       desc: 'Get full device detail — chassis, cards, ports, and hardware inventory (UC 4b step 3)' },
        ],
      },
      {
        title: 'Alarms & Events',
        badge: 'RESTCONF',
        description: 'Retrieve current standing alarms and historical alarm records. Also available via Kafka streaming and SNMP — see Supported NBI Protocols.',
        endpoints: [
          { method: 'GET', label: '/restconf/data/tapi-common:context/alarms/current', desc: 'Get all active/standing alarms across the managed network' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/alarms/history',  desc: 'Get historical alarm log with timestamps and severity' },
        ],
      },
      {
        title: 'Performance Monitoring',
        badge: 'RESTCONF / OAM',
        description: 'Configure OAM jobs to collect PM data for optical and IP services. Supports per-port, per-interval, and time-range queries per TR-547 UC 17a/17c.',
        endpoints: [
          { method: 'PUT', label: '/restconf/data/tapi-common:context/tapi-oam:oam-context/oam-job={uuid}',          desc: 'Configure OAM job for inventory and IP service PM (UC 17a, 17c)' },
          { method: 'PUT', label: '/restconf/data/tapi-common:context/tapi-oam:oam-context/opt-oam-job={uuid}',      desc: 'Configure OAM job for optical service PM (UC 17a, 17c)' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-oam:oam-context?fields=oam-job(uuid)',    desc: 'Get list of all configured OAM job UUIDs' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-oam:oam-context/oam-job={uuid}?fields=name;oam-job-type', desc: 'Get OAM job name and type' },
          { method: 'GET', label: '/restconf/data/tapi-common:context/tapi-oam:oam-context/opt-oam-job-content={uuid}', desc: 'Get PM data collected by an optical OAM job' },
        ],
      },
      {
        title: 'Workflows',
        badge: 'RESTCONF',
        description: 'Execute and monitor Muse automation workflows via NBI. Workflows can be triggered manually or via schedule/alarm/event. Returns execution IDs in the format WEX-NNN.',
        endpoints: [
          { method: 'POST', label: 'Execute Workflow',                desc: 'Trigger a named workflow with optional execution-name, description, and per-workflow input parameters' },
          { method: 'GET',  label: 'Get Workflow Execution Status',   desc: 'Poll execution status (Idle / Running / Failed), lifecycle-state, last task, and timestamps by execution-id' },
          { method: 'GET',  label: 'Get Workflow Input Parameters',   desc: 'Retrieve required and optional input parameters (type, required, default) for a named workflow' },
        ],
      },
    ],
  },
  {
    id: 'acumen',
    name: 'Acumen',
    tag: 'AI / Analytics',
    color: '#DC5DF7',
    comingSoon: true,
    sections: [],
  },
]

const METHOD_COLORS = {
  GET:    { bg: 'rgba(0,160,80,0.12)',  text: '#00a050', border: 'rgba(0,160,80,0.3)'  },
  POST:   { bg: 'rgba(0,112,230,0.12)', text: '#0070e6', border: 'rgba(0,112,230,0.3)' },
  PUT:    { bg: 'rgba(220,130,0,0.12)', text: '#dc8200', border: 'rgba(220,130,0,0.3)'  },
  PATCH:  { bg: 'rgba(150,70,220,0.12)',text: '#9646dc', border: 'rgba(150,70,220,0.3)' },
  DELETE: { bg: 'rgba(208,32,46,0.12)', text: '#d0202e', border: 'rgba(208,32,46,0.3)'  },
  RPC:    { bg: 'rgba(125,0,185,0.10)', text: '#7D00B9', border: 'rgba(125,0,185,0.3)'  },
  OP:     { bg: 'rgba(0,150,160,0.10)', text: '#009090', border: 'rgba(0,150,160,0.3)'  },
}

function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.RPC
  return (
    <span
      className={styles.methodBadge}
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {method}
    </span>
  )
}

export default function DocsPage() {
  const [activeProduct, setActiveProduct] = useState('neptune')
  const product = PRODUCTS.find(p => p.id === activeProduct)

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Developer Documentation</div>
          <h1 className={styles.heroTitle}>API Reference</h1>
          <p className={styles.heroSub}>
            Automate Neptune, Apollo, and Muse with NETCONF/YANG, REST, and gRPC.
            All sandbox sessions are pre-wired — no credentials needed.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {PRODUCTS.map(p => (
            <button
              key={p.id}
              className={[styles.sideItem, activeProduct === p.id ? styles.sideItemActive : ''].join(' ')}
              onClick={() => setActiveProduct(p.id)}
              style={activeProduct === p.id ? { borderLeftColor: p.color } : {}}
            >
              <span className={styles.sideItemName}>{p.name}</span>
              <span className={styles.sideItemTag}>{p.tag}</span>
              {p.comingSoon && <span className={styles.soon}>soon</span>}
            </button>
          ))}

          <div className={styles.sideSection}>Resources</div>
          <a
            className={styles.sideLink}
            href="https://doc.rbbn.com/spaces/ALLDOC/pages/407996012/Ribbon+Product+Documentation+Home"
            target="_blank"
            rel="noreferrer"
          >
            Ribbon Doc Center ↗
          </a>
          <a
            className={styles.sideLink}
            href="https://github.com/ribbon-dev/community"
            target="_blank"
            rel="noreferrer"
          >
            GitHub — Code Samples ↗
          </a>
          <a className={styles.sideLink} href="/sandbox">Reserve Sandbox →</a>
        </nav>

        <main className={styles.main}>
          {product.comingSoon ? (
            <div className={styles.comingSoon}>
              <div className={styles.comingSoonBadge}>Coming Soon</div>
              <h2 className={styles.comingSoonTitle}>{product.name}</h2>
              <p className={styles.comingSoonCopy}>
                Acumen AI & Analytics documentation will be published here in Phase 2.
                Join the forum to stay updated.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.productHeader}>
                <div className={styles.productDot} style={{ background: product.color }} />
                <div>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <span className={styles.productTag}>{product.tag}</span>
                </div>
              </div>

              {product.sections.map(section => (
                <section key={section.title} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{section.title}</h3>
                    <span className={styles.sectionBadge}>{section.badge}</span>
                  </div>
                  <p className={styles.sectionDesc}>{section.description}</p>

                  <div className={styles.endpoints}>
                    {section.endpoints.map(ep => (
                      <div key={ep.label} className={styles.endpoint}>
                        <div className={styles.endpointLeft}>
                          <MethodBadge method={ep.method} />
                          <code className={styles.endpointLabel}>{ep.label}</code>
                        </div>
                        <p className={styles.endpointDesc}>{ep.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
