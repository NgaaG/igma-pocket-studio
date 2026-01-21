import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const processingRef = useRef(false);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = sessionStorage.getItem("figma_oauth_state");

    // Prevent double processing (React Strict Mode can cause this)
    if (code && state && !processingRef.current) {
      if (state !== storedState) {
        toast({
          title: "Authentication Error",
          description: "Invalid state parameter. Please try again.",
          variant: "destructive",
        });
        // Clear the URL params
        setSearchParams({});
        return;
      }

      processingRef.current = true;
      setIsProcessingCallback(true);
      
      // Clear the code from URL immediately to prevent reuse
      setSearchParams({});
      sessionStorage.removeItem("figma_oauth_state");
      
      handleOAuthCallback(code);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading && !isProcessingCallback) {
      navigate("/");
    }
  }, [user, isLoading, isProcessingCallback, navigate]);

  const handleOAuthCallback = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.functions.invoke("figma-callback", {
        body: { code, redirect_uri: redirectUri },
      });

      if (error) throw error;

      if (data.magic_link) {
        // Use the magic link to sign in
        window.location.href = data.magic_link;
      } else {
        toast({
          title: "Welcome!",
          description: `Signed in as ${data.user?.name || data.user?.email}`,
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Could not complete sign in. Please try again.",
        variant: "destructive",
      });
      setIsProcessingCallback(false);
    }
  };

  const startFigmaAuth = async () => {
    setIsAuthenticating(true);
    try {
      const redirectUri = `${window.location.origin}/auth`;
      const state = crypto.randomUUID();
      sessionStorage.setItem("figma_oauth_state", state);

      const { data, error } = await supabase.functions.invoke("figma-auth-url", {
        body: { redirect_uri: redirectUri, state },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Auth start error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Could not connect to Figma. Please try again.",
        variant: "destructive",
      });
      setIsAuthenticating(false);
    }
  };

  if (isLoading || isProcessingCallback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {isProcessingCallback ? "Signing you in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">PocketCanvas</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your calm companion for Figma on the go
          </p>
        </div>

        {/* Auth button */}
        <div className="space-y-4">
          <Button
            onClick={startFigmaAuth}
            disabled={isAuthenticating}
            className="w-full h-14 text-base font-medium bg-[#0d0d0d] hover:bg-[#1a1a1a] text-white"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 38 57"
                  fill="currentColor"
                >
                  <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
                  <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
                  <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
                  <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
                  <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
                </svg>
                Continue with Figma
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            We'll connect to your Figma account to access your files.
            <br />
            Your data stays secure.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
