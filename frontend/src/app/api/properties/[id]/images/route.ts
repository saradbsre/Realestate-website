import { proxyRequest } from "@/lib/apiProxy";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/properties/${id}/images`);
}
