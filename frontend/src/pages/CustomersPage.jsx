import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Users, Mail, Phone } from "lucide-react";
import { customersApi } from "../api/endpoints";
import {
  PageHeader, Button, Card, Badge, Input, Select, TextArea, Modal, EmptyState, Spinner,
} from "../components/ui";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_TONE = { lead: "brand", active: "good", inactive: "neutral" };

const emptyForm = {
  name: "", company: "", email: "", phone: "", address: "", status: "lead",
  source: "", estimated_value: 0, tags: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    customersApi
      .list({ search: search || undefined, status: statusFilter || undefined })
      .then((res) => setCustomers(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name, company: customer.company, email: customer.email,
      phone: customer.phone, address: customer.address, status: customer.status,
      source: customer.source || "", estimated_value: customer.estimated_value, tags: customer.tags,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await customersApi.update(editing.id, form);
      } else {
        await customersApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save this customer. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Every lead and customer relationship, in one place."
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add customer
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email…"
            className="w-full rounded-xl border border-ink-300 bg-white pl-10 pr-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48">
          <option value="">All statuses</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first lead or customer to start building your pipeline."
            action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add customer</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Orders</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Total spent</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Added</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openEdit(c)}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-100/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-900">{c.name}</p>
                      {c.company && <p className="text-xs text-ink-500">{c.company}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-ink-500">
                      <div className="flex items-center gap-1.5">
                        {c.email && <Mail className="w-3.5 h-3.5" />} {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell font-mono text-ink-700">
                      {c.order_count ?? 0}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell font-mono text-ink-700">
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-ink-500">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit customer" : "Add customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={update("name")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" value={form.company} onChange={update("company")} />
            <Select label="Status" value={form.status} onChange={update("status")}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={update("email")} />
            <Input label="Phone" value={form.phone} onChange={update("phone")} />
          </div>
          <Input label="Address" value={form.address} onChange={update("address")} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Source" value={form.source} onChange={update("source")}>
              <option value="">—</option>
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="social">Social media</option>
              <option value="cold_outreach">Cold outreach</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </Select>
            <Input
              label="Estimated value"
              type="number"
              step="0.01"
              value={form.estimated_value}
              onChange={update("estimated_value")}
            />
          </div>
          <Input label="Tags" placeholder="vip, wholesale, repeat" value={form.tags} onChange={update("tags")} />

          {error && <p className="text-sm text-bad-600 bg-bad-100 rounded-xl px-3.5 py-2.5">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add customer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
