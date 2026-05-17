import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageDropzone from "./ImageDropzone";
import TagInput from "./TagInput";
import CategoryToggles from "./CategoryToggles";

const ProjectForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [file, setFile] = useState(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      technologies: initial?.technologies ?? [],
      categories: initial?.categories ?? [],
      demo_url: initial?.demo_url ?? "",
      code_url: initial?.code_url ?? "",
    },
  });

  async function submit(values) {
    const isNew = !initial;
    if (isNew && !file) {
      setError("image", { type: "required", message: "An image is required." });
      return;
    }
    if (!values.categories.length) {
      setError("categories", {
        type: "required",
        message: "Pick at least one category.",
      });
      return;
    }
    clearErrors();
    await onSubmit({ ...values, file });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex h-full flex-col gap-5">
      <div>
        <label className="text-sm text-muted-foreground">Image</label>
        <div className="mt-1">
          <ImageDropzone
            value={initial?.image_url}
            file={file}
            onFile={(f) => {
              setFile(f);
              if (f) clearErrors("image");
            }}
            error={errors.image?.message}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Title</label>
        <input
          {...register("title", { required: "Title is required." })}
          className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Description</label>
        <textarea
          rows={4}
          {...register("description", { required: "Description is required." })}
          className="mt-1 w-full resize-y rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Technologies</label>
        <Controller
          control={control}
          name="technologies"
          render={({ field }) => (
            <div className="mt-1">
              <TagInput value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Categories</label>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <div className="mt-1">
              <CategoryToggles
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  if (v.length) clearErrors("categories");
                }}
              />
            </div>
          )}
        />
        {errors.categories && (
          <p className="mt-1 text-xs text-destructive">{errors.categories.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-muted-foreground">Demo URL</label>
          <input
            type="url"
            {...register("demo_url")}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Code URL</label>
          <input
            type="url"
            {...register("code_url")}
            placeholder="https://github.com/..."
            className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-secondary/70 px-4 py-2 text-sm hover:border-primary/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
