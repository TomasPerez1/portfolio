// Status: KEEP (Phase 4 audit) — re-evaluate when redesign Nav/Hero land in Phase 5+
import { Spinner } from "@heroui/react";

export default function LangLoader() {
  return (
    <div className="h-screen bg-purple-700 bg-opacity-40 flex items-center justify-center">
      <Spinner size="md" color="default" />
    </div>
  );
}
