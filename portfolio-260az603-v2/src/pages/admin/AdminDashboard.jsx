import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import AdminProjectCard from "@/components/admin/AdminProjectCard";
import EditPanel from "@/components/admin/EditPanel";
import ProjectForm from "@/components/admin/ProjectForm";
import Toaster from "@/components/admin/Toaster";
import { pushToast } from "@/hooks/useToast";

const SortableCard = ({ project, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <AdminProjectCard
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { projects, loading, addProject, updateProject, deleteProject, reorderProjects } =
    useProjects();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const next = arrayMove(projects, oldIndex, newIndex);
    try {
      await reorderProjects(next.map((p) => p.id));
    } catch (e) {
      console.error(e);
      pushToast(`Could not reorder: ${e.message}`);
    }
  }

  async function handleAddSubmit(values) {
    setSubmitting(true);
    try {
      await addProject(values);
      setAdding(false);
    } catch (e) {
      console.error(e);
      pushToast(`Could not add project: ${e.message}`, { onRetry: () => handleAddSubmit(values) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(values) {
    setSubmitting(true);
    try {
      await updateProject(editing.id, values);
      setEditing(null);
    } catch (e) {
      console.error(e);
      pushToast(`Could not save changes: ${e.message}`, { onRetry: () => handleEditSubmit(values) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project) {
    try {
      await deleteProject(project.id);
    } catch (e) {
      console.error(e);
      pushToast(`Could not delete: ${e.message}`, { onRetry: () => handleDelete(project) });
    }
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl">Projects</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus size={16} /> Add new project
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-border bg-card/40" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">No projects yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click <span className="text-foreground">+ Add new project</span> to create your first one.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
            <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <SortableCard
                    key={project.id}
                    project={project}
                    onEdit={(p) => setEditing(p)}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </SortableContext>
        </DndContext>
      )}

      <EditPanel
        open={adding}
        title="Add new project"
        onClose={() => !submitting && setAdding(false)}
      >
        <ProjectForm
          onSubmit={handleAddSubmit}
          onCancel={() => setAdding(false)}
          submitting={submitting}
        />
      </EditPanel>

      <EditPanel
        open={!!editing}
        title="Edit project"
        onClose={() => !submitting && setEditing(null)}
      >
        {editing && (
          <ProjectForm
            initial={editing}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        )}
      </EditPanel>

      <Toaster />
    </div>
  );
};

export default AdminDashboard;
