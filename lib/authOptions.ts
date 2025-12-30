import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                    if (!user) return null;
                    const isValid = await bcrypt.compare(credentials.password, user.password!);
                    if (!isValid) return null;
                    return { id: user.id, email: user.email, name: user.name || "User", role: user.role, plan: user.plan };
                } catch (e) {
                    console.error(e);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
                KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "login",
                },
            },
            profile(profile) {
                // Ensure email is NEVER null to avoid Prisma unique constraint issues
                const kakaoId = profile.id.toString();
                const email = profile.kakao_account?.email || `kakao_${kakaoId}@kakao.com`;
                const name = profile.kakao_account?.profile?.nickname || "Kakao User";
                
                console.log("[AUTH DEBUG] Kakao Profile Mapping Success:", { kakaoId, email });
                
                return {
                    id: kakaoId,
                    name: name,
                    email: email,
                    image: profile.kakao_account?.profile?.thumbnail_image_url || null,
                    role: 'USER',
                    plan: 'FREE'
                };
            }
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID || "",
            clientSecret: process.env.NAVER_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }: any) {
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
    trustHost: true,
    debug: true,
};
