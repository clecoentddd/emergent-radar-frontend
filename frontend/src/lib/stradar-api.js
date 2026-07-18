// Stradar API client — talks to backend at configurable baseUrl (default localhost:3000)
// and Supabase for auth. Config lives in localStorage.

const LS_BASE = "stradar.baseUrl";
const LS_SUPA_URL = "stradar.supabaseUrl";
const LS_SUPA_KEY = "stradar.supabaseKey";
const LS_TOKEN = "stradar.token";
const LS_EMAIL = "stradar.email";
const LS_ORG = "stradar.orgId";

export const defaults = {
  baseUrl: "http://localhost:3000",
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseKey: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
};

export function getConfig() {
  if (typeof window === "undefined") return { ...defaults, token: "", email: "" };
  return {
    baseUrl: localStorage.getItem(LS_BASE) || defaults.baseUrl,
    supabaseUrl: localStorage.getItem(LS_SUPA_URL) || defaults.supabaseUrl,
    supabaseKey: localStorage.getItem(LS_SUPA_KEY) || defaults.supabaseKey,
    token: localStorage.getItem(LS_TOKEN) || "",
    email: localStorage.getItem(LS_EMAIL) || "",
  };
}

export function setConfig(partial) {
  if (typeof window === "undefined") return;
  const map = {
    baseUrl: LS_BASE,
    supabaseUrl: LS_SUPA_URL,
    supabaseKey: LS_SUPA_KEY,
    token: LS_TOKEN,
    email: LS_EMAIL,
  };
  Object.entries(partial).forEach(([k, v]) => {
    if (v === undefined) return;
    const key = map[k];
    if (key) localStorage.setItem(key, v);
  });
}

export function clearAllAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_EMAIL);
    localStorage.removeItem(LS_ORG);
  } catch (e) {
    console.error("[stradar-api] clearAllAuth failed", e);
  }
}

export function getSavedOrgId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_ORG) || "";
}

export function setSavedOrgId(id) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(LS_ORG, id);
  else localStorage.removeItem(LS_ORG);
}

export function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function request(method, endpoint, body, correlationId) {
  const cfg = getConfig();
  const url = `${cfg.baseUrl}${endpoint}`;
  const headers = { "Content-Type": "application/json" };
  if (cfg.token) headers["Authorization"] = `Bearer ${cfg.token}`;
  if (correlationId) headers["correlation_id"] = correlationId;

  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    const dt = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0);
    // eslint-disable-next-line no-console
    console.log(`[stradar-api] ${response.status} ${method} ${url} (${dt}ms)`);
    return { status: response.status, ok: response.ok, body: parsed };
  } catch (error) {
    console.error(`[stradar-api] ✗ ${method} ${url}`, error);
    return { status: 0, ok: false, body: null, error: error?.message ?? String(error) };
  }
}

export async function authenticate(email, password) {
  const cfg = getConfig();
  const url = `${cfg.supabaseUrl}/auth/v1/token?grant_type=password`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { apikey: cfg.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, status: response.status, body: data, error: data.error_description || data.error || "Authentication failed" };
    }
    setConfig({ token: data.access_token, email });
    return { ok: true, status: 200, body: data, accessToken: data.access_token };
  } catch (error) {
    return { ok: false, status: 0, body: null, error: error?.message ?? String(error) };
  }
}

export const api = {
  organizations: {
    list: () => request("GET", "/api/query/organizations"),
    create: (organizationName, role = "admin") =>
      request("POST", "/api/organizations", { organizationName, role }),
    update: (organizationId, organizationName) =>
      request("PUT", `/api/organizations/${encodeURIComponent(organizationId)}`, { organizationName }, organizationId),
  },
  teams: {
    list: (organizationId) =>
      request("GET", `/api/query/teams?organizationId=${encodeURIComponent(organizationId)}`),
    create: (organizationId, data) =>
      request("POST", `/api/organizations/${encodeURIComponent(organizationId)}/teams`, data),
    update: (organizationId, teamId, data) =>
      request("PUT", `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}`, data, teamId),
  },
  strategies: {
    list: (organizationId, teamId) =>
      request("GET", `/api/query/strategies?organizationId=${encodeURIComponent(organizationId)}&teamId=${encodeURIComponent(teamId)}`),
    create: (organizationId, teamId, data) =>
      request("POST", `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/strategies`, data),
  },
  environmentalChanges: {
    list: (organizationId, teamId) =>
      request("GET", `/api/query/environmental-changes?organizationId=${encodeURIComponent(organizationId)}&teamId=${encodeURIComponent(teamId)}`),
    create: (organizationId, teamId, data) =>
      request("POST", `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/environmental-changes`, data),
    update: (organizationId, teamId, envChangeId, updates) =>
      request("PUT", `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/environmental-changes/${encodeURIComponent(envChangeId)}`, updates),
  },
  initiatives: {
    list: (strategyId) =>
      request("GET", `/api/query/initiatives?strategyId=${encodeURIComponent(strategyId)}`),
    create: (organizationId, teamId, strategyId, initiativeName) =>
      request("POST",
        `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/strategies/${encodeURIComponent(strategyId)}/initiatives`,
        { initiativeName },
        generateId(),
      ),
  },
  initiativeItems: {
    list: (initiativeId) =>
      request("GET", `/api/query/initiative-items?initiativeId=${encodeURIComponent(initiativeId)}`),
    create: (organizationId, teamId, strategyId, initiativeId, step, content) =>
      request("POST",
        `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/strategies/${encodeURIComponent(strategyId)}/initiatives/${encodeURIComponent(initiativeId)}/items`,
        { step, content },
        generateId(),
      ),
    update: (organizationId, teamId, strategyId, initiativeId, itemId, step, content) =>
      request("PUT",
        `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/strategies/${encodeURIComponent(strategyId)}/initiatives/${encodeURIComponent(initiativeId)}/items/${encodeURIComponent(itemId)}`,
        { step, content },
        itemId,
      ),
    remove: (organizationId, teamId, strategyId, initiativeId, itemId) =>
      request("DELETE",
        `/api/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/strategies/${encodeURIComponent(strategyId)}/initiatives/${encodeURIComponent(initiativeId)}/items/${encodeURIComponent(itemId)}`,
        undefined,
        itemId,
      ),
  },
};

export const VALID_INITIATIVE_ITEM_STEPS = [
  "DIAGNOSTIC",
  "OVERALL APPROACH",
  "COHERENT SET OF ACTIONS",
  "PROXIMATE OBJECTIVES",
];
