import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en"); // Redirección temporal, el middleware manejará la lógica real
}
