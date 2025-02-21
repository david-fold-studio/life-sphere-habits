
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { TitleBar } from "@/components/TitleBar";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const checkSession = async () => {
      console.log("Auth component mounted, current user:", user);
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Initial session check:", session);
      
      if (error) {
        console.error("Session check error:", error);
        return;
      }

      if (session) {
        console.log("Valid session found, navigating to home");
        navigate("/");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN') {
        console.log("Sign in successful, session:", session);
        if (!session) {
          console.error("No session data available after sign in");
          setErrorMessage("Authentication failed: No session data");
          return;
        }

        try {
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
    <div className="flex min-h-screen flex-col">
      <TitleBar 
        title="Welcome Back" 
        description="Sign in to your account to continue" 
      />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
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
              providers={[]}
              view="sign_in"
              showLinks={true}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
