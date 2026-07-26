import { useEffect, useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { authApi } from "../api/endpoints";
import { PageHeader, Button, Card, Badge, Input, Select, Modal, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const ROLE_TONE = { owner: "brand", admin: "good", manager: "warn", staff: "neutral" };

const emptyForm = { username: "", email: "", first_name: "", last_name: "", role: "staff", password: "" };

export default function SettingsPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canManageTeam = user?.role === "owner" || user?.role === "admin";

  const load = () => {
    setLoading(true);
    authApi.team().then((res) => setTeam(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authApi.inviteTeamMember(form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(
        Object.values(err.response?.data || {})?.[0]?.[0] || "Couldn't add this team member."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id) => {
    if (!confirm("Remove this team member's access?")) return;
    await authApi.removeTeamMember(id);
    load();
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your business profile and team." />

      <Card className="p-6 mb-6">
        <h3 className="font-display font-semibold text-ink-900 mb-4">Business</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-500 mb-1">Business name</p>
            <p className="text-ink-900 font-medium">{user?.business_name}</p>
          </div>
          <div>
            <p className="text-ink-500 mb-1">Your role</p>
            <Badge tone={ROLE_TONE[user?.role]}>{user?.role}</Badge>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <div>
            <h3 className="font-display font-semibold text-ink-900">Team</h3>
            <p className="text-sm text-ink-500">Everyone with access to this workspace.</p>
          </div>
          {canManageTeam && (
            <Button size="sm" onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }}>
              <Plus className="w-4 h-4" /> Add member
            </Button>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="divide-y divide-ink-100">
            {team.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-sm font-medium">
                    {(m.first_name?.[0] || m.username[0]).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {m.first_name ? `${m.first_name} ${m.last_name || ""}`.trim() : m.username}
                    </p>
                    <p className="text-xs text-ink-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={ROLE_TONE[m.role]}>{m.role}</Badge>
                  {canManageTeam && m.role !== "owner" && m.id !== user.id && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="w-8 h-8 rounded-lg hover:bg-bad-100 text-ink-500 hover:text-bad-600 flex items-center justify-center"
                      aria-label="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add team member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.first_name} onChange={update("first_name")} />
            <Input label="Last name" value={form.last_name} onChange={update("last_name")} />
          </div>
          <Input label="Username" required value={form.username} onChange={update("username")} />
          <Input label="Email" type="email" value={form.email} onChange={update("email")} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" value={form.role} onChange={update("role")}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
            <Input label="Temporary password" type="password" required minLength={8} value={form.password} onChange={update("password")} />
          </div>
          {error && <p className="text-sm text-bad-600 bg-bad-100 rounded-xl px-3.5 py-2.5">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add member"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
