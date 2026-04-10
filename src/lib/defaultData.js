// All default cards, routines, preset definitions for Benny Talks
// IDs are stable strings — used to seed Supabase and match preset_cards

export const DEFAULT_CARDS = [
  // Food (13)
  { id: 'food-nuggets',     label: 'Chicken Nuggets', emoji: '🍗', category: 'food',       sort_order: 0 },
  { id: 'food-pizza',       label: 'Pizza',           emoji: '🍕', category: 'food',       sort_order: 1 },
  { id: 'food-fries',       label: 'French Fries',    emoji: '🍟', category: 'food',       sort_order: 2 },
  { id: 'food-ranch',       label: 'Ranch',           emoji: '🥣', category: 'food',       sort_order: 3 },
  { id: 'food-toast',       label: 'Toast Sticks',    emoji: '🍞', category: 'food',       sort_order: 4 },
  { id: 'food-juice',       label: 'Green Juice',     emoji: '🥤', category: 'food',       sort_order: 5 },
  { id: 'food-water',       label: 'Water',           emoji: '💧', category: 'food',       sort_order: 6 },
  { id: 'food-blueberries', label: 'Blueberries',     emoji: '🫐', category: 'food',       sort_order: 7 },
  { id: 'food-strawberries',label: 'Strawberries',    emoji: '🍓', category: 'food',       sort_order: 8 },
  { id: 'food-banana',      label: 'Banana',          emoji: '🍌', category: 'food',       sort_order: 9 },
  { id: 'food-figbars',     label: 'Fig Bars',        emoji: '🍪', category: 'food',       sort_order: 10 },
  { id: 'food-milk',        label: 'Milk',            emoji: '🥛', category: 'food',       sort_order: 11 },
  { id: 'food-crackers',    label: 'Crackers',        emoji: '🍘', category: 'food',       sort_order: 12 },

  // Activities (16)
  { id: 'act-tractor',      label: 'Tractor',         emoji: '🚜', category: 'activities', sort_order: 0 },
  { id: 'act-trampoline',   label: 'Trampoline',      emoji: '🤸', category: 'activities', sort_order: 1 },
  { id: 'act-hotwheels',    label: 'Hot Wheels',      emoji: '🏎️', category: 'activities', sort_order: 2 },
  { id: 'act-carride',      label: 'Car Ride',        emoji: '🚗', category: 'activities', sort_order: 3 },
  { id: 'act-blippi',       label: 'Blippi',          emoji: '🎉', category: 'activities', sort_order: 4 },
  { id: 'act-dream',        label: 'Dream Machine',   emoji: '📖', category: 'activities', sort_order: 5 },
  { id: 'act-tonies',       label: 'Tonies',          emoji: '🎵', category: 'activities', sort_order: 6 },
  { id: 'act-guitar',       label: 'Guitar',          emoji: '🎸', category: 'activities', sort_order: 7 },
  { id: 'act-drums',        label: 'Drums',           emoji: '🥁', category: 'activities', sort_order: 8 },
  { id: 'act-park',         label: 'Park',            emoji: '🌳', category: 'activities', sort_order: 9 },
  { id: 'act-garden',       label: 'Garden',          emoji: '🌱', category: 'activities', sort_order: 10 },
  { id: 'act-glammy',       label: "Glammy's House",  emoji: '👵', category: 'activities', sort_order: 11 },
  { id: 'act-youtube',      label: 'YouTube',         emoji: '▶️', category: 'activities', sort_order: 12 },
  { id: 'act-swing',        label: 'Swing',           emoji: '🪁', category: 'activities', sort_order: 13 },
  { id: 'act-waterplay',    label: 'Water Play',      emoji: '💦', category: 'activities', sort_order: 14 },
  { id: 'act-ducks',        label: 'See Ducks',       emoji: '🦆', category: 'activities', sort_order: 15 },

  // Feelings (14)
  { id: 'feel-happy',    label: 'Happy',    emoji: '😄', category: 'feelings', sort_order: 0 },
  { id: 'feel-no',       label: 'No',       emoji: '🙅', category: 'feelings', sort_order: 1 },
  { id: 'feel-yes',      label: 'Yes',      emoji: '👍', category: 'feelings', sort_order: 2 },
  { id: 'feel-alldone',  label: 'All Done', emoji: '✅', category: 'feelings', sort_order: 3 },
  { id: 'feel-more',     label: 'More',     emoji: '🙌', category: 'feelings', sort_order: 4 },
  { id: 'feel-help',     label: 'Help',     emoji: '🤝', category: 'feelings', sort_order: 5 },
  { id: 'feel-wait',     label: 'Wait',     emoji: '✋', category: 'feelings', sort_order: 6 },
  { id: 'feel-stop',     label: 'Stop',     emoji: '🛑', category: 'feelings', sort_order: 7 },
  { id: 'feel-tired',    label: 'Tired',    emoji: '😴', category: 'feelings', sort_order: 8 },
  { id: 'feel-mad',      label: 'Mad',      emoji: '😠', category: 'feelings', sort_order: 9 },
  { id: 'feel-scared',   label: 'Scared',   emoji: '😨', category: 'feelings', sort_order: 10 },
  { id: 'feel-hurt',     label: 'Hurt',     emoji: '🤕', category: 'feelings', sort_order: 11 },
  { id: 'feel-hungry',   label: 'Hungry',   emoji: '🍽️', category: 'feelings', sort_order: 12 },
  { id: 'feel-iwant',    label: 'I Want',   emoji: '🫳', category: 'feelings', sort_order: 13 },

  // People (8)
  { id: 'ppl-mom',       label: 'Mom',      emoji: '👩',  category: 'people', sort_order: 0 },
  { id: 'ppl-dad',       label: 'Dad',      emoji: '👨',  category: 'people', sort_order: 1 },
  { id: 'ppl-glammy',    label: 'Glammy',   emoji: '👵',  category: 'people', sort_order: 2 },
  { id: 'ppl-willow',    label: 'Willow',   emoji: '🐕',  category: 'people', sort_order: 3 },
  { id: 'ppl-frida',     label: 'Frida',    emoji: '🐶',  category: 'people', sort_order: 4 },
  { id: 'ppl-heather',   label: 'Heather',  emoji: '👩‍🦰', category: 'people', sort_order: 5 },
  { id: 'ppl-cassie',    label: 'Cassie',   emoji: '👩‍🦱', category: 'people', sort_order: 6 },
  { id: 'ppl-angelique', label: 'Angelique',emoji: '👩‍💼', category: 'people', sort_order: 7 },
]

