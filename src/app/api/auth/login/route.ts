import { loginFromRequest } from "@/lib/auth-http";

export async function POST(request: Request) {
  return loginFromRequest(request);
}
