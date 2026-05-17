import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

const ImageDropzone = ({ value, file, onFile, error: externalError }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const previewUrl = file ? URL.createObjectURL(file) : value || null;

  function validateAndSet(f) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      setError("Only PNG, JPEG, or WebP images are allowed.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image is too large (max 5 MB).");
      return;
    }
    setError(null);
    onFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function clear() {
    setError(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shownError = externalError || error;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-border bg-input/40 hover:border-primary/60"
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <UploadCloud size={28} />
            <p className="mt-2 text-sm">Drop image here or click to upload</p>
            <p className="mt-0.5 text-xs">PNG / JPEG / WebP, up to 5 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {shownError && <p className="mt-2 text-xs text-destructive">{shownError}</p>}
    </div>
  );
};

export default ImageDropzone;
