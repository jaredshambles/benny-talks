import { useStore } from '../../store/useStore'

const TABS = [
  { id: 'home',       label: 'Home',       emoji: '🏠' },
  { id: 'food',       label: 'Food',       emoji: '🍗' },
  { id: 'activities', label: 'Play',       emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛' },
  { id: 'people',     label: 'People',     emoji: '👥' },
  { id: 'routines',   label: 'Routines',   emoji: '📋' },
]

const CATEGORY_ACTIVE = {
  home:       'text-act border-act',
  food:       'text-food border-food',
  activities: 'text-act border-act',
  feelings:   'text-feel border-feel',
  people:     'text-ppl border-ppl',
  routines:   'text-rtn border-rtn',
}

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav
      className="flex-shrink-0 bg-card border-t border-bg2 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(72px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onTouchStart={() => setActiveTab(tab.id)}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 border-t-2 transition-colors
              ${isActive ? CATEGORY_ACTIVE[tab.id] : 'text-txt-l border-transparent'}`}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className={`text-[10px] font-body font-bold leading-none ${isActive ? '' : 'text-txt-m'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
