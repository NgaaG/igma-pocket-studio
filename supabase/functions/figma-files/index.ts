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

      const refreshResponse = await fetch("https://api.figma.com/v1/oauth/refresh", {
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

    // First, get the user's profile to check for any cached files
    const { data: cachedFiles } = await supabase
      .from("cached_files")
      .select("*")
      .eq("user_id", user.id)
      .order("last_accessed_at", { ascending: false })
      .limit(20);

    // Try to get files from Figma - use /v1/files endpoint with specific file keys if we have cached ones
    // Otherwise, return empty and let user add files manually or through search
    const files: any[] = [];

    // If we have cached file keys, fetch their current data from Figma
    if (cachedFiles && cachedFiles.length > 0) {
      for (const cachedFile of cachedFiles) {
        try {
          const fileResponse = await fetch(`https://api.figma.com/v1/files/${cachedFile.figma_file_key}?depth=1`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            files.push({
              key: cachedFile.figma_file_key,
              name: fileData.name || cachedFile.title,
              thumbnail_url: fileData.thumbnailUrl || cachedFile.thumbnail_url,
              last_modified: fileData.lastModified,
              editor_type: fileData.editorType || cachedFile.file_type,
              is_bookmarked: cachedFile.is_bookmarked,
            });
          }
        } catch (e) {
          // If individual file fetch fails, use cached data
          files.push({
            key: cachedFile.figma_file_key,
            name: cachedFile.title,
            thumbnail_url: cachedFile.thumbnail_url,
            last_modified: cachedFile.last_accessed_at,
            editor_type: cachedFile.file_type,
            is_bookmarked: cachedFile.is_bookmarked,
          });
        }
      }
    }

    console.log(`Returning ${files.length} files for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        files,
        message: files.length === 0 ? "No files yet. Open a Figma file link to add it to your library." : undefined
      }),
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
