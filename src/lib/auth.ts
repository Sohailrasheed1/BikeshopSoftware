import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Skander Staff Credentials",
      credentials: {
        username: { label: "Username / Mobile", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Demo shop credentials
        if (credentials.username === "admin" && credentials.password === "admin123") {
          return {
            id: "u-1",
            name: "Skander (Owner / Admin)",
            email: "admin@skanderparts.pk",
            role: "admin",
          };
        }

        if (credentials.username === "staff" && credentials.password === "staff123") {
          return {
            id: "u-2",
            name: "Shop Assistant",
            email: "staff@skanderparts.pk",
            role: "staff",
          };
        }

        // Allow owner Sohail login as well
        if (credentials.username.toLowerCase() === "sohail" && credentials.password === "sohail123") {
          return {
            id: "u-3",
            name: "Sohail Rasheed (Manager)",
            email: "sohail@skanderparts.pk",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "skander_spare_parts_super_secret_jwt_key_2026_xyz",
};
