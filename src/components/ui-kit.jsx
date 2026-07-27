import { X } from "lucide-react";

export function Modal({ title, onClose, children, wide, testId = "modal" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm fade-up"
      onClick={onClose}
      data-testid={`${testId}-backdrop`}
    >
      <div
        className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"} rounded-2xl border border-border bg-card p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        data-testid={testId}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
            data-testid={`${testId}-close`}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, testId, multiline, rows = 3 }) {
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
          data-testid={testId}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
          data-testid={testId}
        />
      )}
    </Field>
  );
}

export function SelectField({ label, value, options, onChange, testId }) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
        data-testid={testId}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

export function ActionRow({ onCancel, submitLabel, loading, testIdPrefix = "form" }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition"
        data-testid={`${testIdPrefix}-cancel-btn`}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 disabled:opacity-50 transition btn-glow"
        data-testid={`${testIdPrefix}-submit-btn`}
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] rounded-lg border px-4 py-2.5 text-sm shadow-2xl fade-up ${
        toast.kind === "ok"
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-destructive/50 bg-destructive/15 text-foreground"
      }`}
      data-testid="toast"
    >
      {toast.msg}
    </div>
  );
}

export function useToast() {
  // Simple hook-like helper (return [toast, showToast])
  // Using a lightweight closure pattern via React state in caller.
}
