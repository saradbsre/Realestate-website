import { proxyRequest } from "@/lib/apiProxy";

export async function GET(req: Request) {
  return proxyRequest(req, "/api/admin/bookings");
}

export async function PATCH(req: Request) {
  return proxyRequest(req, "/api/admin/bookings");
}
