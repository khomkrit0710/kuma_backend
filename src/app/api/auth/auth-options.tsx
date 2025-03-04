// src/app/api/auth/auth-options.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

interface UserCredentials {
  username: string;
  password: string;
}

interface UserData {
  id: string;
  username: string;
  role: string;
}

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
  }

  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
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

        const { username, password } = credentials as UserCredentials;

        // ค้นหา admin จาก username
        const admin = await prisma.admin.findUnique({
          where: {
            username: username,
          },
        });

        if (!admin) {
          return null;
        }

        // ตรวจสอบรหัสผ่าน
        const passwordMatch = await bcrypt.compare(
          password,
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
        } as UserData;
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
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