import { supabase } from "@/integrations/supabase/client";

// Google OAuth configuration
export const googleConfig = {
  clientId: '237044112540-6130kmfv9daos4758tpqbdf2aampdb63.apps.googleusercontent.com',
  redirectUri: 'tempo-harmonize-life.lovable.app/auth/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read'
  ]
};

// Generate the Google OAuth URL
export const getGoogleAuthUrl = () => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConfig.clientId}&redirect_uri=${encodeURIComponent(googleConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(googleConfig.scopes.join(' '))}&access_type=offline&prompt=consent`;
  
  return authUrl;
};

// Start the Google authentication flow
export const initiateGoogleAuth = () => {
  window.location.href = getGoogleAuthUrl();
};

// Store tokens securely in Supabase or localStorage as a temporary solution
export const storeTokens = async (userId: string, tokens: GoogleTokens) => {
  try {
    // Store in localStorage for now
    localStorage.setItem(`google_tokens_${userId}`, JSON.stringify(tokens));
    
    // In future will store in Supabase
    // await supabase
    //   .from('user_tokens')
    //   .upsert({ user_id: userId, tokens: tokens, provider: 'google' });

    return true;
  } catch (error) {
    console.error("Failed to store tokens:", error);
    return false;
  }
};

// Get tokens from storage
export const getTokens = (userId: string): GoogleTokens | null => {
  try {
    const tokensString = localStorage.getItem(`google_tokens_${userId}`);
    if (!tokensString) return null;
    
    return JSON.parse(tokensString);
  } catch (error) {
    console.error("Failed to retrieve tokens:", error);
    return null;
  }
};

// Process the authentication callback code
export const handleAuthCallback = async (code: string, userId: string) => {
  try {
    // This would normally be handled by a server-side function to keep client_secret private
    // For now, we'll implement a simplified version
    
    // In real implementation, call an edge function to exchange code for tokens
    // const { data, error } = await supabase.functions.invoke('exchange-google-code', {
    //   body: { code }
    // });
    
    // Mocking a successful token retrieval
    const mockTokens: GoogleTokens = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_at: Date.now() + 3600 * 1000 // 1 hour from now
    };
    
    // Store the tokens
    await storeTokens(userId, mockTokens);
    
    return { success: true, tokens: mockTokens };
  } catch (error) {
    console.error("Error processing authentication callback:", error);
    return { success: false, error };
  }
};

// Check if access token is expired and refresh if needed
export const ensureValidToken = async (userId: string): Promise<string | null> => {
  try {
    const tokens = getTokens(userId);
    if (!tokens) return null;
    
    const currentTime = Date.now();
    
    // Check if token is expired
    if (tokens.expires_at && tokens.expires_at <= currentTime) {
      // Token is expired, need to refresh
      // In real implementation, call an edge function to refresh token
      // const { data, error } = await supabase.functions.invoke('refresh-google-token', {
      //   body: { refresh_token: tokens.refresh_token }
      // });
      
      // Mock a successful token refresh
      const newTokens: GoogleTokens = {
        access_token: `mock_refreshed_access_token_${Date.now()}`,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + 3600 * 1000 // 1 hour from now
      };
      
      // Store the new tokens
      await storeTokens(userId, newTokens);
      
      return newTokens.access_token;
    }
    
    return tokens.access_token;
  } catch (error) {
    console.error("Error ensuring valid token:", error);
    return null;
  }
};

// Interface for Google OAuth tokens
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}
