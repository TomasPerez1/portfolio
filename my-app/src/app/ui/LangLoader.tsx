import { Spinner } from "@heroui/react";

export default function LangLoader() {
  return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <Spinner size="md" color="default" />
    </div>
  );
}
