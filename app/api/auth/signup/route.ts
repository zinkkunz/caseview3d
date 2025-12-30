import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ message: "Email taken" }, { status: 400 });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name: name || email.split("@")[0], role: "USER", plan: "FREE" } });
    return NextResponse.json({ message: "Success", userId: user.id }, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ message: "Error" }, { status: 500 }); }
}
