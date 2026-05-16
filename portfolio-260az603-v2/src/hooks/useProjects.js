import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TABLE = "projects";
const BUCKET = "project-images";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function uploadImage(file) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { image_url: data.publicUrl, image_path: path };
  }

  async function removeImage(path) {
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  }

  async function addProject({ file, ...fields }) {
    const { image_url, image_path } = await uploadImage(file);
    const nextOrder =
      (projects.length ? Math.max(...projects.map((p) => p.sort_order)) : 0) + 1;
    const row = {
      slug: slugify(fields.title),
      title: fields.title,
      description: fields.description,
      image_url,
      image_path,
      technologies: fields.technologies,
      categories: fields.categories,
      demo_url: fields.demo_url || null,
      code_url: fields.code_url || null,
      sort_order: nextOrder,
    };
    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) {
      await removeImage(image_path); // cleanup orphan
      throw new Error(error.message);
    }
    setProjects((cur) => [...cur, data]);
    return data;
  }

  async function updateProject(id, { file, ...fields }) {
    const existing = projects.find((p) => p.id === id);
    if (!existing) throw new Error("Project not found");

    let image_url = existing.image_url;
    let image_path = existing.image_path;
    if (file) {
      const uploaded = await uploadImage(file);
      image_url = uploaded.image_url;
      image_path = uploaded.image_path;
    }

    const updates = {
      slug: slugify(fields.title),
      title: fields.title,
      description: fields.description,
      image_url,
      image_path,
      technologies: fields.technologies,
      categories: fields.categories,
      demo_url: fields.demo_url || null,
      code_url: fields.code_url || null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (file) await removeImage(image_path);
      throw new Error(error.message);
    }
    if (file) await removeImage(existing.image_path);
    setProjects((cur) => cur.map((p) => (p.id === id ? data : p)));
    return data;
  }

  async function deleteProject(id) {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeImage(target.image_path);
    setProjects((cur) => cur.filter((p) => p.id !== id));
  }

  async function reorderProjects(orderedIds) {
    if (orderedIds.length !== projects.length) {
      throw new Error("reorderProjects: orderedIds length must match current projects");
    }
    const knownIds = new Set(projects.map((p) => p.id));
    for (const id of orderedIds) {
      if (!knownIds.has(id)) {
        throw new Error(`reorderProjects: unknown project id ${id}`);
      }
    }

    const previous = projects;
    const optimistic = orderedIds.map((id, i) => {
      const p = previous.find((x) => x.id === id);
      return { ...p, sort_order: i + 1 };
    });
    setProjects(optimistic);

    const updates = orderedIds.map((id, i) =>
      supabase.from(TABLE).update({ sort_order: i + 1 }).eq("id", id)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError) {
      await refetch(); // re-sync local state with whatever the DB now has
      throw new Error(firstError.error.message);
    }
  }

  return {
    projects,
    loading,
    error,
    refetch,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
  };
}
