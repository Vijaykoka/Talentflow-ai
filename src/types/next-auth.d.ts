import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "SUPER_ADMIN" | "EXECUTIVE" | "TA_COORDINATOR" | "HIRING_MANAGER" | "AGENCY_PARTNER" | "TA_TEAM" | "HIRING_TEAM";
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "EXECUTIVE" | "TA_COORDINATOR" | "HIRING_MANAGER" | "AGENCY_PARTNER" | "TA_TEAM" | "HIRING_TEAM";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPER_ADMIN" | "EXECUTIVE" | "TA_COORDINATOR" | "HIRING_MANAGER" | "AGENCY_PARTNER" | "TA_TEAM" | "HIRING_TEAM";
  }
}