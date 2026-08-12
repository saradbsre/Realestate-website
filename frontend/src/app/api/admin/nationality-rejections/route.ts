import { proxyRequest } from "@/lib/apiProxy";

export async function GET(req: Request) {
  return proxyRequest(req, "/api/admin/nationality-rejections");
}

export async function POST(req: Request) {
  return proxyRequest(req, "/api/admin/nationality-rejections");
}

export async function PATCH(req: Request) {
  return proxyRequest(req, "/api/admin/nationality-rejections");
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  return proxyRequest(req, `/api/admin/nationality-rejections?id=${id}`);
}
