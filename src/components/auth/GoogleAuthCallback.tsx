
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { handleAuthCallback } from "@/services/googleAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const processAuth = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!user) {
          throw new Error('User not authenticated');
        }

        const result = await handleAuthCallback(code, user.id);
        
        if (result.success) {
          setStatus('success');
          toast.success('Conectado ao Google com sucesso!');
          // Redirect back to settings after a short delay
          setTimeout(() => {
            navigate('/settings');
          }, 2000);
        } else {
          throw new Error(result.error || 'Failed to authenticate with Google');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        toast.error('Falha na autenticação com o Google');
        // Redirect back to settings after a short delay
        setTimeout(() => {
          navigate('/settings');
        }, 3000);
      }
    };

    processAuth();
  }, [searchParams, user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processando autenticação</h1>
          <p className="text-muted-foreground">Por favor, aguarde enquanto concluímos a autenticação com o Google...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Autenticação bem-sucedida!</h1>
          <p className="text-muted-foreground">Você será redirecionado automaticamente...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Falha na autenticação</h1>
          <p className="text-muted-foreground">Não foi possível conectar com o Google. Você será redirecionado automaticamente...</p>
        </>
      )}
    </div>
  );
}
