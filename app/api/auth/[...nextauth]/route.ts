import NextAuth from "next-auth";
import { authConfig } from "@/app/(auth)/auth.config";

const handler: (request: Request) => Promise<Response> = NextAuth(
  authConfig
) as any;

export { handler as GET, handler as POST };
