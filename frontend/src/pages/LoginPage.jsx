import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate, defaults, getConfig, setConfig } from "../lib/stradar-api";
import { RadarLogo } from "../components/RadarLogo";
import { Field } from "../components/ui-kit";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("clc@stradar.com");
  const [password, setPassword] = useState("12345");
  const [baseUrl, setBaseUrl] = useState(defaults.baseUrl);
  const [supabaseUrl, setSupabaseUrl] = useState(defaults.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(defaults.supabaseKey);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const c = getConfig();
    setBaseUrl(c.baseUrl);
    setSupabaseUrl(c.supabaseUrl);
    setSupabaseKey(c.supabaseKey);
    if (c.email) setEmail(c.email);
    if (c.token) navigate("/organizations", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setConfig({ baseUrl, supabaseUrl, supabaseKey });
    const result = await authenticate(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Authentication failed");
      return;
    }
    navigate("/organizations", { replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 noise-overlay">
      {/* Decorative radar backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center opacity-[0.06]">
        <RadarLogo size={720} />
      </div>

      <div className="w-full max-w-md fade-up" data-testid="login-page">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 ring-1 ring-primary/40 flex items-center justify-center">
            <RadarLogo size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Stradar</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Environmental change radar</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 shadow-2xl"
          data-testid="login-form"
        >
          <h2 className="mb-1 text-lg font-medium">Sign in</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Connect to your Stradar workspace to explore the radar.
          </p>

          <div className="space-y-3">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
                data-testid="login-email-input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
                data-testid="login-password-input"
              />
            </Field>

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground transition"
              data-testid="toggle-advanced-btn"
            >
              {showAdvanced ? "− Hide" : "+ Show"} backend settings
            </button>

            {showAdvanced && (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-3 fade-up">
                <Field label="Backend base URL">
                  <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
                    data-testid="login-baseurl-input" />
                </Field>
                <Field label="Supabase URL">
                  <input value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary" />
                </Field>
                <Field label="Supabase publishable key">
                  <input value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-[11px] outline-none focus:border-primary" />
                </Field>
              </div>
            )}
          </div>

          {error && (
            <div
              className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 disabled:opacity-50 transition btn-glow"
            data-testid="login-submit-btn"
          >
            {loading ? "Signing in…" : "Enter workspace"}
          </button>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            The backend runs on your machine — configure the base URL above.
          </p>
        </form>
      </div>
    </div>
  );
}
