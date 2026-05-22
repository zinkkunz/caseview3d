import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Developer Bypass",
            credentials: {
                email: { label: "Email", type: "text" }
            },
            async authorize(credentials) {
                // 오직 로컬 개발(development) 환경 또는 NEXTAUTH_URL이 localhost인 테스트 환경에서만 작동하도록 이중 가드
                const isLocal = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');
                if (!isLocal) {
                    throw new Error("보안 차단: 상용 환경에서는 이 기능을 호출할 수 없습니다.");
                }
                
                if (credentials?.email === 'zinsun0@gmail.com') {
                    const user = await prisma.user.upsert({
                        where: { email: 'zinsun0@gmail.com' },
                        update: { role: 'ADMIN' },
                        create: { email: 'zinsun0@gmail.com', role: 'ADMIN', name: 'Master Admin' }
                    });
                    return user as any;
                }
                return null;
            }
        })
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


