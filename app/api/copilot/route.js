import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';



const serviceAdapter = new GroqAdapter({ model: "llama-3.1-8b-instant" });
const runtime = new CopilotRuntime();

export const POST = async (req) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilot',
  });

  return handleRequest(req);
};