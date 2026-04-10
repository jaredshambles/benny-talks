import { useStore } from '../../store/useStore'

export default function RoutineList() {
  const { routines, startRoutine } = useStore()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
      {routines.map(routine => (
        <button
          key={routine.id}
          onTouchStart={() => startRoutine(routine)}
          onClick={() => startRoutine(routine)}
          className="bg-card rounded-card shadow-card flex flex-col items-center justify-center gap-2
                     py-6 border-none min-h-[100px] active:scale-[0.93] transition-transform duration-150"
        >
          <div className="w-16 h-16 rounded-full bg-rtn-l flex items-center justify-center text-4xl">
            {routine.emoji}
          </div>
          <span className="font-display text-sm text-txt text-center px-2 leading-tight">
            {routine.label}
          </span>
        </button>
      ))}
    </div>
  )
}
