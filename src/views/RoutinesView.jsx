import RoutineList from '../components/routines/RoutineList'

export default function RoutinesView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-2 flex-shrink-0">
        <h2 className="font-display text-[17px] text-txt-m">Routines</h2>
      </div>
      <RoutineList />
    </div>
  )
}
