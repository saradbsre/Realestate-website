import { proxyRequest } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/properties/${id}`);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/properties/${id}`);
}
