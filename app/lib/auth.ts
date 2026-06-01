import {
    createReceptionist,
    deactivateReceptionist,
    listReceptionists,
    updateReceptionistPassword,
    validateReceptionistPassword,
    type ReceptionistPublic,
} from "./userStore";

export type { ReceptionistPublic };

export type AuthUser = {
    email: string;
    name: string;
    role: "Admin" | "Receptionist";
};

function getAdminCredentials() {
    return {
        email: (process.env.EC_ADMIN_EMAIL ?? "admin@hubinterior.com").toLowerCase(),
        password: process.env.EC_ADMIN_PASSWORD ?? "admin123",
        name: process.env.EC_ADMIN_NAME ?? "Admin User",
    };
}

/** Admin password is server-only — never stored in client or receptionist data files. */
export function validateAdmin(email: string, password: string): AuthUser | null {
    const admin = getAdminCredentials();
    const normalized = email.trim().toLowerCase();
    if (normalized !== admin.email) return null;
    if (password !== admin.password) return null;
    return {
        email: admin.email,
        name: admin.name,
        role: "Admin",
    };
}

export async function validateUser(
    email: string,
    password: string
): Promise<AuthUser | null> {
    const admin = validateAdmin(email, password);
    if (admin) return admin;

    const receptionist = await validateReceptionistPassword(email, password);
    if (!receptionist) return null;

    return {
        email: receptionist.email,
        name: receptionist.name,
        role: "Receptionist",
    };
}

export {
    listReceptionists,
    createReceptionist,
    deactivateReceptionist,
    updateReceptionistPassword,
};
