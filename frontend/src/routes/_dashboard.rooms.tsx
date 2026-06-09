import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/samayak/Button";
import { Input } from "@/components/samayak/Input";
import { Select } from "@/components/samayak/Select";
import { Modal } from "@/components/samayak/Modal";
import { Card, CardContent } from "@/components/samayak/Card";
import { BulkImport } from "@/components/samayak/BulkImport";
import { DoorOpen, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/_dashboard/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — Samayak Admin" },
      { name: "description", content: "Manage classrooms, labs, and other spaces." },
    ],
  }),
  component: RoomsPage,
});

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: string;
  department: { name: string; shortCode: string };
}

function RoomsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("CLASSROOM");
  const [departmentId, setDepartmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: roomsData, isPending: isLoading } = useQuery({
    queryKey: ["rooms", debouncedSearch],
    queryFn: () => api.get(`/rooms?search=${debouncedSearch}&limit=100`).then((res) => res.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments-list"], // Distinct query key for the dropdown data
    queryFn: () => api.get("/departments?limit=100").then((res) => res.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const rooms = roomsData ?? [];
  const departments = departmentsData ?? [];

  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/rooms", { roomNumber, capacity: parseInt(capacity), type, departmentId });
      toast.success("Room created successfully");
      setIsModalOpen(false);
      setRoomNumber("");
      setCapacity("");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success("Room deleted");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    } catch {}
  };

  const handleBulkImport = async (data: any[]) => {
    for (const row of data) {
      if (row.roomNumber && row.capacity && row.departmentId) {
        try {
          const c = parseInt(row.capacity, 10);
          await api.post("/rooms", {
            roomNumber: row.roomNumber,
            capacity: isNaN(c) ? 60 : c,
            type: row.type || "CLASSROOM",
            departmentId: row.departmentId,
          });
        } catch {}
      }
    }
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Rooms</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            Manage classrooms, labs, and other spaces.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <BulkImport onImport={handleBulkImport} title="Import CSV" />
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <DoorOpen className="h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
              <Input
                placeholder="Search rooms..."
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
            ) : rooms.length === 0 ? (
              <p className="text-center text-muted py-8">No rooms found.</p>
            ) : (
              rooms.map((r) => (
                <div key={r.id} className="rounded-card border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-ink">Room {r.roomNumber}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {r.department?.name} ({r.department?.shortCode})
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center rounded-md bg-canvas-2 px-2 py-1 font-medium text-ink">
                      {r.type}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-canvas-2 px-2 py-1 font-medium text-ink">
                      Cap. {r.capacity}
                    </span>
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
                  <th className="px-6 py-4">Room Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">Loading...</td></tr>
                ) : rooms.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No rooms found.</td></tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-canvas-2/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink">{room.roomNumber}</td>
                      <td className="px-6 py-4">
                        {room.department?.name}{" "}
                        <span className="text-muted">({room.department?.shortCode})</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-canvas-2 px-2 py-1 text-xs font-medium text-ink">
                          {room.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{room.capacity}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Room">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Room Number</label>
            <Input required placeholder="304A" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Capacity</label>
              <Input required type="number" min="1" placeholder="60" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="CLASSROOM">Classroom</option>
                <option value="LAB">Lab</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Department</label>
            <Select required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
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
