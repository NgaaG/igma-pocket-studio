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
    const { code, redirect_uri } = await req.json();

    const FIGMA_CLIENT_ID = Deno.env.get("FIGMA_CLIENT_ID");
    const FIGMA_CLIENT_SECRET = Deno.env.get("FIGMA_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIGMA_CLIENT_ID || !FIGMA_CLIENT_SECRET) {
      throw new Error("Figma credentials not configured");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.figma.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: FIGMA_CLIENT_ID,
        client_secret: FIGMA_CLIENT_SECRET,
        redirect_uri,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Figma token error:", errorText);
      throw new Error("Failed to exchange code for token");
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Get user info from Figma
    const userResponse = await fetch("https://api.figma.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get Figma user info");
    }

    const figmaUser = await userResponse.json();
    const { id: figma_id, email, handle: name, img_url: avatar_url } = figmaUser;

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if user exists with this Figma ID
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("figma_id", figma_id)
      .single();

    let userId: string;

    if (existingProfile) {
      // User exists, update their profile
      userId = existingProfile.id;
      await supabase
        .from("profiles")
        .update({ email, name, avatar_url })
        .eq("id", userId);
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { figma_id, name, avatar_url },
      });

      if (authError) {
        // User might already exist with this email
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const found = existingUser.users.find((u) => u.email === email);
        if (found) {
          userId = found.id;
        } else {
          throw authError;
        }
      } else {
        userId = authData.user.id;
      }

      // Create or update profile
      await supabase.from("profiles").upsert({
        id: userId,
        figma_id,
        email,
        name,
        avatar_url,
      });
    }

    // Store tokens securely (using service role bypasses RLS)
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
    await supabase.from("figma_tokens").upsert({
      user_id: userId,
      access_token,
      refresh_token,
      expires_at: expiresAt,
    });

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: redirect_uri },
    });

    if (sessionError) {
      throw sessionError;
    }

    // Extract the token from the magic link
    const magicLink = sessionData.properties?.action_link;
    const tokenMatch = magicLink?.match(/token=([^&]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : null;

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: userId, email, name, avatar_url, figma_id },
        magic_link: magicLink,
        session_token: sessionToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Callback error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
