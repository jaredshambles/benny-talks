import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './store/useStore'
import { seedIfEmpty } from './lib/seed'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import HomeView from './views/HomeView'
import CategoryView from './views/CategoryView'
import RoutinesView from './views/RoutinesView'
import SpeakingBar from './components/overlay/SpeakingBar'
import RoutineFlow from './components/routines/RoutineFlow'
import PresetSwitcher from './components/presets/PresetSwitcher'
import SettingsModal from './components/settings/SettingsModal'
import TimerPicker from './components/overlay/TimerPicker'

export default function App() {
  const { activeTab, routineActive, settingsOpen, presetSwitcherOpen, hydrate } = useStore()

  useEffect(() => {
    seedIfEmpty().then(() => hydrate())
  }, [])

  return (
    <div className="h-full flex flex-col max-w-[600px] mx-auto relative overflow-hidden bg-bg">
      <Header />

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home'       && <HomeView />}
        {activeTab === 'food'       && <CategoryView category="food" />}
        {activeTab === 'activities' && <CategoryView category="activities" />}
        {activeTab === 'feelings'   && <CategoryView category="feelings" />}
        {activeTab === 'people'     && <CategoryView category="people" />}
        {activeTab === 'routines'   && <RoutinesView />}
      </main>

      <SpeakingBar />
      <BottomNav />

      <TimerPicker />
      <AnimatePresence>
        {routineActive && <RoutineFlow key="routine-flow" />}
      </AnimatePresence>
      <AnimatePresence>
        {presetSwitcherOpen && <PresetSwitcher key="preset-switcher" />}
      </AnimatePresence>
      <AnimatePresence>
        {settingsOpen && <SettingsModal key="settings-modal" />}
      </AnimatePresence>
    </div>
  )
}
