import { NextResponse } from "next/server";

import {
  ADMIN_TOKEN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  createAdminToken,
} from "@/lib/adminJwt";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      authenticated: true,
      username,
      role: "Super Admin",
    });
    response.cookies.set(ADMIN_TOKEN_COOKIE, createAdminToken(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_TOKEN_MAX_AGE,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
