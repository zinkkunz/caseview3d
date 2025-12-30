import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || !user.password) {
            return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return NextResponse.json({ message: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword
            }
        });

        return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
