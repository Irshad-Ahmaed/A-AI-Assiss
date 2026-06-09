import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/samayak/Button";
import { Input } from "@/components/samayak/Input";
import { Select } from "@/components/samayak/Select";
import { Modal } from "@/components/samayak/Modal";
import { Card, CardContent } from "@/components/samayak/Card";
import { BulkImport } from "@/components/samayak/BulkImport";
import { Users, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_dashboard/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty & Users — Samayak Admin" },
      { name: "description", content: "Manage faculty and platform users." },
    ],
  }),
  component: FacultyPage,
});

interface Faculty {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { name: string; shortCode: string };
}

function FacultyPage() {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/faculty?search=${search}&limit=100`);
      setFacultyList(res.data.data ?? []);
    } catch {
      setFacultyList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments?limit=100");
      const list = res.data.data ?? [];
      setDepartments(list);
      if (list.length > 0) setDepartmentId(list[0].id);
    } catch { }
  };

  useEffect(() => { fetchDepartments(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchFaculty, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/faculty", { name, email, password, departmentId });
      toast.success("Faculty added");
      setIsModalOpen(false);
      setName(""); setEmail(""); setPassword("");
      fetchFaculty();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this faculty member?")) return;
    try {
      await api.delete(`/faculty/${id}`);
      toast.success("Faculty removed");
      fetchFaculty();
    } catch { }
  };

  const handleBulkImport = async (data: any[]) => {
    for (const row of data) {
      if (row.name && row.email && row.password && row.departmentId) {
        try {
          await api.post("/faculty", {
            name: row.name, email: row.email,
            password: row.password, departmentId: row.departmentId,
          });
        } catch { }
      }
    }
    fetchFaculty();
  };

  const roleBadge = (role: string) => {
    const r = (role || "").toUpperCase();
    const map: Record<string, string> = {
      ADMIN: "bg-brand-deep/10 text-brand-deep ring-brand-deep/20",
      DEAN: "bg-warning/15 text-warning ring-warning/30",
      HOD: "bg-info/10 text-info ring-info/30",
      COORDINATOR: "bg-success/10 text-success ring-success/30",
      PROFESSOR: "bg-canvas-2 text-ink ring-line",
      FACULTY: "bg-canvas-2 text-ink ring-line",
    };
    return map[r] ?? "bg-canvas-2 text-ink ring-line";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Faculty & Users</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">Manage professors and platform users.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <BulkImport onImport={handleBulkImport} title="Import CSV" />
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Users className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
              <Input
                placeholder="Search faculty by name or email..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {isLoading ? (
              <p className="text-center text-muted py-8">Loading...</p>
            ) : facultyList.length === 0 ? (
              <p className="text-center text-muted py-8">No faculty members found.</p>
            ) : (
              facultyList.map((f) => (
                <div key={f.id} className="rounded-card border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate">{f.name}</div>
                      <div className="text-xs text-muted truncate">{f.email}</div>
                      <div className="text-xs text-muted mt-0.5 truncate">
                        {f.department ? `${f.department.name} (${f.department.shortCode})` : "No department"}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${roleBadge(f.role)}`}>
                      {f.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl border border-line bg-white overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm text-ink-soft">
              <thead className="bg-canvas-2/40 text-ink font-semibold border-b border-line">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Loading...</td></tr>
                ) : facultyList.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No faculty members found.</td></tr>
                ) : (
                  facultyList.map((f) => (
                    <tr key={f.id} className="hover:bg-canvas-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink">{f.name}</td>
                      <td className="px-6 py-4">{f.email}</td>
                      <td className="px-6 py-4">
                        {f.department ? (
                          <>{f.department.name} <span className="text-muted">({f.department.shortCode})</span></>
                        ) : (
                          <span className="text-muted italic">No Department</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${roleBadge(f.role)}`}>
                          {f.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
                          <Trash2 className="h-4 w-4 text-error" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Faculty Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Full Name</label>
            <Input required placeholder="Dr. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Email</label>
            <Input required type="email" placeholder="john.doe@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Temporary Password</label>
              <Input required type="password" placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Department</label>
              <Select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </Select>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
