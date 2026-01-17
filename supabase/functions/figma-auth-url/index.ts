import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { redirect_uri, state } = await req.json();

    const FIGMA_CLIENT_ID = Deno.env.get("FIGMA_CLIENT_ID");
    if (!FIGMA_CLIENT_ID) {
      throw new Error("FIGMA_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      redirect_uri,
      scope: "file_content:read,file_metadata:read,file_versions:read",
      state: state || crypto.randomUUID(),
      response_type: "code",
    });

    const authUrl = `https://www.figma.com/oauth?${params.toString()}`;

    return new Response(
      JSON.stringify({ url: authUrl, state: params.get("state") }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating auth URL:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
