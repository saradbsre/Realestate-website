import { NextResponse } from "next/server";

import { ADMIN_TOKEN_COOKIE } from "@/lib/adminJwt";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
