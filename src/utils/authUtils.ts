import { supabase } from "@/integrations/supabase/client";

// Helper function to get the WordPress user ID from local storage
export const getWordpressUserId = async (): Promise<string | null> => {
  try {
    // First try to get user from session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If we have a session with a user, return it
    if (sessionData.session?.user?.id) {
      return sessionData.session.user.id;
    }

    // Otherwise, check if we have a token stored in cookies
    const token = getCookie('token');
    if (!token) {
      return null;
    }

    // If we have a token, validate it
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
    if (data.success && data.user_id) {
      return data.user_id;
    }

    return null;
  } catch (error) {
    console.error("Error getting WordPress user ID:", error);
    return null;
  }
};

// Helper function to get cookie
export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};
