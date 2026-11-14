import { BookOpen } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description = "Try adjusting your search or filters." }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-5 grid h-[62px] w-[74px] place-items-center rounded-[18px] border border-[#ded8cb] bg-[#f7f3e9] text-forest">
        <BookOpen size={25} strokeWidth={1.4} />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#fffdf8] bg-copper" />
      </div>
      <h3 className="font-display text-lg text-forest">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
