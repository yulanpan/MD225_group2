import { registerFromRequest } from "@/lib/auth-http";

export async function POST(request: Request) {
  return registerFromRequest(request);
}
