import { NextFunction, Request, Response } from "express";

export type AdminSession = { username: string; role: string };

export function readSession(req: Request): AdminSession | null {
  try {
    const value = JSON.parse(Buffer.from(req.cookies.admin_session || "", "base64url").toString("utf8"));
    return typeof value.username === "string" && typeof value.role === "string" ? value : null;
  } catch { return null; }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session || !["Super Admin", "Manager", "Editor"].includes(session.role))
    return res.status(403).json({ error: "Unauthorized" });
  res.locals.admin = session;
  return next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session || session.role !== "Super Admin") return res.status(403).json({ error: "Unauthorized" });
  res.locals.admin = session;
  return next();
}
