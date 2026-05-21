export default function LangLoader() {
  return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <span
        aria-label="Loading"
        role="status"
        className="block w-8 h-8 rounded-full border-2 border-line border-t-spark animate-spin"
      />
    </div>
  );
}
