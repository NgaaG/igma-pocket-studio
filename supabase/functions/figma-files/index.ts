import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Get user's Figma token
    const { data: tokenData, error: tokenError } = await supabase
      .from("figma_tokens")
      .select("access_token, expires_at, refresh_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("No Figma token found - please re-authenticate");
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      // Refresh the token
      const FIGMA_CLIENT_ID = Deno.env.get("FIGMA_CLIENT_ID");
      const FIGMA_CLIENT_SECRET = Deno.env.get("FIGMA_CLIENT_SECRET");

      const refreshResponse = await fetch("https://www.figma.com/api/oauth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: FIGMA_CLIENT_ID!,
          client_secret: FIGMA_CLIENT_SECRET!,
          refresh_token: tokenData.refresh_token!,
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Token expired - please re-authenticate");
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      // Update stored tokens
      await supabase.from("figma_tokens").update({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || tokenData.refresh_token,
        expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
      }).eq("user_id", user.id);
    }

    // Fetch recent files from Figma
    const filesResponse = await fetch("https://api.figma.com/v1/me/files/recent", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!filesResponse.ok) {
      const errorText = await filesResponse.text();
      console.error("Figma files error:", errorText);
      throw new Error("Failed to fetch Figma files");
    }

    const filesData = await filesResponse.json();

    // Transform to our format
    const files = filesData.files?.map((file: any) => ({
      key: file.key,
      name: file.name,
      thumbnail_url: file.thumbnail_url,
      last_modified: file.last_modified,
      editor_type: file.editor_type, // "figma" or "figjam"
    })) || [];

    return new Response(
      JSON.stringify({ files }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Files fetch error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
