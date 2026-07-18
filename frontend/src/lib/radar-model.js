// Domain model + mappers for the radar. Ported unchanged.

export const QUADRANTS = ["BUSINESS", "CAPABILITIES", "PEOPLE & KNOWLEDGE", "OPERATING MODEL"];
export const STATES = ["DETECTED", "ASSESSING", "ASSESSED", "RESPONDING", "ANTICIPATING", "RESPONDED"];
export const IMPACTS = ["HIGH", "MEDIUM", "LOW"];
export const EFFORTS = ["HIGH", "MEDIUM", "LOW"];
export const NATURES = ["THREAT", "OPPORTUNITY"];

export const stateRatio = {
  DETECTED: 1,
  ASSESSING: 0.75,
  ASSESSED: 0.5,
  RESPONDING: 0.25,
  ANTICIPATING: 0,
  RESPONDED: 0,
};

export const impactColor = {
  HIGH: "var(--impact-high)",
  MEDIUM: "var(--impact-medium)",
  LOW: "var(--impact-low)",
};

export const effortRadius = {
  LOW: 6,
  MEDIUM: 9,
  HIGH: 13,
};

export function toQuadrant(value) {
  const v = (value || "").toString().toUpperCase();
  if (v.startsWith("CAPAB")) return "CAPABILITIES";
  if (v.startsWith("OPER")) return "OPERATING MODEL";
  if (v.startsWith("PEOP") || v.includes("KNOWLEDGE")) return "PEOPLE & KNOWLEDGE";
  if (v.startsWith("BUSI")) return "BUSINESS";
  return "BUSINESS";
}

export function toState(c) {
  const raw = (c.lifecycle || c.state || "").toString().toUpperCase();
  if (raw === "RESPONDED") return "RESPONDED";
  if (raw === "ANTICIPATING") return "ANTICIPATING";
  if (raw === "RESPONDING") return "RESPONDING";
  if (raw === "ASSESSED") return "ASSESSED";
  if (raw === "ASSESSING") return "ASSESSING";
  if (raw === "DETECTED") return "DETECTED";
  return "DETECTED";
}

export function toImpact(value) {
  const v = (value || "").toString().toUpperCase();
  if (v.startsWith("H")) return "HIGH";
  if (v.startsWith("L")) return "LOW";
  return "MEDIUM";
}

export function toEffort(value) {
  const v = (value || "").toString().toUpperCase();
  if (v.startsWith("H")) return "HIGH";
  if (v.startsWith("L")) return "LOW";
  return "MEDIUM";
}

export function toNature(value) {
  const v = (value || "").toString().toUpperCase();
  if (v.startsWith("O")) return "OPPORTUNITY";
  return "THREAT";
}

export const quadrantColor = {
  "BUSINESS": "var(--q-business)",
  "CAPABILITIES": "var(--q-capabilities)",
  "PEOPLE & KNOWLEDGE": "var(--q-people)",
  "OPERATING MODEL": "var(--q-knowledge)",
};

export const quadrantAngles = {
  "CAPABILITIES": [0, 90],
  "BUSINESS": [90, 180],
  "OPERATING MODEL": [180, 270],
  "PEOPLE & KNOWLEDGE": [270, 360],
};

export const CATEGORY_LABELS = [
  "BUSINESS",
  "CAPABILITIES",
  "PEOPLE & KNOWLEDGE",
  "OPERATING MODEL",
];
