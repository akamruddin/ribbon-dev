export const CATEGORIES = [
  { id: 'all',             label: 'All Discussions',     icon: '◈', count: 281 },
  { id: 'announcements',   label: 'Announcements',       icon: '📣', count: 8   },
  { id: 'getting-started', label: 'Getting Started',     icon: '🚀', count: 23  },
  { id: 'neptune',         label: 'Neptune / rNOS APIs', icon: '🔷', count: 47  },
  { id: 'apollo',          label: 'Apollo Optical APIs', icon: '⚡', count: 31  },
  { id: 'muse',            label: 'Muse Orchestration',  icon: '⚙️', count: 58  },
  { id: 'acumen',          label: 'Acumen AIOps',        icon: '🤖', count: 12  },
  { id: 'code',            label: 'Code Snippets',       icon: '💻', count: 89  },
  { id: 'bugs',            label: 'Bug Reports',         icon: '🐛', count: 7   },
  { id: 'showcase',        label: 'Showcase',            icon: '✨', count: 14  },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]))
