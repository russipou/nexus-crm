import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Select, Card } from "../components/ui";

const INDUSTRIES = [
  ["general", "General"],
  ["retail", "Retail"],
  ["catering", "Catering & Food Service"],
  ["services", "Professional Services"],
  ["wholesale", "Wholesale / Distribution"],
  ["manufacturing", "Manufacturing"],
  ["other", "Other"],
];

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    username: "", password: "", business_name: "", industry: "general", email: "", first_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await signup(form);
      }
      navigate("/");
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Something went wrong. Please check your details and try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-white" />
          </div>
          <span className="font-display font-semibold text-white text-2xl tracking-tight">Nexus</span>
        </div>

        <Card className="p-7 sm:p-8">
          <h1 className="font-display font-semibold text-xl text-ink-900 mb-1">
            {mode === "login" ? "Welcome back" : "Set up your business"}
          </h1>
          <p className="text-sm text-ink-500 mb-6">
            {mode === "login"
              ? "Log in to your CRM workspace."
              : "One account, and your team is ready to go."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Input
                  label="Business name"
                  required
                  value={form.business_name}
                  onChange={update("business_name")}
                  placeholder="Green Leaf Catering Co."
                />
                <Select label="Industry" value={form.industry} onChange={update("industry")}>
                  {INDUSTRIES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Your name"
                  value={form.first_name}
                  onChange={update("first_name")}
                  placeholder="Alex"
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="alex@yourbusiness.com"
                />
              </>
            )}
            <Input
              label="Username"
              required
              value={form.username}
              onChange={update("username")}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="text-sm text-bad-600 bg-bad-100 rounded-xl px-3.5 py-2.5">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create business account"}
            </Button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="w-full text-center text-sm text-ink-500 hover:text-ink-900 mt-5"
          >
            {mode === "login" ? "New business? Sign up" : "Already have an account? Log in"}
          </button>
        </Card>

        <p className="text-center text-xs text-ink-500 mt-6">
          Demo login — username <span className="font-mono text-ink-300">demo</span>, password{" "}
          <span className="font-mono text-ink-300">demo12345</span>
        </p>
      </div>
    </div>
  );
}
