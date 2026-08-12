import { proxyRequest } from "@/lib/apiProxy";

export async function GET(req: Request) {
  return proxyRequest(req, "/api/admin/users");
}

export async function POST(req: Request) {
  return proxyRequest(req, "/api/admin/users");
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  return proxyRequest(req, `/api/admin/users?id=${id}`);
}
