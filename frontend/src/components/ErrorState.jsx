import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message = "We couldn’t load this information.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 rounded-[10px] bg-[#f2e5df] p-3 text-error"><AlertCircle size={22} /></div>
      <p className="max-w-md text-sm leading-6 text-ink" role="alert">{message}</p>
      {onRetry && <button className="btn-secondary mt-4" onClick={onRetry}><RefreshCw size={15} /> Try again</button>}
    </div>
  );
}
