import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("Auth component mounted, current user:", user);
    console.log("Current session:", supabase.auth.getSession());
    
    if (user) {
      console.log("User already authenticated, navigating to home");
      navigate("/");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN') {
        console.log("Sign in successful, session:", session);
        try {
          // First, verify the session is valid
          const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
          console.log("Current session after sign in:", currentSession);

          if (sessionError) {
            console.error("Session error:", sessionError);
            setErrorMessage(getErrorMessage(sessionError));
            return;
          }

          if (!currentSession.session) {
            console.error("No valid session found after sign in");
            setErrorMessage("Authentication failed: No valid session");
            return;
          }

          // Then get the user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          console.log("User data:", userData);

          if (userError) {
            console.error("Error fetching user:", userError);
            setErrorMessage(getErrorMessage(userError));
            return;
          }

          // Verify we have the necessary OAuth tokens
          const provider = currentSession.session.user.app_metadata.provider;
          const tokens = currentSession.session.provider_token;
          console.log("Auth provider:", provider);
          console.log("Provider tokens:", tokens);

          if (!tokens && provider === 'google') {
            console.error("No provider tokens found for Google auth");
            setErrorMessage("Failed to get Google Calendar access. Please try again.");
            return;
          }

          console.log("Authentication successful, navigating to home");
          navigate("/");
        } catch (error) {
          console.error("Error during sign in process:", error);
          setErrorMessage("An unexpected error occurred during sign in");
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setErrorMessage("");
      }

      if (event === 'USER_UPDATED') {
        console.log("User updated event received");
      }
    });

    return () => {
      console.log("Auth component unmounting");
      subscription.unsubscribe();
    };
  }, [user, navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Full error details:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return `Invalid request: ${error.message}`;
        case 401:
          return `Authentication failed: ${error.message}`;
        case 404:
          return 'User not found.';
        default:
          return `Authentication error (${error.status}): ${error.message}`;
      }
    }
    return `Error: ${error.message}`;
  };

  return (
    <div className="container mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center p-4">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            providers={["google"]}
            queryParams={{
              access_type: 'offline',
              prompt: 'consent',
              scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.settings.readonly',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;