
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

  // Function to validate token with WordPress API
  const validateToken = async (token: string) => {
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
        // Get or create user profile in our database
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

  // Function to store user profile in our database
  const storeUserProfile = async (userData: Partial<UserProfile>) => {
    try {
      // Check if the user already exists
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
        // Update existing user
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
        // Insert new user
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
      
      // Also store user data in localStorage for backward compatibility
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

  // Check for token in cookies on mount
  useEffect(() => {
    console.log("AuthProvider initialized");
    
    const checkToken = async () => {
      try {
        // Get token from cookies
        const token = getCookie('token');
        console.log("Token from cookie:", !!token);
        
        if (token) {
          // Validate token with WordPress API
          const isValid = await validateToken(token);
          
          if (!isValid) {
            console.log("Token is invalid, clearing");
            // Clear cookie if token is invalid
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking token:", error);
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);

  // Helper function to get a cookie value
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Helper function to set a cookie
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
        // Store token in cookie
        setCookie('token', data.data.access_token, 30); // 30 days expiry
        
        // Validate token to get user info and store in our db
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
    // Clear cookie
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Clear local storage
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
    // Redirect to login
    navigate('/login');
  };

  // Added debug output
  console.log("AuthProvider rendering, user:", !!user, "loading:", loading);

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
