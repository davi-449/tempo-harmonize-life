
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
