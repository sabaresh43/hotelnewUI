import { CopilotBackend } from "@copilotkit/backend";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json();

  const backend = new CopilotBackend({
    runtime: {
      enabled: true,
      model: "gpt-4o-mini",
      apiKey: process.env.COPILOT_API_KEY,
    },
  });

  // NEW API — REQUIRED
  const response = await backend.run(body);

  return Response.json(response);
}
