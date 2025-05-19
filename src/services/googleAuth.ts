import { supabase } from '@/integrations/supabase/client';

// Configuração do OAuth do Google
const googleConfig = {
  clientId: '237044112540-6130kmfv9daos4758tpqbdf2aampdb63.apps.googleusercontent.com',
  redirectUri: window.location.origin + '/auth/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read'
  ]
};

// Função para iniciar o fluxo de autenticação
export const initiateGoogleAuth = () => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConfig.clientId}&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(googleConfig.scopes.join(' '))}&access_type=offline&prompt=consent`;
  
  window.location.href = authUrl;
};

// Função para processar o callback de autenticação
export const handleAuthCallback = async (code: string, userId: string) => {
  try {
    // Trocar o código por tokens de acesso e refresh
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleConfig.clientId,
        redirect_uri: googleConfig.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Error exchanging code for tokens:', tokenData.error);
      return { success: false, error: tokenData.error_description || 'Falha ao obter tokens de acesso' };
    }
    
    // Armazenar tokens no Supabase
    const { data, error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scopes: googleConfig.scopes,
        sync_status: { last_sync: null },
      })
      .select();
    
    if (error) {
      console.error('Error storing Google tokens:', error);
      return { success: false, error: 'Falha ao armazenar tokens de autenticação' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in handleAuthCallback:', error);
    return { success: false, error: 'Erro na autenticação com o Google' };
  }
};

// Função para obter tokens armazenados
export const getTokens = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();
    
    if (error || !data) return null;
    
    // Verificar se o token expirou
    const tokenExpired = new Date(data.token_expires_at) < new Date();
    
    if (tokenExpired && data.refresh_token) {
      return await refreshToken(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
};

// Função para atualizar o token quando expirar
async function refreshToken(integration: any) {
  try {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: integration.refresh_token,
        client_id: googleConfig.clientId,
        grant_type: 'refresh_token',
      }),
    });

    const refreshData = await refreshResponse.json();
    
    if (refreshData.error) {
      console.error('Error refreshing token:', refreshData.error);
      return null;
    }
    
    // Atualizar tokens no Supabase
    const { data, error } = await supabase
      .from('user_integrations')
      .update({
        access_token: refreshData.access_token,
        token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      })
      .eq('id', integration.id)
      .select();
    
    if (error) {
      console.error('Error updating refreshed token:', error);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in refreshToken:', error);
    return null;
  }
}

// Add the missing ensureValidToken function
export const ensureValidToken = async (userId: string): Promise<string | null> => {
  const tokens = getTokens(userId);
  if (!tokens) return null;

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at && tokens.expires_at > now) {
    return tokens.access_token;
  }

  // Token expired, try to refresh
  try {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (error || !data.refresh_token) {
      console.error('Failed to get refresh token:', error);
      return null;
    }

    // Here you would implement the token refresh logic
    // This is a simplified example - in a real app, you'd call Google's token refresh endpoint
    const newTokens = await refreshGoogleToken(data.refresh_token);
    
    if (newTokens) {
      await supabase
        .from('user_integrations')
        .update({
          access_token: newTokens.access_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider', 'google');

      return newTokens.access_token;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }

  return null;
};

// Helper function to refresh the Google token
async function refreshGoogleToken(refreshToken: string) {
  // In a real implementation, you would call Google's token endpoint
  // This is a placeholder
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: 'YOUR_CLIENT_ID', // Replace with your Google Client ID
        client_secret: 'YOUR_CLIENT_SECRET', // Replace with your Google Client Secret
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error refreshing Google token:', error);
  }
  return null;
}
