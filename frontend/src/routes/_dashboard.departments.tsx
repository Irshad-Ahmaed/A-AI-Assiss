import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/samayak/Button";
import { Input } from "@/components/samayak/Input";
import { Modal } from "@/components/samayak/Modal";
import { Card, CardContent } from "@/components/samayak/Card";
import { BulkImport } from "@/components/samayak/BulkImport";
import { Building2, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_dashboard/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Samayak Admin" },
      { name: "description", content: "Manage university departments and branches." },
    ],
  }),
  component: DepartmentsPage,
});

interface Department {
  id: string;
  name: string;
  shortCode: string;
  _count: { rooms: number; branches: number };
  createdAt: string;
}

function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: departmentsData, isPending: isLoading } = useQuery<Department[]>({
    queryKey: ["departments", debouncedSearch],
    queryFn: () => api.get(`/departments?search=${debouncedSearch}&limit=100`).then((res) => res.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const departments = departmentsData ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/departments", { name, shortCode });
      toast.success("Department created successfully");
      setIsModalOpen(false);
      setName("");
      setShortCode("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    } catch {}
  };

  const handleBulkImport = async (data: any[]) => {
    for (const row of data) {
      if (row.name && row.shortCode) {
        try {
          await api.post("/departments", { name: row.name, shortCode: row.shortCode });
        } catch {}
      }
    }
    queryClient.invalidateQueries({ queryKey: ["departments"] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Departments</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            Manage university departments and faculties.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <BulkImport onImport={handleBulkImport} title="Import CSV" />
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Building2 className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
              <Input
                placeholder="Search departments..."
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
            ) : departments.length === 0 ? (
              <p className="text-center text-muted py-8">No departments found.</p>
            ) : (
              departments.map((dept) => (
                <div key={dept.id} className="rounded-card border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-ink">{dept.name}</div>
                      <span className="mt-1 inline-flex items-center rounded-md bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-brand-deep ring-1 ring-inset ring-brand-blue/20">
                        {dept.shortCode}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-canvas-2/60 px-3 py-2">
                      <div className="text-muted">Rooms</div>
                      <div className="font-bold text-ink">{dept._count?.rooms ?? 0}</div>
                    </div>
                    <div className="rounded-md bg-canvas-2/60 px-3 py-2">
                      <div className="text-muted">Branches</div>
                      <div className="font-bold text-ink">{dept._count?.branches ?? 0}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl border border-line bg-white overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-ink-soft">
              <thead className="bg-canvas-2/40 text-ink font-semibold border-b border-line">
                <tr>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Short Code</th>
                  <th className="px-6 py-4">Rooms</th>
                  <th className="px-6 py-4">Branches</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Loading...</td></tr>
                ) : departments.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No departments found.</td></tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-canvas-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink">{dept.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-brand-blue/10 px-2 py-1 text-xs font-medium text-brand-deep ring-1 ring-inset ring-brand-blue/20">
                          {dept.shortCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">{dept._count?.rooms ?? 0}</td>
                      <td className="px-6 py-4">{dept._count?.branches ?? 0}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Name</label>
            <Input required placeholder="Computer Science" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Short Code</label>
            <Input required placeholder="CSE" className="uppercase" value={shortCode} onChange={(e) => setShortCode(e.target.value)} />
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
