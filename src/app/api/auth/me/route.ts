import { meFromRequest } from "@/lib/auth-http";

export async function GET(request: Request) {
  return meFromRequest(request);
}
