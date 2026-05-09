import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonLine({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton rounded-lg", className)} style={style} />;
}

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {[78, 55, 88, 45, 70].map((width, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5">
          <SkeletonLine className="h-4 rounded-md" style={{ width: `${width}%` } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
}

export function RemindersListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 md:p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
          <SkeletonLine className="w-5 h-5 rounded-full flex-none" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:px-12 md:py-16">
      <SkeletonLine className="h-11 w-2/3 mb-10" />
      <div className="flex flex-col gap-5">
        <SkeletonLine className="h-5 w-full" />
        <SkeletonLine className="h-5 w-5/6" />
        <SkeletonLine className="h-5 w-4/5" />
        <SkeletonLine className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function TodaySectionSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-3 border-b border-white/[0.06] last:border-0 flex items-center gap-3">
          <SkeletonLine className="w-4 h-4 rounded-full flex-none" />
          <SkeletonLine className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
