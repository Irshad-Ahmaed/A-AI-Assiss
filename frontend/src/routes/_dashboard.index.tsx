import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/samayak/Card";
import {
  Activity,
  DoorOpen,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Samayak Admin" },
      {
        name: "description",
        content:
          "Live analytics: room utilisation, empty-room probability, under-running courses, and idle room-hours.",
      },
    ],
  }),
  component: DashboardPage,
});

interface Analytics {
  roomUtilisation?: number;
  perRoom?: Array<{ room: string; utilisation: number }>;
  emptyProbability?: Array<{ slot: string; probability: number }>;
  underRunning?: Array<{ code: string; name: string; gap: number }>;
  avgEmptyRoomHours?: number;
}

function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics");
        if (!cancelled) setData(res.data?.data ?? res.data ?? {});
      } catch {
        if (!cancelled) setError("Could not load analytics. Connect the API to populate this dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const utilisation = data?.roomUtilisation ?? null;
  const avgEmpty = data?.avgEmptyRoomHours ?? null;
  const underRunning = data?.underRunning ?? [];
  const emptyProb = data?.emptyProbability ?? [];
  const perRoom = data?.perRoom ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
        <p className="text-muted text-sm sm:text-base">
          Live analytics derived from the institution's timetable. Updates as new data is ingested.
        </p>
      </header>

      {error && (
        <div className="rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink-soft">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Room utilisation"
          value={utilisation !== null ? `${utilisation.toFixed(1)}%` : loading ? "…" : "—"}
          hint="Slots occupied vs available, department-wide."
        />
        <MetricCard
          icon={<DoorOpen className="h-5 w-5" />}
          label="Best empty-room window"
          value={
            emptyProb.length > 0
              ? `${(Math.max(...emptyProb.map((s) => s.probability)) * 100).toFixed(0)}%`
              : loading ? "…" : "—"
          }
          hint="Highest P(empty room) across periods I–IX."
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Under-running courses"
          value={underRunning.length.toString()}
          hint="Courses scheduled below their credit-implied contact hours."
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg empty room-hours / day"
          value={avgEmpty !== null ? avgEmpty.toFixed(1) : loading ? "…" : "—"}
          hint="Mean unscheduled hours across all rooms."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-ink">P(empty room) by period</h2>
              <TrendingUp className="h-4 w-4 text-brand-blue" />
            </div>
            <div className="h-[240px] sm:h-[260px]">
              {emptyProb.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emptyProb}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7eef7" />
                    <XAxis dataKey="slot" stroke="#7c8294" fontSize={12} />
                    <YAxis
                      stroke="#7c8294"
                      fontSize={12}
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    />
                    <Tooltip
                      formatter={(v: any) => `${(v * 100).toFixed(0)}%`}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e7eef7" }}
                    />
                    <Bar dataKey="probability" fill="url(#g1)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3DA1FF" />
                        <stop offset="100%" stopColor="#256199" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Ingest a timetable to see empty-room probabilities." />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-ink">Top utilised rooms</h2>
            </div>
            <div className="h-[240px] sm:h-[260px]">
              {perRoom.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perRoom.slice(0, 8)} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7eef7" />
                    <XAxis
                      type="number"
                      stroke="#7c8294"
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis type="category" dataKey="room" stroke="#7c8294" fontSize={12} width={80} />
                    <Tooltip
                      formatter={(v: any) => `${v}%`}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e7eef7" }}
                    />
                    <Bar dataKey="utilisation" fill="#3DA1FF" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No room utilisation data yet." />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-ink mb-4">Under-running courses</h2>
          {underRunning.length === 0 ? (
            <EmptyState text="All courses are meeting their scheduled contact hours." />
          ) : (
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="text-ink font-semibold border-b border-line">
                  <tr>
                    <th className="text-left px-5 sm:px-3 py-3">Code</th>
                    <th className="text-left px-5 sm:px-3 py-3">Course</th>
                    <th className="text-right px-5 sm:px-3 py-3">Gap (hrs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {underRunning.map((c) => (
                    <tr key={c.code} className="hover:bg-canvas-2/40">
                      <td className="px-5 sm:px-3 py-3 font-mono text-ink">{c.code}</td>
                      <td className="px-5 sm:px-3 py-3 text-ink-soft">{c.name}</td>
                      <td className="px-5 sm:px-3 py-3 text-right">
                        <span className="inline-flex rounded-full bg-warning/15 text-warning px-2.5 py-1 text-xs font-bold">
                          −{c.gap}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">{label}</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-deep to-brand-blue text-white shadow-sm">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-extrabold text-ink tracking-tight">{value}</div>
        <p className="mt-1.5 text-xs text-muted leading-snug">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted text-center px-4">
      {text}
    </div>
  );
}
