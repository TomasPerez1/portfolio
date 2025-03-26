import { Spinner } from "@nextui-org/react";

export default function LangLoader() {
  return (
    <div className="h-screen bg-purple-600 flex items-center justify-center">
      <Spinner size="md" color="default" />
    </div>
  );
}
