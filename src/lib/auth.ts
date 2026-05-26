import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "talentflow-ai-fallback-secret-2026-production",
  providers: [
    Credentials({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const role = credentials.role as "TA_TEAM" | "HIRING_TEAM";

        if (!email.includes("@")) {
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
              email,
              password,
              role: role || "TA_TEAM",
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "TA_TEAM" | "HIRING_TEAM",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "TA_TEAM" | "HIRING_TEAM";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});