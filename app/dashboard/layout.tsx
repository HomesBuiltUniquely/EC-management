import { DashboardProviders } from "../Component/DashboardProviders";
import { NavBar } from "../Component/NavBar";
import { getServerSession, type SessionUser } from "../lib/session";

export type { SessionUser };

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getServerSession();

    return (
        <DashboardProviders user={user}>
            <div className="min-h-screen bg-gray-50">
                <NavBar user={user} />
                {children}
            </div>
        </DashboardProviders>
    );
}
