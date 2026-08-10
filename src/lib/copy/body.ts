/**
 * All user-facing copy for the Body page and its subcomponents, centralized
 * per the same convention as src/lib/copy/today.ts (future i18n extraction
 * point, not itself an i18n system).
 */
export const bodyCopy = {
  header: {
    title: "BODY",
    subtitle: "Track your shape. See your growth.",
    privacyNote: "Your body photos are private — only you can see them.",
  },
  tabs: {
    thisWeek: "This Week",
    compare: "Compare",
  },
  thisWeek: {
    shapeLabel: "THIS WEEK'S SHAPE",
    week: (current: number, total: number) => `WEEK ${String(current).padStart(2, "0")} / ${total}`,
  },
  capture: {
    title: "Take your Shape Shot",
    subtitle: "Keep the framing similar each week.",
    cta: "TAKE PHOTO",
    backfilling: "Adding a past entry",
    backToToday: "Back to today",
    addAngle: "Add another angle",
    collapseAngle: "Hide other angles",
  },
  slot: {
    change: "Change photo",
    choose: "Choose photo",
    delete: "Delete",
    confirmDelete: "Delete this photo?",
    deleting: "Deleting...",
    cancel: "Cancel",
    saving: "Saving...",
    uploadError: "Upload failed.",
    deleteError: "Delete failed.",
    compareTitle: "Match your last shot",
    compareHint: "The faint overlay is your last photo in this slot — line up before saving.",
    retake: "Retake",
    usePhoto: "Use this photo",
  },
  pastShapes: {
    title: "PAST SHAPES",
    empty: "No shape shots yet — take your first one above.",
    week: (n: number) => `WEEK ${String(n).padStart(2, "0")}`,
    loadMore: "Show more",
  },
  compare: {
    title: "Compare",
    needMore: "You need at least 2 entries to compare.",
    front: "Front",
    side: "Side",
    back: "Back",
    noEntry: "No entry",
  },
  feedViewer: {
    close: "Close",
    delete: "Delete",
    confirmDelete: "Delete this photo?",
    deleting: "Deleting...",
    cancel: "Cancel",
    deleteError: "Delete failed.",
  },
  camera: {
    hint: "Line up with the faint overlay of your last shot.",
    guideHint: "Line up with the pose guide.",
    permissionError: "Couldn't access your camera. You can still choose a photo from your library.",
    unsupported: "Live camera isn't available here — choose a photo instead.",
    gallery: "Choose from library",
    flip: "Flip camera",
    close: "Close",
    starting: "Starting camera...",
    showGuide: "Show guide",
    hideGuide: "Hide guide",
  },
  loading: "Loading...",
} as const;
