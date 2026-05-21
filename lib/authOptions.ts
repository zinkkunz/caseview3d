import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.plan = user.plan;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.plan = token.plan;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: { signIn: "/login" },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};


