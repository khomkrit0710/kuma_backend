// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // ค้นหา admin จาก username
        const admin = await prisma.admin.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!admin) {
          return null;
        }

        // ตรวจสอบรหัสผ่าน
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!passwordMatch) {
          return null;
        }

        // ส่งค่ากลับเพื่อบันทึกใน session
        return {
          id: admin.id.toString(),
          username: admin.username,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ชั่วโมง
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };