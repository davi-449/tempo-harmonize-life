
import { Button } from "@/components/ui/button";
import { initiateGoogleAuth } from "@/services/googleAuth";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        // Para login/registro com Google via Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // O redirecionamento é tratado pelo Supabase
      } else {
        // Para integração do Google (Calendar, Fit, etc.)
        initiateGoogleAuth();
      }
    } catch (error) {
      console.error("Google auth error:", error);
      toast.error("Erro na autenticação com Google");
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white hover:bg-gray-50 text-black border border-kairos-blue-deep dark:border-kairos-purple"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg
          className="mr-2 h-4 w-4 text-kairos-blue-deep"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
      )}
      Continuar com Google
    </Button>
  );
}
