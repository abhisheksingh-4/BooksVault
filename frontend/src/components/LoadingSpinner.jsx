export default function LoadingSpinner({ label = "Loading", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-12 text-sm text-muted ${className}`} role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d8d0c2] border-t-forest" />
      {label}…
    </div>
  );
}
