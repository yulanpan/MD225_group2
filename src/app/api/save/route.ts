import { loadSaveFromRequest, saveFromRequest } from "@/lib/auth-http";

export async function GET(request: Request) {
  return loadSaveFromRequest(request);
}

export async function PUT(request: Request) {
  return saveFromRequest(request);
}
