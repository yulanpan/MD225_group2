import { logoutFromRequest } from "@/lib/auth-http";

export async function POST(request: Request) {
  return logoutFromRequest(request);
}
