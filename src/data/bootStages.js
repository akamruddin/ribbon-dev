export const BOOT_STAGES = [
  { label: 'Allocate compute resources',             estimate: '~30s'   },
  { label: 'Build GNS3 network topology',            estimate: '~45s'   },
  { label: 'Boot Neptune and Apollo devices',        estimate: '~2–3m'  },
  { label: 'Launch Muse orchestrator (EC2)',         estimate: '~1m'    },
  { label: 'Health checks and expose console links', estimate: '~30s'   },
]
