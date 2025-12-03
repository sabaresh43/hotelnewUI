import { handlers } from "@/auth";

// Force Node.js runtime for auth routes (not Edge Runtime)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
