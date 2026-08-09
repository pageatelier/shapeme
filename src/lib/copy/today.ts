/**
 * All user-facing copy for the Today page and its subcomponents, centralized
 * (rather than inline in JSX) so a future i18n pass extracts these into
 * message catalogs instead of re-translating every component from scratch.
 */
export const todayCopy = {
  journey: {
    label: "JOURNEY",
    dayLabel: "DAY",
    weekLabel: "WEEK",
    complete: "COMPLETE",
  },
  focus: {
    label: "TODAY'S FOCUS",
    restTitle: "Rest Day",
    restSubtitle: "Nothing scheduled — enjoy the break.",
    exerciseCount: (n: number) => `${n} exercise${n === 1 ? "" : "s"}`,
    minutes: (n: number) => `${n} min`,
  },
  stats: {
    move: "MOVE",
    moveRest: "Rest",
    nourish: "NOURISH",
    water: "WATER",
  },
  nourish: {
    title: "Today's Nourish",
    seeAll: "See all",
    saving: "Saving",
    uploadError: "Upload failed.",
  },
  waterCard: {
    title: "Drink water",
    remove: (cupMl: number) => `− ${cupMl}ml`,
    add: (cupMl: number) => `+ ${cupMl}ml`,
    saving: "Saving...",
    deleting: "Removing...",
    saveError: "Couldn't save that.",
    deleteError: "Couldn't remove that.",
  },
  waterGoalEditor: {
    title: "Today's Water",
    edit: "edit",
    dailyGoal: "Daily goal",
    cupSize: "Cup size",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    saveError: "Couldn't save that.",
  },
  moment: {
    title: "A Moment For You",
    placeholder: "How did your body feel today?",
    saved: "Saved",
    unsaved: "Not saved",
    saving: "Saving...",
    save: "Save",
    saveError: "Couldn't save that.",
  },
  checklist: {
    move: { key: "move", doneLabel: "Workout in progress", todoLabel: "Continue your workout" },
    meal: { key: "meal", doneLabel: "Meal logged", todoLabel: "Log your meal" },
    waterDone: "Water goal complete",
    waterTodo: (cups: number) => `Drink ${cups} more cup${cups === 1 ? "" : "s"}`,
  },
  routine: {
    title: "Today's Routine",
  },
  movement: {
    title: "Today's Movement",
    strengthSets: (done: number, total: number) => `Strength · ${done}/${total} sets`,
  },
  aiRoutine: {
    titlePrefix: "Today's AI Routine",
    restTitle: "Today's AI Routine",
    restBody: "Today's a rest day — take it easy. 🌿",
    estimated: (min: number) => `~${min} min`,
    warmup: "Warm-up",
    workout: "Workout",
    cardio: "Cardio",
    cooldown: "Cool-down",
  },
} as const;
