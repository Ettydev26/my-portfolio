import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import AdminProjectCard from "@/components/admin/AdminProjectCard";
import EditPanel from "@/components/admin/EditPanel";
import ProjectForm from "@/components/admin/ProjectForm";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { projects, loading, addProject, updateProject, deleteProject } =
    useProjects();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAddSubmit(values) {
    setSubmitting(true);
    try {
      await addProject(values);
      setAdding(false);
    } catch (e) {
      console.error(e);
      alert(`Could not add project: ${e.message}`); // replaced with toast in Task 17
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
      alert(`Could not save changes: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project) {
    try {
      await deleteProject(project.id);
    } catch (e) {
      console.error(e);
      alert(`Could not delete: ${e.message}`);
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
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <AdminProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setEditing(p)}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
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
    </div>
  );
};

export default AdminDashboard;
