import { useEffect, useState } from "react";
import {
  Users, DollarSign, ShoppingCart, PackageX, TrendingUp, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { dashboardApi } from "../api/endpoints";
import { Card, PageHeader, Badge, Spinner, EmptyState } from "../components/ui";
import StatCard from "../components/StatCard";
import StockPulse from "../components/StockPulse";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .summary()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return <EmptyState title="Couldn't load dashboard" description="Try refreshing the page." />;
  }

  const { stats, revenue_trend, low_stock, upcoming_tasks, pipeline, top_products, category_health } = data;
  const firstName = user?.first_name || user?.username;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's how things are looking across the business today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total customers"
          value={stats.total_customers}
          sub={`+${stats.new_customers_this_month} this month`}
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(stats.revenue_this_month)}
          sub={`${formatCurrency(stats.total_revenue)} all-time`}
          icon={DollarSign}
          tone="good"
        />
        <StatCard
          label="Orders this month"
          value={stats.orders_this_month}
          sub={`${stats.paid_orders_count} paid orders total`}
          icon={ShoppingCart}
          tone="brand"
        />
        <StatCard
          label="Low stock alerts"
          value={stats.low_stock_count}
          sub={`${stats.active_products} active products`}
          icon={PackageX}
          tone={stats.low_stock_count > 0 ? "warn" : "good"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-ink-900">Revenue trend</h3>
              <p className="text-sm text-ink-500">Last six months, paid & fulfilled orders</p>
            </div>
            <TrendingUp className="w-5 h-5 text-good-600" />
          </div>
          {revenue_trend.length === 0 ? (
            <EmptyState title="No revenue yet" description="Paid orders will appear here once you start selling." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenue_trend}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-900 mb-1">Stock pulse</h3>
          <p className="text-sm text-ink-500 mb-4">Live health by product category</p>
          <StockPulse categories={category_health} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Pipeline</h3>
          {pipeline.length === 0 ? (
            <p className="text-sm text-ink-500">No customers yet.</p>
          ) : (
            <div className="space-y-3">
              {pipeline.map((row) => (
                <div key={row.status} className="flex items-center justify-between">
                  <Badge tone={row.status === "active" ? "good" : row.status === "lead" ? "brand" : "neutral"}>
                    {row.status}
                  </Badge>
                  <span className="text-sm font-medium text-ink-900 font-mono">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Top products</h3>
          {top_products.length === 0 ? (
            <p className="text-sm text-ink-500">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {top_products.map((p) => (
                <div key={p.product__name} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-900 truncate">{p.product__name}</span>
                  <span className="text-sm font-mono text-ink-500 shrink-0">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-900">Due soon</h3>
            <Clock className="w-4 h-4 text-ink-500" />
          </div>
          {upcoming_tasks.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing due in the next 7 days.</p>
          ) : (
            <div className="space-y-3">
              {upcoming_tasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-900 truncate">{t.title}</p>
                    <p className="text-xs text-ink-500">{formatDate(t.due_date)}</p>
                  </div>
                  {t.is_overdue && <Badge tone="bad">Overdue</Badge>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
