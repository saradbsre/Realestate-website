import { proxyRequest } from "@/lib/apiProxy";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/admin/bookings/${id}/passport`);
}
