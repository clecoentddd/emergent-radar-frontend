import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearAllAuth, getConfig, setSavedOrgId } from "../lib/stradar-api";
import { AppHeader } from "../components/AppHeader";
import { Modal, TextField, SelectField, ActionRow, Toast } from "../components/ui-kit";
import { Building2, Plus, Pencil, ArrowRight } from "lucide-react";

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.organizations.list();
    setLoading(false);
    if (r.ok && Array.isArray(r.body)) setOrgs(r.body);
    else if (r.status === 401) { clearAllAuth(); navigate("/login"); }
  }, [navigate]);

  useEffect(() => {
    if (!getConfig().token) { navigate("/login"); return; }
    load();
  }, [load, navigate]);

  function selectOrg(o) {
    setSavedOrgId(o.organizationId);
    navigate(`/workspace/${encodeURIComponent(o.organizationId)}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-14 fade-up" data-testid="organizations-page">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Step 1</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Select your organization</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Pick an organization to enter its workspace and see its teams as a company organigram, or spin up a new one.
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition btn-glow"
            data-testid="new-org-btn"
          >
            <Plus size={14} /> New organization
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-2">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading organizations…</div>
          ) : orgs.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 className="mx-auto mb-3 text-muted-foreground" size={36} />
              <div className="text-sm text-muted-foreground">No organizations yet. Create your first one to get started.</div>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {orgs.map((o) => (
                <li key={o.organizationId} className="group flex items-center gap-2 p-2" data-testid={`org-row-${o.organizationId}`}>
                  <button
                    onClick={() => selectOrg(o)}
                    className="flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-accent/50"
                    data-testid={`select-org-${o.organizationId}`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                      <Building2 size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium tracking-tight">{o.organizationName}</div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Enter workspace</div>
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-primary transition" size={18} />
                  </button>
                  <button
                    onClick={() => setEditing(o)}
                    className="rounded-md border border-border px-3 py-1.5 text-[11px] hover:bg-accent transition"
                    title="Rename"
                    data-testid={`edit-org-${o.organizationId}`}
                  >
                    <Pencil size={12} className="inline mr-1" /> Rename
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {showNew && (
        <NewOrgModal
          onClose={() => setShowNew(false)}
          onCreated={async () => { await load(); showToast("Organization created"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}
      {editing && (
        <EditOrgModal
          org={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { await load(); showToast("Organization updated"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}

function NewOrgModal({ onClose, onCreated, onError }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.organizations.create(name, role);
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to create organization");
    onCreated();
    onClose();
  }
  return (
    <Modal title="New organization" onClose={onClose} testId="new-org-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Acme Corp" testId="new-org-name-input" />
        <SelectField label="Role" value={role} options={["admin", "user", "viewer"]} onChange={setRole} testId="new-org-role-select" />
        <ActionRow onCancel={onClose} submitLabel="Create" loading={loading} testIdPrefix="new-org" />
      </form>
    </Modal>
  );
}

function EditOrgModal({ org, onClose, onSaved, onError }) {
  const [name, setName] = useState(org.organizationName);
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const r = await api.organizations.update(org.organizationId, name.trim());
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to update organization");
    onSaved();
    onClose();
  }
  return (
    <Modal title="Rename organization" onClose={onClose} testId="edit-org-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Name" value={name} onChange={setName} placeholder="Organization name" testId="edit-org-name-input" />
        <ActionRow onCancel={onClose} submitLabel="Save" loading={loading} testIdPrefix="edit-org" />
      </form>
    </Modal>
  );
}
