import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
export const dynamic = "force-dynamic";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return (
    <div className="admin-shell">
      <Sidebar email={user.email || "Administrator"} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
