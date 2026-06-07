import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);
const TOKEN_NAME = "el_token";
const TOKEN_DAYS = 7;

/** 签发 JWT */
export async function signToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_DAYS}d`)
    .sign(JWT_SECRET);
}

/** 验证 JWT，返回 userId 或 null */
export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return Number(payload.sub);
  } catch {
    return null;
  }
}

/** 从 Cookie 获取当前用户 ID（服务端用） */
export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** 设置登录 Cookie */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

/** 验证密码，返回 userId 或 null */
export async function verifyPassword(password: string): Promise<number | null> {
  // 必须在服务端环境调用（有 Prisma 依赖）
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findFirst({ where: { username: "admin" } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user.id : null;
}