export const DEFAULT_ROUTINES = [
  { id: 'rtn-potty',    label: 'Potty Time',    emoji: '🚽', sort_order: 0, intro_text: "Let's use the potty!" },
  { id: 'rtn-hands',    label: 'Wash Hands',    emoji: '🧼', sort_order: 1, intro_text: 'Time to wash our hands!' },
  { id: 'rtn-diaper',   label: 'Diaper Change', emoji: '👶', sort_order: 2, intro_text: "Time for a clean diaper!" },
  { id: 'rtn-bath',     label: 'Bath Time',     emoji: '🛁', sort_order: 3, intro_text: "Bath time!" },
  { id: 'rtn-shoes',    label: 'Shoes On',      emoji: '👟', sort_order: 4, intro_text: "Let's put our shoes on!" },
  { id: 'rtn-dressed',  label: 'Get Dressed',   emoji: '👕', sort_order: 5, intro_text: "Time to get dressed!" },
  { id: 'rtn-cleanup',  label: 'Clean Up',      emoji: '🧹', sort_order: 6, intro_text: "Let's clean up!" },
  { id: 'rtn-nap',      label: 'Nap Time',      emoji: '😴', sort_order: 7, intro_text: "Time for a nap." },
  { id: 'rtn-bed',      label: 'Bedtime',       emoji: '🌙', sort_order: 8, intro_text: "Time for bed!" },
]

