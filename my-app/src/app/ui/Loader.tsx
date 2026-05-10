// Status: KEEP (Phase 4 audit) — re-evaluate when redesign Nav/Hero land in Phase 5+
import { Skeleton } from "@heroui/react";

export default function Loader({ className }: { className: string }) {
  return (
    <Skeleton
      className={`min-w-[220px] min-h-[250px]  rounded-lg shadow-lg  bg-violet-950 ${className}`}
    >
      <div></div>
    </Skeleton>
  );
}
