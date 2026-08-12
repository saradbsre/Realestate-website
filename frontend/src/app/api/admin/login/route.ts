import { proxyRequest } from "@/lib/apiProxy";

export async function POST(req: Request) {
  return proxyRequest(req, "/api/admin/login");
}
