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
import { BookOpen, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_dashboard/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Samayak Admin" },
      { name: "description", content: "Manage courses scoped per branch and semester." },
    ],
  }),
  component: CoursesPage,
});

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  semester: number;
  branch: { name: string; department: { shortCode: string } };
}

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [type, setType] = useState("LECTURE");
  const [semester, setSemester] = useState("");
  const [branchId, setBranchId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/courses?search=${search}&limit=100`);
      setCourses(res.data.data ?? []);
    } catch {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("/branches");
      const list = res.data.data ?? [];
      setBranches(list);
      if (list.length > 0) setBranchId(list[0].id);
    } catch {}
  };

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/courses", {
        code, name,
        credits: parseInt(credits),
        type,
        semester: parseInt(semester),
        branchId,
      });
      toast.success("Course created successfully");
      setIsModalOpen(false);
      fetchCourses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchCourses();
    } catch {}
  };

  const handleBulkImport = async (data: any[]) => {
    for (const row of data) {
      if (row.code && row.name && row.branchId) {
        try {
          const cr = parseInt(row.credits, 10);
          const sm = parseInt(row.semester, 10);
          await api.post("/courses", {
            code: row.code, name: row.name,
            credits: isNaN(cr) ? 3 : cr,
            type: row.type || "LECTURE",
            semester: isNaN(sm) ? 1 : sm,
            branchId: row.branchId,
          });
        } catch {}
      }
    }
    fetchCourses();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Courses</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">Manage academic courses and credits.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <BulkImport onImport={handleBulkImport} title="Import CSV" />
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
              <Input
                placeholder="Search courses by code or name..."
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
            ) : courses.length === 0 ? (
              <p className="text-center text-muted py-8">No courses found.</p>
            ) : (
              courses.map((c) => (
                <div key={c.id} className="rounded-card border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-brand-deep font-bold">{c.code}</div>
                      <div className="font-bold text-ink mt-0.5">{c.name}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {c.branch?.name} ({c.branch?.department?.shortCode})
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-canvas-2 px-2 py-1 font-medium text-ink">Sem {c.semester}</span>
                    <span className="rounded-md bg-canvas-2 px-2 py-1 font-medium text-ink">{c.credits} Cr</span>
                    <span className="rounded-md bg-canvas-2 px-2 py-1 font-medium text-ink">{c.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block rounded-xl border border-line bg-white overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-ink-soft">
              <thead className="bg-canvas-2/40 text-ink font-semibold border-b border-line">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Sem/Credits</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Loading...</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No courses found.</td></tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas-2/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-ink">{c.code}</td>
                      <td className="px-6 py-4">{c.name}</td>
                      <td className="px-6 py-4">
                        {c.branch?.name}{" "}
                        <span className="text-muted">({c.branch?.department?.shortCode})</span>
                      </td>
                      <td className="px-6 py-4">Sem {c.semester} · {c.credits} Cr</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Course">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Course Code</label>
              <Input required placeholder="CS101" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Name</label>
              <Input required placeholder="Intro to CS" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Credits</label>
              <Input required type="number" min="0" placeholder="3" value={credits} onChange={(e) => setCredits(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Semester</label>
              <Input required type="number" min="1" max="8" placeholder="1" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="LECTURE">Lecture</option>
                <option value="LAB">Lab</option>
                <option value="TUTORIAL">Tutorial</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Branch</label>
              <Select required value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
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
