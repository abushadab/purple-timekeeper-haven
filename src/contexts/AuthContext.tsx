import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  wordpress_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_id: number | null;
  subscription_status: string | null;
  subscription_next_payment: string | null;
  subscription_subtotal: string | null;
  token: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const validateToken = async (token: string) => {
    console.log("Attempting to validate token:", token ? token.substring(0, 10) + "..." : "no token");
    try {
      const response = await fetch('https://tabtracker.ai/wp-json/digits/v1/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: token,
        }),
      });

      const data = await response.json();
      console.log("Token validation response:", data);
      
      if (data.success) {
        console.log("Token validation successful for user:", data.user_id);
        await storeUserProfile({
          wordpress_user_id: data.user_id,
          email: data.user_email || '',
          first_name: data.user_firstname || null,
          last_name: data.user_lastname || null,
          subscription_id: data.subscription_id || null,
          subscription_status: data.subscription_status || null,
          subscription_next_payment: data.subscription_nextpayment || null,
          subscription_subtotal: data.subscription_subtotal || null,
          token: token,
        });
        return true;
      } else {
        console.error("Token validation failed:", data);
        return false;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  const storeUserProfile = async (userData: Partial<UserProfile>) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select()
        .eq('wordpress_user_id', userData.wordpress_user_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching user:", fetchError);
        throw fetchError;
      }

      let result;
      if (existingUser) {
        result = await supabase
          .from('user_profiles')
          .update({
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            subscription_id: userData.subscription_id,
            subscription_status: userData.subscription_status,
            subscription_next_payment: userData.subscription_next_payment,
            subscription_subtotal: userData.subscription_subtotal,
            token: userData.token,
            updated_at: new Date().toISOString(),
          })
          .eq('wordpress_user_id', userData.wordpress_user_id)
          .select();
          
        setUser({
          ...existingUser,
          ...userData,
          id: existingUser.id,
          wordpress_user_id: existingUser.wordpress_user_id,
        } as UserProfile);
      } else {
        result = await supabase
          .from('user_profiles')
          .insert({
            wordpress_user_id: userData.wordpress_user_id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            subscription_id: userData.subscription_id,
            subscription_status: userData.subscription_status,
            subscription_next_payment: userData.subscription_next_payment,
            subscription_subtotal: userData.subscription_subtotal,
            token: userData.token,
          })
          .select();
          
        if (result.data && result.data[0]) {
          setUser({
            ...result.data[0],
            ...userData,
          } as UserProfile);
        }
      }

      console.log("User profile stored:", result);
      
      const localUserData = {
        email: userData.email,
        firstName: userData.first_name || 'User', 
        lastName: userData.last_name || '',
        phone: '',
        avatar: null,
      };
      localStorage.setItem('user', JSON.stringify(localUserData));
      
      return result;
    } catch (error) {
      console.error("Error storing user profile:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("AuthProvider initialized");
    
    const checkToken = async () => {
      try {
        const token = getCookie('token');
        console.log("Token found in cookie:", token ? "Yes (length: " + token.length + ")" : "No");
        
        if (token) {
          console.log("About to validate token");
          const isValid = await validateToken(token);
          console.log("Token validation result:", isValid);
          
          if (!isValid) {
            console.log("Token is invalid, clearing");
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
        } else {
          console.log("No token found in cookies");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking token:", error);
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  const getCookie = (name: string): string | null => {
    console.log("Attempting to get cookie:", name);
    console.log("All cookies:", document.cookie);
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        console.log(`Found cookie ${name}:`, value ? "Value present (length: " + value.length + ")" : "Empty value");
        return value;
      }
    }
    console.log(`Cookie ${name} not found`);
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Signing in with:", email);
      
      const response = await fetch('https://tabtracker.ai/wp-json/digits/v1/login_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);
      
      if (data.success && data.data.access_token) {
        setCookie('token', data.data.access_token, 30);
        await validateToken(data.data.access_token);
        
        setLoading(false);
        return { error: null };
      } else {
        setLoading(false);
        return { 
          error: { 
            message: data.data?.message || "Login failed" 
          } 
        };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("Signing out");
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  console.log("AuthProvider rendering, user:", !!user, "loading:", loading);
  if (user) {
    console.log("User details:", {
      id: user.id,
      wordpress_user_id: user.wordpress_user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      subscription_status: user.subscription_status
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