export const DEFAULT_ROUTINE_STEPS = {
  'rtn-potty': [
    { emoji: '🚶', label: 'Walk to bathroom',    sort_order: 0 },
    { emoji: '👇', label: 'Pull down pullup',     sort_order: 1 },
    { emoji: '🚽', label: 'Sit on toilet',        sort_order: 2, timer_secs: 300 },
    { emoji: '🧻', label: 'Wipe and flush',       sort_order: 3 },
    { emoji: '👆', label: 'Pull up pullup',       sort_order: 4 },
    { emoji: '🧼', label: 'Wash hands',           sort_order: 5 },
  ],
  'rtn-hands': [
    { emoji: '🚿', label: 'Turn on water',        sort_order: 0 },
    { emoji: '💧', label: 'Wet hands',            sort_order: 1 },
    { emoji: '🧴', label: 'Add soap',             sort_order: 2 },
    { emoji: '🤲', label: 'Scrub',                sort_order: 3, timer_secs: 20 },
    { emoji: '💦', label: 'Rinse',                sort_order: 4 },
    { emoji: '🏳️', label: 'Dry',                 sort_order: 5 },
  ],
  'rtn-diaper': [
    { emoji: '🛏️', label: 'Lie down',            sort_order: 0 },
    { emoji: '👇', label: 'Pullup off',            sort_order: 1 },
    { emoji: '🧻', label: 'Clean up',             sort_order: 2 },
    { emoji: '✨', label: 'New pullup on',        sort_order: 3 },
    { emoji: '🧼', label: 'Wash hands',           sort_order: 4 },
  ],
  'rtn-bath': [
    { emoji: '👕', label: 'Take off clothes',     sort_order: 0 },
    { emoji: '🛁', label: 'Get in tub',           sort_order: 1 },
    { emoji: '💆', label: 'Wash hair',            sort_order: 2 },
    { emoji: '🧼', label: 'Wash body',            sort_order: 3 },
    { emoji: '💦', label: 'Rinse',               sort_order: 4 },
    { emoji: '🏳️', label: 'Dry',                sort_order: 5 },
    { emoji: '👕', label: 'Get dressed',          sort_order: 6 },
  ],
  'rtn-shoes': [
    { emoji: '🪑', label: 'Sit down',            sort_order: 0 },
    { emoji: '👟', label: 'First shoe',           sort_order: 1 },
    { emoji: '🦶', label: 'Foot in',             sort_order: 2 },
    { emoji: '👟', label: 'Second shoe',          sort_order: 3 },
    { emoji: '🦶', label: 'Other foot',           sort_order: 4 },
    { emoji: '🧍', label: 'Stand up',            sort_order: 5 },
  ],
  'rtn-dressed': [
    { emoji: '🩲', label: 'Underwear',           sort_order: 0 },
    { emoji: '👕', label: 'Shirt',               sort_order: 1 },
    { emoji: '👖', label: 'Pants',               sort_order: 2 },
    { emoji: '🧦', label: 'Socks',               sort_order: 3 },
    { emoji: '👟', label: 'Shoes',               sort_order: 4 },
  ],
  'rtn-cleanup': [
    { emoji: '👀', label: 'Look at mess',        sort_order: 0 },
    { emoji: '🧸', label: 'Pick up toys',        sort_order: 1 },
    { emoji: '📚', label: 'Stack books',         sort_order: 2 },
    { emoji: '✅', label: 'All done!',           sort_order: 3 },
  ],
  'rtn-nap': [
    { emoji: '🚽', label: 'Try potty',           sort_order: 0 },
    { emoji: '🛏️', label: 'Lie down',            sort_order: 1 },
    { emoji: '🧸', label: 'Grab comfort item',   sort_order: 2 },
    { emoji: '😴', label: 'Close eyes',          sort_order: 3 },
  ],
  'rtn-bed': [
    { emoji: '🚽', label: 'Use potty',           sort_order: 0 },
    { emoji: '🪥', label: 'Brush teeth',         sort_order: 1, timer_secs: 60 },
    { emoji: '🌙', label: 'Pajamas',             sort_order: 2 },
    { emoji: '📖', label: 'Story time',          sort_order: 3 },
    { emoji: '💡', label: 'Lights out',          sort_order: 4 },
  ],
}

export const DEFAULT_PRESETS = [
  { id: 'preset-aba',    label: 'ABA Class',       icon: '🏫', sort_order: 0 },
  { id: 'preset-home',   label: 'Home',             icon: '🏠', sort_order: 1 },
  { id: 'preset-glammy', label: "Glammy's House",   icon: '👵', sort_order: 2 },
  { id: 'preset-out',    label: 'Out and About',    icon: '🌎', sort_order: 3 },
]

export const DEFAULT_PRESET_CARDS = {
  'preset-aba':    ['feel-more','feel-alldone','feel-help','feel-wait','feel-no','feel-yes','feel-iwant','food-water','act-tractor','act-hotwheels','ppl-heather','ppl-cassie'],
  'preset-home':   ['act-tractor','food-nuggets','food-water','act-trampoline','act-hotwheels','act-blippi','feel-more','feel-alldone','ppl-mom','ppl-dad','food-fries','act-guitar'],
  'preset-glammy': ['ppl-glammy','act-garden','food-nuggets','food-banana','act-tractor','feel-happy','feel-more','feel-alldone','food-water','act-youtube','ppl-mom','ppl-dad'],
  'preset-out':    ['feel-help','feel-wait','feel-no','food-water','food-nuggets','feel-alldone','act-carride','act-park','feel-hungry','feel-tired','ppl-mom','ppl-dad'],
}
