import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get("ec-auth")?.value === "true";
    redirect(isAuthenticated ? "/dashboard" : "/login");
}
