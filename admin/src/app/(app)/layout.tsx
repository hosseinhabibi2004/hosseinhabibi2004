import { AuthGate } from "@/features/auth/AuthGate";
import { ShellLayout } from "@/features/shell/ShellLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <ShellLayout>{children}</ShellLayout>
    </AuthGate>
  );
}
