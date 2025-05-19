
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  last_access?: string;
  preferences?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UseAuthResult extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useSupabaseAuth = (): UseAuthResult => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(currentState => ({
          ...currentState,
          user: session?.user ?? null,
          session: session,
          isAuthenticated: !!session?.user,
        }));

        // Fetch user profile when auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setState(currentState => ({
            ...currentState,
            profile: null,
          }));
        }

        // Update last access time when user logs in
        if (event === 'SIGNED_IN' && session?.user) {
          updateLastAccess(session.user.id);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(currentState => ({
        ...currentState,
        user: session?.user ?? null,
        session: session,
        isAuthenticated: !!session?.user,
      }));

      // Fetch user profile if there's a session
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    })
    .finally(() => {
      setState(currentState => ({
        ...currentState,
        isLoading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setState(currentState => ({
        ...currentState,
        profile: data as Profile,
      }));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const updateLastAccess = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_access: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update last access:', error);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Falha na autenticação');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw new Error(error.message);
      
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar o registro.');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error instanceof Error ? error.message : 'Falha no cadastro');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      
      // Clear any local state if needed
      setState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao sair');
    }
  };

  const updateUserProfile = async (data: Partial<Profile>) => {
    try {
      if (!state.user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);
      
      if (error) throw new Error(error.message);
      
      // Update local profile state
      setState(currentState => ({
        ...currentState,
        profile: {
          ...(currentState.profile as Profile),
          ...data,
        },
      }));
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Update profile failed:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar perfil');
      throw error;
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
    updateUserProfile,
  };
};
