import { FilePen, Play, CheckCircle2, Archive, Trash2 } from "lucide-react";

export const STRATEGY_STATES = ["DRAFT", "ACTIVE", "COMPLETE", "OBSOLETE", "DELETED"];

export const strategyStateMeta = {
  DRAFT:    { label: "Draft",    icon: FilePen,       hint: "Work in progress" },
  ACTIVE:   { label: "Active",   icon: Play,          hint: "Being executed" },
  COMPLETE: { label: "Complete", icon: CheckCircle2,  hint: "Finished" },
  OBSOLETE: { label: "Obsolete", icon: Archive,       hint: "No longer relevant" },
  DELETED:  { label: "Deleted",  icon: Trash2,        hint: "Removed from list" },
};

export function toStrategyState(v) {
  const s = (v || "").toString().toUpperCase();
  return STRATEGY_STATES.includes(s) ? s : "DRAFT";
}
