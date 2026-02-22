export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // Admin routes are now protected by src/middleware.ts
    // No client-side auth checks are needed here.
    return <>{children}</>;
}
